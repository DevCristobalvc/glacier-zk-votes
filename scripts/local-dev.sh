#!/bin/bash

# 🛠️ Local development script for Glacier
# Starts local blockchain, contract deployment and frontend

set -e

echo "🏔️ Glacier Local Development Setup"
echo "=================================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Local configuration
ANVIL_PORT=8545
ANVIL_CHAIN_ID=31337

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v forge &> /dev/null; then
        log_error "Foundry no está instalado. Instala desde https://getfoundry.sh/"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js no está instalado"
        exit 1
    fi
    
    if ! command -v circom &> /dev/null; then
        log_warning "Circom no está instalado globalmente, intentando usar local..."
    fi
    
    log_success "Dependencias OK"
}

# Start local blockchain
start_anvil() {
    log_info "Starting local blockchain (Anvil)..."
    
    # Matar procesos existentes en el puerto
    lsof -ti:$ANVIL_PORT | xargs kill -9 2>/dev/null || true
    
    # Iniciar Anvil en background
    anvil --port $ANVIL_PORT --chain-id $ANVIL_CHAIN_ID --accounts 10 --balance 1000 > anvil.log 2>&1 &
    ANVIL_PID=$!
    
    # Guardar PID para cleanup
    echo $ANVIL_PID > .anvil.pid
    
    # Esperar a que Anvil inicie
    sleep 3
    
    if ps -p $ANVIL_PID > /dev/null; then
        log_success "Local blockchain started (PID: $ANVIL_PID)"
        log_info "RPC URL: http://localhost:$ANVIL_PORT"
        log_info "Chain ID: $ANVIL_CHAIN_ID"
    else
        log_error "Failed to start Anvil"
        cat anvil.log
        exit 1
    fi
}

# Compile ZK circuits
setup_circuits() {
    log_info "Setting up ZK circuits..."
    cd zk-circuits
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Compile circuit
    npm run compile
    
    # Setup (puede tomar tiempo la primera vez)
    log_warning "Setup de trusted setup puede tomar varios minutos..."
    npm run setup
    
    cd ..
    log_success "Circuitos ZK configurados"
}

# Deploy contratos localmente
deploy_local_contracts() {
    log_info "Desplegando contratos localmente..."
    cd contracts
    
    # Install dependencies
    forge install foundry-rs/forge-std --no-commit 2>/dev/null || true
    
    # Build
    forge build
    
    # Deploy con clave privada por defecto de Anvil
    LOCAL_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    LOCAL_RPC="http://localhost:$ANVIL_PORT"
    
    # Deploy Verifier
    log_info "Desplegando Verifier..."
    VERIFIER_OUTPUT=$(forge create src/Verifier.sol:Groth16Verifier \
        --rpc-url $LOCAL_RPC \
        --private-key $LOCAL_PRIVATE_KEY \
        --json)
    
    VERIFIER_ADDRESS=$(echo $VERIFIER_OUTPUT | jq -r '.deployedTo')
    log_success "Verifier: $VERIFIER_ADDRESS"
    
    # Deploy VeilVoting
    log_info "Desplegando VeilVoting..."
    export VERIFIER_ADDRESS=$VERIFIER_ADDRESS
    
    VOTING_OUTPUT=$(forge script script/Deploy.s.sol:DeployScript \
        --rpc-url $LOCAL_RPC \
        --private-key $LOCAL_PRIVATE_KEY \
        --broadcast)
    
    VOTING_ADDRESS=$(echo "$VOTING_OUTPUT" | grep "VeilVoting deployed to:" | awk '{print $4}')
    log_success "VeilVoting: $VOTING_ADDRESS"
    
    cd ..
    
    # Guardar configuración local
    cat > local-config.json << EOF
{
  "network": "localhost",
  "chainId": $ANVIL_CHAIN_ID,
  "rpcUrl": "$LOCAL_RPC",
  "contracts": {
    "Verifier": "$VERIFIER_ADDRESS",
    "VeilVoting": "$VOTING_ADDRESS"
  },
  "accounts": {
    "deployer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "voter1": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "voter2": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
  }
}
EOF
    
    # Update frontend config
    mkdir -p glacier-vote/src/config
    cat > glacier-vote/src/config/contracts.ts << EOF
// Local development contract addresses
export const LOCAL_CONFIG = {
  chainId: $ANVIL_CHAIN_ID,
  name: 'Localhost',
  rpcUrl: '$LOCAL_RPC',
  contracts: {
    Verifier: '$VERIFIER_ADDRESS' as const,
    VeilVoting: '$VOTING_ADDRESS' as const,
  }
} as const;

export const CONTRACT_ADDRESSES = LOCAL_CONFIG.contracts;
export const CHAIN_CONFIG = LOCAL_CONFIG;
EOF
    
    log_success "Contratos desplegados localmente"
}

# Iniciar frontend
start_frontend() {
    log_info "Starting frontend..."
    cd glacier-vote
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Iniciar en background
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../.frontend.pid
    
    cd ..
    
    # Esperar a que inicie
    sleep 5
    
    if ps -p $FRONTEND_PID > /dev/null; then
        log_success "Frontend iniciado (PID: $FRONTEND_PID)"
        log_info "URL: http://localhost:5173"
    else
        log_error "Failed to start frontend"
        cat frontend.log
        exit 1
    fi
}

# Cleanup al salir
cleanup() {
    log_info "Limpiando procesos..."
    
    if [ -f .anvil.pid ]; then
        ANVIL_PID=$(cat .anvil.pid)
        kill $ANVIL_PID 2>/dev/null || true
        rm .anvil.pid
    fi
    
    if [ -f .frontend.pid ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm .frontend.pid
    fi
    
    log_success "Cleanup completed"
}

# Trap para cleanup
trap cleanup EXIT INT TERM

# Función principal
main() {
    echo "🏔️ Starting local development environment..."
    echo "Timestamp: $(date)"
    echo ""
    
    check_dependencies
    start_local_chain
    setup_circuits
    deploy_local_contracts
    start_frontend
    
    echo ""
    log_success "🎉 Entorno local iniciado!"
    echo ""
    echo "📋 URLs:"
    echo "  • Frontend: http://localhost:5173"
    echo "  • RPC: http://localhost:$ANVIL_PORT"
    echo ""
    echo "📝 Contratos:"
    echo "  • Verifier: $VERIFIER_ADDRESS"
    echo "  • VeilVoting: $VOTING_ADDRESS"
    echo ""
    echo "📄 Logs:"
    echo "  • Anvil: anvil.log"
    echo "  • Frontend: frontend.log"
    echo ""
    echo "⚠️  Presiona Ctrl+C para detener todos los servicios"
    
    # Mantener script vivo
    while true; do
        sleep 10
    done
}

# Execute main function
main "$@"
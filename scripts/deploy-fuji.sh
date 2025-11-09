#!/bin/bash

# 🚀 Complete deploy script for Avalanche Fuji Testnet
# Glacier - Anonymous Voting System

set -e

echo "🗻 Glacier Deploy Script - Avalanche Fuji"
echo "======================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logs con colores
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check required environment variables
check_env_vars() {
    log_info "Checking environment variables..."
    
    if [ -z "$PRIVATE_KEY" ]; then
        log_error "PRIVATE_KEY is not defined"
        exit 1
    fi
    
    if [ -z "$AVALANCHE_FUJI_RPC_URL" ]; then
        log_warning "AVALANCHE_FUJI_RPC_URL not defined, using default"
        export AVALANCHE_FUJI_RPC_URL="https://api.avax-test.network/ext/bc/C/rpc"
    fi
    
    log_success "Variables de entorno OK"
}

# Build de circuitos ZK
build_circuits() {
    log_info "Compilando circuitos ZK..."
    cd zk-circuits
    
    # Install dependencies si no existen
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Compile and setup
    npm run compile
    npm run setup
    
    cd ..
    log_success "Circuitos ZK compilados"
}

# Deploy de contratos
deploy_contracts() {
    log_info "Desplegando contratos en Avalanche Fuji..."
    cd contracts
    
    # Verificar que existe el verifier generado
    if [ ! -f "src/Verifier.sol" ]; then
        log_error "Verifier.sol not found. Run build_circuits first"
        exit 1
    fi
    
    # Install Foundry dependencies
    forge install foundry-rs/forge-std --no-commit 2>/dev/null || true
    forge install OpenZeppelin/openzeppelin-contracts --no-commit 2>/dev/null || true
    
    # Build contracts
    forge build
    
    # Get verifier address (required for VeilVoting)
    log_info "Desplegando Verifier contract..."
    VERIFIER_OUTPUT=$(forge create src/Verifier.sol:Groth16Verifier \
        --rpc-url $AVALANCHE_FUJI_RPC_URL \
        --private-key $PRIVATE_KEY \
        --json)
    
    VERIFIER_ADDRESS=$(echo $VERIFIER_OUTPUT | jq -r '.deployedTo')
    
    if [ "$VERIFIER_ADDRESS" == "null" ] || [ -z "$VERIFIER_ADDRESS" ]; then
        log_error "Failed to deploy Verifier contract"
        log_error "$VERIFIER_OUTPUT"
        exit 1
    fi
    
    log_success "Verifier deployed: $VERIFIER_ADDRESS"
    
    # Deploy VeilVoting contract
    log_info "Desplegando VeilVoting contract..."
    export VERIFIER_ADDRESS=$VERIFIER_ADDRESS
    
    VOTING_OUTPUT=$(forge script script/Deploy.s.sol:DeployScript \
        --rpc-url $AVALANCHE_FUJI_RPC_URL \
        --broadcast \
        --verify 2>/dev/null || forge script script/Deploy.s.sol:DeployScript \
        --rpc-url $AVALANCHE_FUJI_RPC_URL \
        --broadcast)
    
    # Extraer dirección del VeilVoting del output
    VOTING_ADDRESS=$(echo "$VOTING_OUTPUT" | grep "VeilVoting deployed to:" | awk '{print $4}')
    
    if [ -z "$VOTING_ADDRESS" ]; then
        log_error "Failed to extract VeilVoting address"
        log_error "$VOTING_OUTPUT"
        exit 1
    fi
    
    cd ..
    log_success "VeilVoting deployed: $VOTING_ADDRESS"
    
    # Guardar direcciones para el frontend
    cat > deployed-addresses.json << EOF
{
  "network": "avalanche-fuji",
  "chainId": 43113,
  "contracts": {
    "Verifier": "$VERIFIER_ADDRESS",
    "VeilVoting": "$VOTING_ADDRESS"
  },
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "explorer": {
    "verifier": "https://testnet.snowtrace.io/address/$VERIFIER_ADDRESS",
    "veilVoting": "https://testnet.snowtrace.io/address/$VOTING_ADDRESS"
  }
}
EOF
    
    log_success "Direcciones guardadas en deployed-addresses.json"
}

# Update frontend config
update_frontend_config() {
    log_info "Updating frontend configuration..."
    
    if [ ! -f "deployed-addresses.json" ]; then
        log_error "deployed-addresses.json not found"
        exit 1
    fi
    
    # Create frontend configuration file
    cat > frontend/src/config/contracts.ts << EOF
// Auto-generated contract addresses - DO NOT EDIT MANUALLY
// Generated at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

export const AVALANCHE_FUJI_CONFIG = {
  chainId: 43113,
  name: 'Avalanche Fuji Testnet',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorer: 'https://testnet.snowtrace.io',
  contracts: {
    Verifier: '$VERIFIER_ADDRESS' as const,
    VeilVoting: '$VOTING_ADDRESS' as const,
  }
} as const;

export const CONTRACT_ADDRESSES = AVALANCHE_FUJI_CONFIG.contracts;
export const CHAIN_CONFIG = AVALANCHE_FUJI_CONFIG;
EOF
    
    log_success "Configuración del frontend actualizada"
}

# Build frontend
build_frontend() {
    log_info "Building frontend..."
    cd glacier-vote
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    npm run build
    cd ..
    
    log_success "Frontend built successfully"
}

# Función principal
main() {
    echo "🏔️  Starting complete Glacier deployment..."
    echo "Network: Avalanche Fuji Testnet"
    echo "Timestamp: $(date)"
    echo ""
    
    check_env_vars
    build_circuits
    deploy_contracts
    update_frontend_config
    build_frontend
    
    echo ""
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Resumen:"
    echo "  • Verifier: $VERIFIER_ADDRESS"
    echo "  • VeilVoting: $VOTING_ADDRESS"
    echo "  • Explorer: https://testnet.snowtrace.io"
    echo "  • Frontend build: glacier-vote/dist/"
    echo ""
    echo "📝 Próximos pasos:"
    echo "  1. Verificar contratos en Snowtrace"
    echo "  2. Create test election"
    echo "  3. Test complete voting flow"
    echo ""
}

# Execute main function
main "$@"
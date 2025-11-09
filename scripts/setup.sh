#!/bin/bash

# 🚀 Complete initial setup for Glacier
# Installs dependencies and configures development environment

set -e

echo "🏔️ Glacier Setup - Anonymous Voting System"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    log_info "OS detected: $OS"
}

# Check Node.js
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js found: $NODE_VERSION"
        
        # Check minimum version (v18)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            log_error "Node.js v18+ required, found: $NODE_VERSION"
            log_info "Install from: https://nodejs.org/"
            exit 1
        fi
    else
        log_error "Node.js not found"
        log_info "Install from: https://nodejs.org/"
        exit 1
    fi
}

# Install/Verify Foundry
setup_foundry() {
    if command -v forge &> /dev/null; then
        FORGE_VERSION=$(forge --version | head -n1)
        log_success "Foundry found: $FORGE_VERSION"
    else
        log_info "Installing Foundry..."
        
        if [ "$OS" == "windows" ]; then
            log_warning "On Windows, install Foundry manually from: https://getfoundry.sh/"
            exit 1
        else
            curl -L https://foundry.paradigm.xyz | bash
            source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null || true
            foundryup
        fi
        
        if command -v forge &> /dev/null; then
            log_success "Foundry installed successfully"
        else
            log_error "Error installing Foundry"
            exit 1
        fi
    fi
}

# Install ZK tools
setup_zk_tools() {
    log_info "Installing ZK tools..."
    
    # Circom
    if command -v circom &> /dev/null; then
        CIRCOM_VERSION=$(circom --version)
        log_success "Circom found: $CIRCOM_VERSION"
    else
        log_info "Installing Circom..."
        npm install -g circom@latest
    fi
    
    # snarkjs is installed as local dependency
    log_success "ZK tools configured"
}

# Install workspace dependencies
install_dependencies() {
    log_info "Installing workspace dependencies..."
    
    # Root dependencies
    npm install
    
    # Contracts (Foundry)
    log_info "Setting up contract dependencies..."
    cd contracts
    forge install foundry-rs/forge-std --no-commit 2>/dev/null || true
    forge install OpenZeppelin/openzeppelin-contracts --no-commit 2>/dev/null || true
    cd ..
    
    # ZK Circuits
    log_info "Installing ZK circuit dependencies..."
    cd zk-circuits
    npm install
    cd ..
    
    # Frontend
    log_info "Installing frontend dependencies..."
    cd glacier-vote
    npm install
    cd ..
    
    log_success "All dependencies installed"
}

# Create example configuration file
create_env_example() {
    log_info "Creating example configuration file..."
    
    cat > .env.example << 'EOF'
# Glacier Environment Configuration

# Deployer private key (for testnet/mainnet)
PRIVATE_KEY=your_private_key_here

# Avalanche RPC URLs
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_MAINNET_RPC_URL=https://api.avax.network/ext/bc/C/rpc

# Snowtrace API Key (for contract verification)
SNOWTRACE_API_KEY=your_snowtrace_api_key

# Development settings
NODE_ENV=development
VITE_ENVIRONMENT=development
EOF
    
    log_success ".env.example file created"
    log_warning "Copy .env.example to .env and configure your variables"
}

# Make scripts executable
make_scripts_executable() {
    log_info "Setting up script permissions..."
    chmod +x scripts/*.sh
    log_success "Scripts configured"
}

# Verify setup
verify_setup() {
    log_info "Verifying setup..."
    
    # Test contract build
    cd contracts
    if forge build --quiet; then
        log_success "✓ Contracts compile correctly"
    else
        log_error "✗ Error compiling contracts"
    fi
    cd ..
    
    # Test frontend build
    cd glacier-vote
    if npm run build --quiet > /dev/null 2>&1; then
        log_success "✓ Frontend compiles correctly"
    else
        log_error "✗ Error compiling frontend"
    fi
    cd ..
    
    log_success "Verification completed"
}

# Main function
main() {
    echo "🏔️ Starting Glacier setup..."
    echo "This script will configure everything needed for development"
    echo ""
    
    detect_os
    check_node
    setup_foundry
    setup_zk_tools
    install_dependencies
    create_env_example
    make_scripts_executable
    verify_setup
    
    echo ""
    log_success "🎉 Setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Configure your .env file (copy from .env.example)"
    echo "  2. For local development: npm run dev"
    echo "  3. For Fuji deploy: npm run deploy:fuji"
    echo ""
    echo "📚 Useful commands:"
    echo "  • npm run dev                 - Local development"
    echo "  • npm run build               - Complete build"
    echo "  • npm run test                - Contract tests"
    echo "  • npm run circuits:compile    - Compile ZK circuits"
    echo "  • npm run deploy:fuji         - Deploy to Fuji testnet"
    echo ""
    echo "🔗 Documentation: README.md"
    echo "🐛 Issues: https://github.com/glacier-zk-votes/glacier/issues"
    echo ""
}

# Execute main function
main "$@"
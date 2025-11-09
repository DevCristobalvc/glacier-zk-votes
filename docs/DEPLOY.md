# Deployment Guide - Glacier

**Complete instructions for deploying Glacier on Avalanche**

---

## Prerequisites

### Required Software

1. **Node.js v18+**
   ```bash
   node --version  # Check version
   ```

2. **Foundry**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

3. **Circom & snarkjs**
   ```bash
   npm install -g circom snarkjs
   ```

### Initial Setup

1. **Clone and configure**
   ```bash
   git clone <repo-url>
   cd glacier-monorepo
   npm run setup
   ```

2. **Environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

### .env File

```bash
# Deployer private key
PRIVATE_KEY=0x1234...

# Avalanche RPC URLs
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_MAINNET_RPC_URL=https://api.avax.network/ext/bc/C/rpc

# Snowtrace API Key (for verification)
SNOWTRACE_API_KEY=your_api_key_here
```

## Deploy to Fuji Testnet

### Automatic Method (Recommended)

```bash
# Complete deploy with one command
./scripts/deploy-fuji.sh
```

This script:
1. Compiles ZK circuits
2. Generates verifier contract
3. Deploys contracts to Fuji
4. Updates frontend configuration
5. Builds frontend

### Manual Method

#### 1. Compile ZK Circuits

```bash
cd zk-circuits
npm install
npm run compile
npm run setup
cd ..
```

#### 2. Deploy Contracts

```bash
cd contracts

# Install dependencies
forge install

# Deploy Verifier
forge create src/Verifier.sol:Groth16Verifier \
  --rpc-url $AVALANCHE_FUJI_RPC_URL \
  --private-key $PRIVATE_KEY

# Deploy VeilVoting (replace VERIFIER_ADDRESS)
export VERIFIER_ADDRESS=0x...
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $AVALANCHE_FUJI_RPC_URL \
  --broadcast \
  --verify

cd ..
```

#### 3. Actualizar Frontend

```bash
# Create configuration file
cat > frontend/src/config/contracts.ts << EOF
export const AVALANCHE_FUJI_CONFIG = {
  chainId: 43113,
  contracts: {
    Verifier: '0x...' as const,
    VeilVoting: '0x...' as const,
  }
} as const;
EOF
```

#### 4. Build Frontend

```bash
cd glacier-vote
npm run build
cd ..
```

## Deploy to Mainnet

⚠️ **WARNING**: Mainnet deployment requires complete security audit.

### Preparation

1. **Contract audit**
2. **Exhaustive testnet testing**
3. **Trusted setup ceremony**
4. **Security review**

### Deploy

```bash
# Change RPC URL to mainnet
export AVALANCHE_MAINNET_RPC_URL=https://api.avax.network/ext/bc/C/rpc

# Use script with mainnet configuration
NETWORK=mainnet ./scripts/deploy-fuji.sh
```

## Local Development

### Start Local Environment

```bash
# Start local blockchain + contracts + frontend
./scripts/local-dev.sh
```

This starts:
- **Anvil**: Local blockchain on port 8545
- **Contracts**: Automatic local deployment
- **Frontend**: Dev server at http://localhost:5173

### Local URLs

- **Frontend**: http://localhost:5173
- **RPC**: http://localhost:8545
- **Chain ID**: 31337

## Post-Deploy Verification

### 1. Verify Contracts

Visit Snowtrace to verify:
- **Fuji**: https://testnet.snowtrace.io
- **Mainnet**: https://snowtrace.io

### 2. Functionality Test

```bash
# Test básico de contratos
cd contracts
forge test -vvv

# ZK Circuits Test
cd ../zk-circuits
npm run prove
```

### 3. Create Test Election

```bash
# Example script (create if needed)
node scripts/create-test-election.js
```

## Troubleshooting

### Common Errors

#### 1. "Verifier.sol not found"
```bash
# Solución: Recompilar circuitos
cd zk-circuits
npm run setup
```

#### 2. "Invalid proof"
```bash
# Verificar que el circuito y verifier coinciden
# Recompilar todo el pipeline ZK
npm run circuits:compile
npm run circuits:setup
```

#### 3. "Transaction reverted"
```bash
# Verificar gas limit y validez de inputs
# Revisar logs del contrato
```

#### 4. Frontend no conecta
```bash
# Check configuration file
cat frontend/src/config/contracts.ts

# Verificar network en wallet coincide
```

### Logs y Debugging

#### Foundry Logs
```bash
# Deploy con logs verbosos
forge script script/Deploy.s.sol --rpc-url $RPC_URL -vvvv
```

#### ZK Circuit Debug
```bash
# Información del circuito
cd zk-circuits
snarkjs r1cs info build/vote_verifier.r1cs
```

#### Frontend Debug
```bash
# Dev mode with source maps
cd frontend
npm run dev
```

## Configuración Avanzada

### Custom RPC

```bash
# Usar RPC personalizado
export AVALANCHE_FUJI_RPC_URL=https://your-custom-rpc.com
```

### Gas Optimization

```bash
# Deploy con gas price específico
forge create --gas-price 25000000000 ...
```

### Batch Operations

For multiple elections or batch operations, create custom scripts in `scripts/`:

```javascript
// scripts/batch-deploy.js
const elections = [...];
for (const election of elections) {
  await deployElection(election);
}
```

## Monitoreo Post-Deploy

### 1. Contract Events

Monitor eventos `VoteCast` y `ElectionCreated`:

```javascript
// Example with ethers.js
contract.on("VoteCast", (encryptedVote, nullifier, electionId) => {
  console.log(`New vote in election ${electionId}`);
});
```

### 2. Performance Metrics

- Proof generation time
- Gas used per transaction
- Voting throughput

### 3. Security Monitoring

- Nullifiers duplicados (no debería ocurrir)
- Pruebas inválidas rechazadas
- Actividad sospechosa

## Actualizaciones

### Upgrade de Contratos

⚠️ Los contratos actuales no son upgradeable. Para nuevas versiones:

1. Deploy nuevos contratos
2. Migrar estado si necesario
3. Actualizar frontend
4. Comunicar cambios a usuarios

### Upgrade de Circuitos

1. Modify .circom files
2. Recompile and perform new setup
3. Deploy new verifier
4. Update VeilVoting if necessary

---

**Support**: For issues, create an issue in the GitHub repository.

**Additional documentation**: See `docs/ARCHITECTURE.md` for technical details.
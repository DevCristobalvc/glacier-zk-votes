import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import snarkjs from 'snarkjs';

const CIRCUIT_NAME = 'vote_verifier';
const BUILD_DIR = './build';
const PTAU_DIR = './ptau';

console.log('🔑 Setting up trusted setup...');

// Create directories if they don't exist
if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
}
if (!fs.existsSync(PTAU_DIR)) {
    fs.mkdirSync(PTAU_DIR, { recursive: true });
}

const r1csFile = path.join(BUILD_DIR, `${CIRCUIT_NAME}.r1cs`);
const ptauFile = path.join(PTAU_DIR, 'powersOfTau28_hez_final_15.ptau');
const zkeyFile = path.join(BUILD_DIR, `${CIRCUIT_NAME}.zkey`);
const vkeyFile = path.join(BUILD_DIR, `${CIRCUIT_NAME}_vkey.json`);

try {
    // Verify R1CS file exists
    if (!fs.existsSync(r1csFile)) {
        throw new Error('R1CS file not found. Run npm run compile first');
    }

    // Download powers of tau if it doesn't exist
    if (!fs.existsSync(ptauFile)) {
        console.log('📥 Downloading powers of tau ceremony...');
        console.log('⚠️  For production, use project-specific ceremony');
        
        // Using pre-computed ptau
        execSync(`wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_15.ptau -O ${ptauFile}`, {
            stdio: 'inherit'
        });
    }

    // Setup phase 2 - generate zkey
    console.log('🔐 Generating zkey (setup phase 2)...');
    await snarkjs.groth16.setup(r1csFile, ptauFile, zkeyFile);

    // Export verification key
    console.log('🔓 Exporting verification key...');
    const vKey = await snarkjs.zKey.exportVerificationKey(zkeyFile);
    fs.writeFileSync(vkeyFile, JSON.stringify(vKey, null, 2));

    // Generate Solidity verifier contract
    console.log('📝 Generating verifier contract...');
    const solidityVerifier = await snarkjs.zKey.exportSolidityVerifier(zkeyFile);
    
    const verifierPath = '../contracts/src/Verifier.sol';
    fs.writeFileSync(verifierPath, solidityVerifier);

    console.log('✅ Setup completed successfully!');
    console.log(`🔑 ZKey: ${zkeyFile}`);
    console.log(`🔓 Verification Key: ${vkeyFile}`);
    console.log(`📄 Verifier contract: ${verifierPath}`);

} catch (error) {
    console.error('❌ Setup error:', error.message);
    
    // Cleanup on error
    [zkeyFile, vkeyFile].forEach(file => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    });
    
    process.exit(1);
}
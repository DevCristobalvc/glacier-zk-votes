import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CIRCUIT_NAME = 'vote_verifier';
const BUILD_DIR = './build';
const CIRCUIT_FILE = `./circuits/${CIRCUIT_NAME}.circom`;

console.log('🔧 Compiling ZK circuit...');

// Create build directory if it doesn't exist
if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
}

try {
    // Compile circuit with circom
    console.log('📝 Compiling with circom...');
    execSync(`circom ${CIRCUIT_FILE} --r1cs --wasm --sym -o ${BUILD_DIR}`, {
        stdio: 'inherit'
    });

    // Verify generated files
    const r1csFile = path.join(BUILD_DIR, `${CIRCUIT_NAME}.r1cs`);
    const wasmFile = path.join(BUILD_DIR, `${CIRCUIT_NAME}_js`, `${CIRCUIT_NAME}.wasm`);
    
    if (fs.existsSync(r1csFile) && fs.existsSync(wasmFile)) {
        console.log('✅ Circuit compiled successfully!');
        console.log(`📄 R1CS: ${r1csFile}`);
        console.log(`🔗 WASM: ${wasmFile}`);
        
        // Show circuit information
        console.log('\n📊 Circuit information:');
        execSync(`snarkjs r1cs info ${r1csFile}`, { stdio: 'inherit' });
        
    } else {
        throw new Error('Output files not found');
    }
    
} catch (error) {
    console.error('❌ Error compiling circuit:', error.message);
    process.exit(1);
}
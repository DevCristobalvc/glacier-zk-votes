import fs from 'fs';
import path from 'path';
import snarkjs from 'snarkjs';
import { buildPoseidon } from 'circomlib';

const CIRCUIT_NAME = 'vote_verifier';
const BUILD_DIR = './build';

console.log('🔍 Generating ZK proof...');

async function generateProof() {
    try {
        // Load required files
        const wasmFile = path.join(BUILD_DIR, `${CIRCUIT_NAME}_js`, `${CIRCUIT_NAME}.wasm`);
        const zkeyFile = path.join(BUILD_DIR, `${CIRCUIT_NAME}.zkey`);
        
        if (!fs.existsSync(wasmFile) || !fs.existsSync(zkeyFile)) {
            throw new Error('Circuit files not found. Run npm run build first');
        }

        // Initialize Poseidon
        const poseidon = await buildPoseidon();

        // Sample data to generate proof
        const input = {
            // Private inputs
            identitySecret: "12345678901234567890", // In production, derived from wallet
            votePlaintext: "1", // Vote option (0, 1, 2, etc.)
            merkleProof: new Array(20).fill("0"), // Merkle tree proof
            merkleIndices: new Array(20).fill("0"), // Path indices
            nonce: "98765432109876543210", // Random nonce
            
            // Public inputs
            merkleRoot: poseidon(["12345678901234567890"]).toString(), // Mock root
            nullifierHash: poseidon(["12345678901234567890", "1"]).toString(), // nullifier
            ciphertextHash: poseidon(["1", "98765432109876543210"]).toString(), // ciphertext hash
            electionId: "1", // Election ID
            maxVoteOptions: "3" // Maximum number of options
        };

        console.log('📋 Test input:', {
            votePlaintext: input.votePlaintext,
            electionId: input.electionId,
            maxVoteOptions: input.maxVoteOptions
        });

        // Generate witness
        console.log('🧮 Calculating witness...');
        const { witness } = await snarkjs.groth16.fullProve(input, wasmFile, zkeyFile);

        // Generate proof
        console.log('🔐 Generating SNARK proof...');
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmFile, zkeyFile);

        // Format proof for Solidity
        const solidityProof = [
            proof.pi_a[0], proof.pi_a[1],
            proof.pi_b[0][1], proof.pi_b[0][0], proof.pi_b[1][1], proof.pi_b[1][0],
            proof.pi_c[0], proof.pi_c[1]
        ];

        console.log('✅ Proof generated successfully!');
        console.log('\n📊 Results:');
        console.log('🔢 Public Signals:', publicSignals);
        console.log('🔐 Proof (first 2 elements):', solidityProof.slice(0, 2));

        // Save proof for later use
        const proofData = {
            proof: solidityProof,
            publicSignals: publicSignals,
            input: {
                encryptedVote: input.ciphertextHash,
                nullifierHash: input.nullifierHash,
                electionId: input.electionId
            }
        };

        const outputFile = path.join(BUILD_DIR, 'sample_proof.json');
        fs.writeFileSync(outputFile, JSON.stringify(proofData, null, 2));
        console.log(`💾 Proof saved to: ${outputFile}`);

        return proofData;

    } catch (error) {
        console.error('❌ Error generating proof:', error);
        process.exit(1);
    }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateProof();
}

export { generateProof };
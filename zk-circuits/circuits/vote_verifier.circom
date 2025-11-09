pragma circom 2.1.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/mux1.circom";

/// @title VoteVerifier - ZK circuit to verify anonymous voting
/// @notice Proves that:
/// 1. The voter is in the eligible list (Merkle proof)
/// 2. The nullifier is unique (prevents double voting)
/// 3. The vote is in valid range
/// @dev Public signals: [merkleRoot, nullifierHash, ciphertextHash, electionId]
template VoteVerifier(levels) {
    // Private inputs (witness)
    signal private input identitySecret;
    signal private input votePlaintext;
    signal private input merkleProof[levels];
    signal private input merkleIndices[levels];
    signal private input nonce;
    
    // Public inputs
    signal input merkleRoot;
    signal input nullifierHash;
    signal input ciphertextHash;
    signal input electionId;
    signal input maxVoteOptions;
    
    // Intermediate signals
    signal leaf;
    signal computedNullifier;
    signal computedCiphertextHash;
    
    // 1. Verify Merkle inclusion proof
    // Compute leaf = Poseidon(identitySecret)
    component leafHasher = Poseidon(1);
    leafHasher.inputs[0] <== identitySecret;
    leaf <== leafHasher.out;
    
    // Verify Merkle path
    component merkleVerifier = MerkleTreeVerifier(levels);
    merkleVerifier.leaf <== leaf;
    merkleVerifier.root <== merkleRoot;
    for (var i = 0; i < levels; i++) {
        merkleVerifier.pathElements[i] <== merkleProof[i];
        merkleVerifier.pathIndices[i] <== merkleIndices[i];
    }
    
    // 2. Verify nullifier computation
    // nullifier = Poseidon(identitySecret, electionId)
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== identitySecret;
    nullifierHasher.inputs[1] <== electionId;
    computedNullifier <== nullifierHasher.out;
    
    // Constrain nullifier
    nullifierHash === computedNullifier;
    
    // 3. Verify vote is in valid range
    component voteRangeCheck = LessEqThan(8); // max 255 options
    voteRangeCheck.in[0] <== votePlaintext;
    voteRangeCheck.in[1] <== maxVoteOptions - 1;
    voteRangeCheck.out === 1;
    
    // 4. Verify ciphertext hash binding
    // In practice, this would be more complex with actual encryption
    // For MVP: ciphertextHash = Poseidon(votePlaintext, nonce)
    component ciphertextHasher = Poseidon(2);
    ciphertextHasher.inputs[0] <== votePlaintext;
    ciphertextHasher.inputs[1] <== nonce;
    computedCiphertextHash <== ciphertextHasher.out;
    
    // Constrain ciphertext hash
    ciphertextHash === computedCiphertextHash;
}

/// @title MerkleTreeVerifier - Verifies inclusion in Merkle tree
template MerkleTreeVerifier(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    
    component hashers[levels];
    component mux[levels];
    
    signal levelHashes[levels + 1];
    levelHashes[0] <== leaf;
    
    for (var i = 0; i < levels; i++) {
        // Select left and right based on path index
        mux[i] = Mux1();
        mux[i].c[0] <== levelHashes[i];
        mux[i].c[1] <== pathElements[i];
        mux[i].s <== pathIndices[i];
        
        // Hash current level
        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== levelHashes[i] + pathElements[i] - mux[i].out;
        hashers[i].inputs[1] <== mux[i].out;
        
        levelHashes[i + 1] <== hashers[i].out;
    }
    
    // Constrain final hash to equal root
    root === levelHashes[levels];
}

// Main component for 20-level Merkle tree (up to 1M voters)
component main = VoteVerifier(20);
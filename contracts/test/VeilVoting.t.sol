// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VeilVoting.sol";
import "../src/IVerifier.sol";

/// @title MockVerifier - Verificador mock para testing
contract MockVerifier is IVerifier {
    bool public shouldReturnTrue = true;
    
    function setShouldReturnTrue(bool _shouldReturn) external {
        shouldReturnTrue = _shouldReturn;
    }
    
    function verifyProof(
        bytes calldata, 
        uint256[] calldata
    ) external view returns (bool) {
        return shouldReturnTrue;
    }
}

/// @title VeilVotingTest - Tests para el contrato VeilVoting
contract VeilVotingTest is Test {
    VeilVoting public voting;
    MockVerifier public verifier;
    
    address public admin = address(1);
    address public voter = address(2);
    
    uint256 public electionId;
    bytes32 public constant MERKLE_ROOT = bytes32(uint256(0x123));
    bytes32 public constant NULLIFIER_HASH = bytes32(uint256(0x456));
    bytes32 public constant ENCRYPTED_VOTE = bytes32(uint256(0x789));
    bytes32 public constant CIPHERTEXT_HASH = bytes32(uint256(0xabc));
    
    function setUp() public {
        verifier = new MockVerifier();
        voting = new VeilVoting(address(verifier));
        
        vm.prank(admin);
        electionId = voting.createElection(MERKLE_ROOT, 1 days);
    }
    
    function testCreateElection() public {
        vm.prank(admin);
        uint256 newElectionId = voting.createElection(MERKLE_ROOT, 1 days);
        
        VeilVoting.Election memory election = voting.getElection(newElectionId);
        
        assertEq(election.merkleRoot, MERKLE_ROOT);
        assertEq(election.admin, admin);
        assertEq(election.voteCount, 0);
        assertTrue(election.active);
    }
    
    function testCastVoteSuccess() public {
        uint256[] memory pubSignals = new uint256[](4);
        pubSignals[0] = uint256(MERKLE_ROOT);
        pubSignals[1] = uint256(NULLIFIER_HASH);
        pubSignals[2] = uint256(CIPHERTEXT_HASH);
        pubSignals[3] = electionId;
        
        vm.expectEmit(true, true, true, false);
        emit VeilVoting.VoteCast(ENCRYPTED_VOTE, NULLIFIER_HASH, electionId);
        
        vm.prank(voter);
        voting.castVote(
            electionId,
            ENCRYPTED_VOTE,
            NULLIFIER_HASH,
            "",  // proof
            pubSignals
        );
        
        VeilVoting.Election memory election = voting.getElection(electionId);
        assertEq(election.voteCount, 1);
        
        assertTrue(voting.isNullifierUsed(electionId, NULLIFIER_HASH));
    }
    
    function testCannotVoteTwice() public {
        uint256[] memory pubSignals = new uint256[](4);
        pubSignals[0] = uint256(MERKLE_ROOT);
        pubSignals[1] = uint256(NULLIFIER_HASH);
        pubSignals[2] = uint256(CIPHERTEXT_HASH);
        pubSignals[3] = electionId;
        
        // Primer voto exitoso
        vm.prank(voter);
        voting.castVote(electionId, ENCRYPTED_VOTE, NULLIFIER_HASH, "", pubSignals);
        
        // Segundo voto debe fallar
        vm.expectRevert(VeilVoting.NullifierAlreadyUsed.selector);
        vm.prank(voter);
        voting.castVote(electionId, ENCRYPTED_VOTE, NULLIFIER_HASH, "", pubSignals);
    }
    
    function testCannotVoteWithInvalidProof() public {
        verifier.setShouldReturnTrue(false);
        
        uint256[] memory pubSignals = new uint256[](4);
        pubSignals[0] = uint256(MERKLE_ROOT);
        pubSignals[1] = uint256(NULLIFIER_HASH);
        pubSignals[2] = uint256(CIPHERTEXT_HASH);
        pubSignals[3] = electionId;
        
        vm.expectRevert(VeilVoting.InvalidZKProof.selector);
        vm.prank(voter);
        voting.castVote(electionId, ENCRYPTED_VOTE, NULLIFIER_HASH, "", pubSignals);
    }
    
    function testCannotVoteAfterElectionEnds() public {
        // Move time beyond election end
        vm.warp(block.timestamp + 1 days + 1);
        
        uint256[] memory pubSignals = new uint256[](4);
        pubSignals[0] = uint256(MERKLE_ROOT);
        pubSignals[1] = uint256(NULLIFIER_HASH);
        pubSignals[2] = uint256(CIPHERTEXT_HASH);
        pubSignals[3] = electionId;
        
        vm.expectRevert(VeilVoting.ElectionEnded.selector);
        vm.prank(voter);
        voting.castVote(electionId, ENCRYPTED_VOTE, NULLIFIER_HASH, "", pubSignals);
    }
    
    function testEndElection() public {
        assertTrue(voting.isElectionActive(electionId));
        
        vm.prank(admin);
        voting.endElection(electionId);
        
        assertFalse(voting.isElectionActive(electionId));
    }
    
    function testOnlyAdminCanEndElection() public {
        vm.expectRevert(VeilVoting.NotElectionAdmin.selector);
        vm.prank(voter);
        voting.endElection(electionId);
    }
}
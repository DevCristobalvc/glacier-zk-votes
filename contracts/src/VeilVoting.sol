// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IVerifier.sol";

/// @title VeilVoting - Anonymous voting contract with ZK-SNARKs
/// @author Glacier
/// @notice Enables anonymous voting using zero-knowledge proofs
/// @dev Voters generate ZK proofs that demonstrate eligibility without revealing identity
contract VeilVoting {
    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Emitted when a vote is registered
    /// @param encryptedVote Encrypted vote
    /// @param nullifierHash Nullifier hash to prevent double voting
    /// @param electionId Election ID
    event VoteCast(
        bytes32 indexed encryptedVote,
        bytes32 indexed nullifierHash,
        uint256 indexed electionId
    );

    /// @notice Emitted when a new election is created
    /// @param electionId Election ID
    /// @param merkleRoot Root of the eligible voters tree
    /// @param admin Election administrator
    event ElectionCreated(
        uint256 indexed electionId,
        bytes32 merkleRoot,
        address indexed admin
    );

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    
    error NullifierAlreadyUsed();
    error InvalidMerkleRoot();
    error InvalidZKProof();
    error ElectionNotFound();
    error NotElectionAdmin();
    error ElectionEnded();

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Election information
    struct Election {
        bytes32 merkleRoot;      // Root of the Merkle tree of eligible voters
        address admin;           // Election administrator
        uint256 startTime;       // Start timestamp
        uint256 endTime;         // End timestamp
        uint256 voteCount;       // Number of votes cast
        bool active;             // Active/inactive state
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    
    /// @notice ZK proof verifier
    IVerifier public immutable verifier;
    
    /// @notice Election counter
    uint256 public electionCounter;
    
    /// @notice Mapping from election ID to information
    mapping(uint256 => Election) public elections;
    
    /// @notice Mapping of used nullifiers per election
    /// @dev electionId => nullifierHash => used
    mapping(uint256 => mapping(bytes32 => bool)) public nullifierUsed;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    
    /// @param _verifier Address of the ZK verifier contract
    constructor(address _verifier) {
        verifier = IVerifier(_verifier);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Creates a new election
    /// @param _merkleRoot Root of the eligible voters Merkle tree
    /// @param _duration Duration of the election in seconds
    /// @return electionId ID of the created election
    function createElection(
        bytes32 _merkleRoot,
        uint256 _duration
    ) external returns (uint256 electionId) {
        electionId = electionCounter++;
        
        elections[electionId] = Election({
            merkleRoot: _merkleRoot,
            admin: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            voteCount: 0,
            active: true
        });

        emit ElectionCreated(electionId, _merkleRoot, msg.sender);
    }

    /// @notice Ends an election early
    /// @param _electionId Election ID
    function endElection(uint256 _electionId) external {
        Election storage election = elections[_electionId];
        
        if (election.admin == address(0)) revert ElectionNotFound();
        if (election.admin != msg.sender) revert NotElectionAdmin();
        
        election.active = false;
    }

    /*//////////////////////////////////////////////////////////////
                            VOTING FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Casts an anonymous vote
    /// @param _electionId Election ID
    /// @param _encryptedVote Encrypted vote
    /// @param _nullifierHash Unique nullifier hash
    /// @param _proof Serialized ZK proof
    /// @param _pubSignals Public signals [merkleRoot, nullifierHash, ciphertextHash, electionId]
    function castVote(
        uint256 _electionId,
        bytes32 _encryptedVote,
        bytes32 _nullifierHash,
        bytes calldata _proof,
        uint256[] calldata _pubSignals
    ) external {
        Election storage election = elections[_electionId];
        
        // Election validations
        if (election.admin == address(0)) revert ElectionNotFound();
        if (!election.active || block.timestamp > election.endTime) {
            revert ElectionEnded();
        }
        
        // Validar que el nullifier no ha sido usado
        if (nullifierUsed[_electionId][_nullifierHash]) {
            revert NullifierAlreadyUsed();
        }
        
        // Validar señales públicas
        if (_pubSignals.length != 4) revert InvalidZKProof();
        if (_pubSignals[0] != uint256(election.merkleRoot)) revert InvalidMerkleRoot();
        if (_pubSignals[1] != uint256(_nullifierHash)) revert InvalidZKProof();
        if (_pubSignals[3] != _electionId) revert InvalidZKProof();
        
        // Verificar la prueba ZK
        bool proofValid = verifier.verifyProof(_proof, _pubSignals);
        if (!proofValid) revert InvalidZKProof();
        
        // Registrar el voto
        nullifierUsed[_electionId][_nullifierHash] = true;
        election.voteCount++;
        
        emit VoteCast(_encryptedVote, _nullifierHash, _electionId);
    }

    /*//////////////////////////////////////////////////////////////
                              VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Gets election information
    /// @param _electionId Election ID
    /// @return election Election information
    function getElection(uint256 _electionId) 
        external 
        view 
        returns (Election memory election) 
    {
        return elections[_electionId];
    }
    
    /// @notice Checks if a nullifier has been used
    /// @param _electionId Election ID
    /// @param _nullifierHash Nullifier hash
    /// @return usado True if already used
    function isNullifierUsed(uint256 _electionId, bytes32 _nullifierHash) 
        external 
        view 
        returns (bool usado) 
    {
        return nullifierUsed[_electionId][_nullifierHash];
    }
    
    /// @notice Checks if an election is active
    /// @param _electionId Election ID
    /// @return activa True if active and within time limit
    function isElectionActive(uint256 _electionId) 
        external 
        view 
        returns (bool activa) 
    {
        Election memory election = elections[_electionId];
        return election.active && 
               block.timestamp >= election.startTime && 
               block.timestamp <= election.endTime;
    }
}
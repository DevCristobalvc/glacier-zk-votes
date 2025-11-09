/**
 * @title Shared Types for Glacier
 * @author Glacier
 */

// ========================================
// Blockchain Types
// ========================================

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorer: string;
  contracts: ContractAddresses;
}

export interface ContractAddresses {
  Verifier: `0x${string}`;
  VeilVoting: `0x${string}`;
}

// ========================================
// Election Types
// ========================================

export interface Election {
  id: string;
  title: string;
  description?: string;
  merkleRoot: `0x${string}`;
  admin: `0x${string}`;
  startTime: number;
  endTime: number;
  voteCount: number;
  active: boolean;
  status: ElectionStatus;
  options: VoteOption[];
}

export type ElectionStatus = 'upcoming' | 'active' | 'closed' | 'cancelled';

export interface VoteOption {
  id: string;
  title: string;
  description?: string;
}

export interface CreateElectionParams {
  title: string;
  description?: string;
  duration: number; // seconds
  options: Omit<VoteOption, 'id'>[];
  eligibleVoters: `0x${string}`[]; // eligible addresses
}

// ========================================
// Voting Types
// ========================================

export interface VoteInput {
  electionId: string;
  optionId: string;
  identitySecret: string;
  nonce: string;
}

export interface VoteProof {
  proof: string[];
  publicSignals: string[];
}

export interface EncryptedVote {
  ciphertext: `0x${string}`;
  hash: `0x${string}`;
}

export interface CastVoteParams {
  electionId: string;
  encryptedVote: `0x${string}`;
  nullifierHash: `0x${string}`;
  proof: `0x${string}`;
  publicSignals: string[];
}

// ========================================
// ZK Circuit Types
// ========================================

export interface CircuitInput {
  // Private inputs
  identitySecret: string;
  votePlaintext: string;
  merkleProof: string[];
  merkleIndices: string[];
  nonce: string;
  
  // Public inputs
  merkleRoot: string;
  nullifierHash: string;
  ciphertextHash: string;
  electionId: string;
  maxVoteOptions: string;
}

export interface ProofGenerationResult {
  proof: VoteProof;
  publicSignals: string[];
  encryptedVote: EncryptedVote;
  nullifierHash: `0x${string}`;
}

// ========================================
// Merkle Tree Types
// ========================================

export interface MerkleTreeData {
  root: `0x${string}`;
  leaves: `0x${string}`[];
  proof: MerkleProof;
}

export interface MerkleProof {
  pathElements: string[];
  pathIndices: number[];
  leaf: string;
}

// ========================================
// Wallet Types
// ========================================

export interface WalletState {
  connected: boolean;
  address?: `0x${string}`;
  chainId?: number;
  balance?: string;
}

export interface WalletConnection {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
}

// ========================================
// UI Types
// ========================================

export interface ElectionCardProps {
  election: Election;
  userVoted?: boolean;
  onVote?: (electionId: string) => void;
  onViewResults?: (electionId: string) => void;
}

export interface VotingModalState {
  step: VotingStep;
  selectedOption?: string;
  isGeneratingProof: boolean;
  proofGenerated: boolean;
  txHash?: string;
  error?: string;
}

export type VotingStep = 'eligibility' | 'selection' | 'proof' | 'confirm' | 'complete';

// ========================================
// Tipos de API/Estado
// ========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ElectionFilters {
  status?: ElectionStatus[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface VoteEvent {
  electionId: string;
  encryptedVote: `0x${string}`;
  nullifierHash: `0x${string}`;
  blockNumber: number;
  transactionHash: `0x${string}`;
  timestamp: number;
}

// ========================================
// Tipos de Error
// ========================================

export enum ErrorCode {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  INVALID_CHAIN = 'INVALID_CHAIN',
  ELECTION_NOT_FOUND = 'ELECTION_NOT_FOUND',
  ELECTION_ENDED = 'ELECTION_ENDED',
  ALREADY_VOTED = 'ALREADY_VOTED',
  INVALID_PROOF = 'INVALID_PROOF',
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
  PROOF_GENERATION_FAILED = 'PROOF_GENERATION_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED'
}

export interface GlacierError {
  code: ErrorCode;
  message: string;
  details?: any;
}

// ========================================
// Constants
// ========================================

export const AVALANCHE_FUJI_CHAIN_ID = 43113;
export const AVALANCHE_MAINNET_CHAIN_ID = 43114;

export const DEFAULT_MERKLE_TREE_LEVELS = 20; // Supports up to ~1M voters

export const VOTING_STEPS: Record<VotingStep, { title: string; description: string }> = {
  eligibility: {
    title: 'Verify Eligibility',
    description: 'Confirm you have the right to vote'
  },
  selection: {
    title: 'Select Option',
    description: 'Choose your vote option'
  },
  proof: {
    title: 'Generate Proof',
    description: 'Creating zero-knowledge proof'
  },
  confirm: {
    title: 'Confirm Vote',
    description: 'Submit your vote to the blockchain'
  },
  complete: {
    title: 'Complete',
    description: 'Your vote was successfully registered'
  }
};
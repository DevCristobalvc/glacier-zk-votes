import { Contract } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

// ABI simplificado con las funciones que necesitamos
const VEIL_VOTING_ABI = [
  // Read functions
  'function getElection(uint256 _electionId) view returns (tuple(bytes32 merkleRoot, address admin, uint256 startTime, uint256 endTime, uint256 voteCount, bool active))',
  'function isNullifierUsed(uint256 _electionId, bytes32 _nullifierHash) view returns (bool)',
  'function isElectionActive(uint256 _electionId) view returns (bool)',
  'function electionCounter() view returns (uint256)',
  
  // Write functions
  'function createElection(bytes32 _merkleRoot, uint256 _duration) returns (uint256)',
  'function castVote(uint256 _electionId, bytes32 _encryptedVote, bytes32 _nullifierHash, bytes calldata _proof, uint256[] calldata _pubSignals)',
  'function endElection(uint256 _electionId)',
  
  // Events
  'event VoteCast(bytes32 indexed encryptedVote, bytes32 indexed nullifierHash, uint256 indexed electionId)',
  'event ElectionCreated(uint256 indexed electionId, bytes32 merkleRoot, address indexed admin)',
];

export interface Election {
  merkleRoot: string;
  admin: string;
  startTime: bigint;
  endTime: bigint;
  voteCount: bigint;
  active: boolean;
}

export function useVeilVoting() {
  const { signer, isConnected, chainId } = useWallet();

  const getContract = () => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    if (chainId !== 43113) {
      throw new Error('Please switch to Avalanche Fuji Testnet');
    }

    return new Contract(
      CONTRACT_ADDRESSES.VeilVoting,
      VEIL_VOTING_ABI,
      signer
    );
  };

  const getElection = async (electionId: number): Promise<Election> => {
    const contract = getContract();
    const election = await contract.getElection(electionId);
    
    return {
      merkleRoot: election[0],
      admin: election[1],
      startTime: election[2],
      endTime: election[3],
      voteCount: election[4],
      active: election[5],
    };
  };

  const isElectionActive = async (electionId: number): Promise<boolean> => {
    const contract = getContract();
    return await contract.isElectionActive(electionId);
  };

  const isNullifierUsed = async (
    electionId: number,
    nullifierHash: string
  ): Promise<boolean> => {
    const contract = getContract();
    return await contract.isNullifierUsed(electionId, nullifierHash);
  };

  const getElectionCount = async (): Promise<number> => {
    const contract = getContract();
    const count = await contract.electionCounter();
    return Number(count);
  };

  const castVote = async (
    electionId: number,
    encryptedVote: string,
    nullifierHash: string,
    proof: string,
    pubSignals: string[]
  ) => {
    const contract = getContract();
    
    const tx = await contract.castVote(
      electionId,
      encryptedVote,
      nullifierHash,
      proof,
      pubSignals
    );
    
    const receipt = await tx.wait();
    return receipt;
  };

  const createElection = async (
    merkleRoot: string,
    durationInSeconds: number
  ) => {
    const contract = getContract();
    
    const tx = await contract.createElection(merkleRoot, durationInSeconds);
    const receipt = await tx.wait();
    
    // Extract election ID from event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'ElectionCreated';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      return Number(parsed?.args[0]);
    }
    
    throw new Error('Election creation failed');
  };

  const endElection = async (electionId: number) => {
    const contract = getContract();
    const tx = await contract.endElection(electionId);
    return await tx.wait();
  };

  return {
    isConnected,
    getElection,
    isElectionActive,
    isNullifierUsed,
    getElectionCount,
    castVote,
    createElection,
    endElection,
  };
}

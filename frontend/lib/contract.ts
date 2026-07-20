import { parseAbi } from "viem";

// TODO: paste your deployed Anvil contract address here
export const electionAddress = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a" as `0x${string}`;
export function isZeroAddress(addr: string) {
  return addr === "0x0000000000000000000000000000000000000000";
}

export const electionAbi = parseAbi([
  "function state() view returns (uint8)",
  "function owner() view returns (address)",
  "function setElectionState(uint8 newState) external",
  "function addCandidate(string name, string symbol, bytes32 voterId) external",
  "function registerVoter(address voter, string name, string citizenshipNumber) external",
  "function castVote(uint256 candidateId) external",
  "function getCandidatesCount() view returns (uint256)",
  "function getAllVoterAddresses() view returns (address[])",
  "function voters(address) view returns (bool isRegistered, bool hasVoted, uint256 votedCandidateId, bytes32 voterId, string name)",
  "function voterIdToAddress(bytes32) view returns (address)",
  "function candidates(uint256) view returns (uint256 id, string name, string symbol, uint256 voteCount, bytes32 voterId)",
  "function getAllCandidates() view returns ((uint256 id, string name, string symbol, uint256 voteCount, bytes32 voterId)[])",
  "event CandidateAdded(uint256 id, string name, string symbol)",
  "event VoterRegistered(address indexed voter, bytes32 indexed voterId)",
  "event VoteCast(address indexed voter, uint256 candidateId)",
  "event StatusChanged(uint8 newState)",
]);

export const ELECTION_STATES = ["Not Started", "Registration", "Voting", "Ended"] as const;
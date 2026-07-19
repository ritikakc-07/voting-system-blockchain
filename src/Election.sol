// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Election is Ownable {
    enum ElectionState { NotStarted, Registration, Voting, Ended }
    ElectionState public state;

    struct Candidate {
        uint id;
        string name;
        string symbol; // e.g., "Sun", "Tree" from your UI
        uint voteCount;
        bytes32 voterId; // Linked to their registered voter profile
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedCandidateId;
        bytes32 voterId; // Cryptographically generated unique ID for the voter
        string name;
    }

    // State Variables
    mapping(address => Voter) public voters;
    mapping(bytes32 => address) public voterIdToAddress; // Lookup wallet by voterId
    Candidate[] public candidates;
    address[] public voterAddresses; // Helps to iterate for the "Voter List Page"

    // Events
    event CandidateAdded(uint256 id, string name, string symbol);
    event VoterRegistered(address indexed voter, bytes32 indexed voterId);
    event VoteCast(address indexed voter, uint256 candidateId);
    event StatusChanged(ElectionState newState);

    // Constructor
    // The wallet deploying this contract becomes the ECN Admin
    constructor() Ownable(msg.sender) {
        state = ElectionState.NotStarted;
    }

    // Admin Functions (Election Commission Only)
    function setElectionState(ElectionState _newState) external onlyOwner {
        state = _newState;
        emit StatusChanged(_newState);
    }

    // Function for Admin to add candidates (simulating approved candidate applications)
    function addCandidate(string memory _name, string memory _symbol, bytes32 _voterId) external onlyOwner {
        require(state == ElectionState.NotStarted || state == ElectionState.Registration, "Cannot add candidates now");

        uint candidateId = candidates.length;
        candidates.push(Candidate({
            id: candidateId,
            name: _name,
            symbol: _symbol,
            voterId: _voterId, // No voterId for candidates
            voteCount: 0
        }));

        emit CandidateAdded(candidateId, _name, _symbol);
    }

    // Function for Admin to register voters after off-chain KYC
    function registerVoter(address _voter, string memory _name, string memory _citizenshipNumber) external onlyOwner {
        require(state == ElectionState.Registration, "Not in registration phase");
        require(!voters[_voter].isRegistered, "Voter already registered");

        // Generate a unique voterId using keccak256 hash of the voter's address and citizenship number
        bytes32 uniqueVoterId = keccak256(abi.encodePacked(_voter, _citizenshipNumber));
        require(voterIdToAddress[uniqueVoterId] == address(0), "Voter ID already exists");
    
        voters[_voter] = Voter({
            isRegistered: true,
            hasVoted: false,
            votedCandidateId: 0,
            voterId: uniqueVoterId,
            name: _name
        });

        voterIdToAddress[uniqueVoterId] = _voter;
        voterAddresses.push(_voter);

        emit VoterRegistered(_voter, uniqueVoterId);
    }

    // Public Functions (Voters)
    // Function to cast a vote
    function castVote(uint256 _candidateId) external {
        require(state == ElectionState.Voting, "Voting is not active");
        require(voters[msg.sender].isRegistered, "You are not a registered voter");
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_candidateId < candidates.length, "Invalid candidate ID");

        // Record the vote
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId);
    }

    // Read View Functions (For Next.js UI)
    function getAllCandidates() external view returns (Candidate[] memory) {
        return candidates.length > 0 ? candidates : new Candidate[](0);
    }
    function getCandidatesCount() external view returns (uint256) {
        return candidates.length;
    }

    function getAllVoterAddresses() external view returns (address[] memory) {
        return voterAddresses;
    }
}
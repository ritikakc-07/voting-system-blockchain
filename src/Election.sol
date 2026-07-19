// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Importing Ownable from OpenZeppelin to handle Admin (ECN) privileges
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Election is Ownable {

    // --- State & Structures ---

    // Matches the "Current Election Status" in your UI
    enum ElectionState { NotStarted, Registration, Voting, Ended }
    ElectionState public state;

    struct Candidate {
        uint id;
        string name;
        string symbol; // e.g., "Sun", "Tree" from your UI
        uint voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedCandidateId;
        uint voterId; // Unique ID for the voter, can be used for off-chain verification
        string name; // Storing on-chain for MVP to match your Voter List UI
    }

    // --- State Variables ---

    mapping(address => Voter) public voters;
    Candidate[] public candidates;
    address[] public voterAddresses; // Helps to iterate for the "Voter List Page"

    // --- Events ---
    // Events help your Next.js frontend listen for changes
    event CandidateAdded(uint id, string name);
    event VoterRegistered(address voter);
    event VoteCast(address voter, uint candidateId);
    event StatusChanged(ElectionState newState);

    // --- Constructor ---

    // The wallet deploying this contract becomes the ECN Admin
    constructor() Ownable(msg.sender) {
        state = ElectionState.NotStarted;
    }

    // --- Admin Functions (Election Commission Only) ---

    // Function to change the election status
    function setElectionState(ElectionState _newState) external onlyOwner {
        state = _newState;
        emit StatusChanged(_newState);
    }

    // Function for Admin to add candidates (simulating approved candidate applications)
    function addCandidate(string memory _name, string memory _symbol) external onlyOwner {
        require(state == ElectionState.NotStarted || state == ElectionState.Registration, "Cannot add candidates now");

        uint candidateId = candidates.length;
        candidates.push(Candidate({
            id: candidateId,
            name: _name,
            symbol: _symbol,
            voteCount: 0
        }));

        emit CandidateAdded(candidateId, _name);
    }

    // Function for Admin to register voters after off-chain KYC
    function registerVoter(address _voter, string memory _name) external onlyOwner {
        require(state == ElectionState.Registration, "Not in registration phase");
        require(!voters[_voter].isRegistered, "Voter already registered");
    
        voters[_voter] = Voter({
            isRegistered: true,
            hasVoted: false,
            votedCandidateId: 0,
            voterId: voterAddresses.length, // Assign a unique ID
            name: _name
        });
        voterAddresses.push(_voter);

        emit VoterRegistered(_voter);
    }

    // --- Public Functions (Voters) ---

    // Function to cast a vote
    function castVote(uint _candidateId) external {
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

    // --- Getter Functions (For Next.js UI) ---

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
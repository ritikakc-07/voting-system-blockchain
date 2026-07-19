// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Election} from "../src/Election.sol";

contract ElectionTest is Test {
    Election public election;
    address public admin = address(0x1);
    address public voter1 = address(0x123);
    address public voter2 = address(0x456);   

    function setUp() public {
        election = new Election();
    }

    function test_FullVotingFlow() public {
        election.setElectionState(Election.ElectionState.Registration);
        assertEq(uint(election.state()), uint(Election.ElectionState.Registration));

        election.registerVoter(voter1, "Sita Rai", "CTZ-9982");
        election.registerVoter(voter2, "Ram Thapa", "CTZ-1120");
    
        // FIX: Grab the 4th element (voterId) correctly from the 5-item tuple
        (,,, bytes32 voterId1, ) = election.voters(voter1);
        (,,, bytes32 voterId2, ) = election.voters(voter2);

        election.addCandidate("RSP", "Bell", voterId1);
        assertEq(election.getCandidatesCount(), 1);
        election.addCandidate("CPN", "Star", voterId2);
        assertEq(election.getCandidatesCount(), 2);

        election.setElectionState(Election.ElectionState.Voting);
        assertEq(uint(election.state()), uint(Election.ElectionState.Voting));

        vm.prank(voter1);
        election.castVote(0); 
        vm.prank(voter2);
        election.castVote(1); 

        (, , , uint voteCount1, ) = election.candidates(0);
        (, , , uint voteCount2, ) = election.candidates(1);
        assertEq(voteCount1, 1);
        assertEq(voteCount2, 1);

        // FIX: Expanded tuple matching checks to correctly pull out 'hasVoted' (2nd element)
        (, bool hasVoted1,,, ) = election.voters(voter1);
        (, bool hasVoted2,,, ) = election.voters(voter2);
        assertTrue(hasVoted1);
        assertTrue(hasVoted2);

        election.setElectionState(Election.ElectionState.Ended);
        assertEq(uint(election.state()), uint(Election.ElectionState.Ended));

        Election.Candidate[] memory candidates = election.getAllCandidates();
        assertEq(candidates.length, 2);
    }
}
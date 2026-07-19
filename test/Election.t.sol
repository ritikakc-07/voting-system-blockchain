// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Election} from "../src/Election.sol";

contract ElectionTest is Test {
    Election public election;
    

    function setUp() public {
        election = new Election();

    }

    function test_AddCandidate() public {
        election.addCandidate("Candidate A", "Tree");
        (uint id, string memory name, string memory symbol, uint voteCount) = election.candidates(0);
        assertEq(id, 0);
        assertEq(name, "Candidate A");
        assertEq(symbol, "Tree");
        assertEq(voteCount, 0);
    }

    function test_RegisterVoter() public {
        address voterAddress = address(0x123);
        election.setElectionState(Election.ElectionState.Registration);
        election.registerVoter(voterAddress, "Voter 1");
        (bool isRegistered,,,) = election.voters(voterAddress);
        assertTrue(isRegistered);
    }

    function test_CastVote() public {
        election.addCandidate("Candidate A", "Tree");
        address voterAddress = address(0x123);
        election.setElectionState(Election.ElectionState.Registration);
        election.registerVoter(voterAddress, "Voter 1");
        vm.prank(voterAddress);
        election.setElectionState(Election.ElectionState.Voting);
        election.castVote(0);
        (, bool hasVoted,,) = election.voters(voterAddress);
        assertTrue(hasVoted);
    }
}
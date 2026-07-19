// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Election} from "../src/Election.sol";

contract Deploy is Script {
    function run() external returns (Election) {
        vm.startBroadcast();
        Election election = new Election();

        // Pre-seed a couple of candidates to match your UI wireframes immediately
        election.addCandidate("Candidate A", "Tree");
        election.addCandidate("Candidate B", "Sun");

        // Move state to Registration so users can apply right away in your demo
        election.setElectionState(Election.ElectionState.Registration);

        vm.stopBroadcast();
        return election;
    }
}
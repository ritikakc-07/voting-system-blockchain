// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Election} from "../src/Election.sol";

import {console} from "forge-std/console.sol";

/// @notice Deploy the Election contract
contract DeployElectionScript is Script {
    function run() public returns (Election election){
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        address deployer;

        // verify address is valid
        if (deployerPrivateKey != 0){
            deployer = vm.addr(deployerPrivateKey);
            vm.startBroadcast(deployerPrivateKey);
        } else {
            vm.startBroadcast();
            deployer = msg.sender;
        }

        // election contract
        election = new Election();

        // seed some candidates
        election.addCandidate("Candidate A", "Tree");
        election.addCandidate("Candidate B", "Sun");

        // change state to registration
        election.setElectionState(Election.ElectionState.Registration);

        // print details to console
        console.log("Election Contract Details:");
        console.log("Deployer Address:", deployer);
        console.log("Election Contract Address:", address(election));
        console.log("Election State:", uint(election.state()));
        console.log("Candidate Count:", election.getCandidatesCount());

        // stop broadcast
        vm.stopBroadcast();
    }
}
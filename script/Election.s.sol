// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Election} from "../src/Election.sol";

contract DeployElectionScript is Script {
    function run() public returns (Election election){
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        address deployer;

        if (deployerPrivateKey != 0){
            deployer = vm.addr(deployerPrivateKey);
            vm.startBroadcast(deployerPrivateKey);
        } else {
            vm.startBroadcast();
            deployer = msg.sender;
        }

        election = new Election();
        election.setElectionState(Election.ElectionState.Registration);

        address candidateWallet = address(0x1234567890123456789012345678901234567890);
        election.registerVoter(candidateWallet, "Candidate 1", "CITIZENSHIP123");
        
        (,,, bytes32 candidateVoterId, ) = election.voters(candidateWallet);

        election.addCandidate("RSP", "Bell", candidateVoterId);

        console.log("Election Contract Details:");
        console.log("Deployer Address:", deployer);
        console.log("Election Contract Address:", address(election));
        console.log("Election State:", uint(election.state()));
        console.log("Candidate Count:", election.getCandidatesCount());

        vm.stopBroadcast();
    }
}
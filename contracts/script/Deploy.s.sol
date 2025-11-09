// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/VeilVoting.sol";

/// @title DeployScript - Script para deploy de contratos Glacier
contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address verifierAddress = vm.envAddress("VERIFIER_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy VeilVoting contract
        VeilVoting veilVoting = new VeilVoting(verifierAddress);
        
        console.log("VeilVoting deployed to:", address(veilVoting));
        console.log("Verifier address:", verifierAddress);
        
        vm.stopBroadcast();
    }
}
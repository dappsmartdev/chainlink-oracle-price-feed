// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {ChainLinkPriceFeed} from "../src/ChainLinkPriceFeed.sol";

contract DeployChainLinkPriceFeed is Script {
    function run() external {
        address owner = vm.envAddress("OWNER_ADDRESS");
        vm.startBroadcast();
        ChainLinkPriceFeed priceFeed = new ChainLinkPriceFeed(owner);
        vm.stopBroadcast();
    }
}
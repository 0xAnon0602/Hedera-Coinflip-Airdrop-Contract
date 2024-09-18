// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ArcadeCoinflip} from "../src/Coinflip.sol";
 
contract CounterScript is Script {

    function run() public {

        vm.startBroadcast();
        ArcadeCoinflip arcadeCoinflip = new ArcadeCoinflip();

        address[] memory temp = new address[](1);
        temp[0] = msg.sender;
        console.log("Adding free flips...");
        arcadeCoinflip.addFreeFlips(temp, 1);

        console.log("Flipping...");
        arcadeCoinflip.flip();

        console.log("Emergency withdrawing...");
        arcadeCoinflip.emergencyWithdraw(35e8);
        vm.stopBroadcast();

    }

}

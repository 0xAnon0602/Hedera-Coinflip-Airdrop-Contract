// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {ArcadeCoinflip} from "../src/Coinflip.sol";

contract CoinflipTest is Test {
    ArcadeCoinflip public arcadeCoinflip;
    address owner = address(0x111310);
    address alice2 = makeAddr("alice2");

    function setUp() public {
        arcadeCoinflip = new ArcadeCoinflip();
        vm.deal(address(arcadeCoinflip), 100000 ether);
        address[] memory temp = new address[](2);
        temp[0] = owner;
        temp[1] = alice2;
        vm.prank(owner);
        arcadeCoinflip.addFreeFlips(temp, 1);
    }

    function testFreeFlips() public view {
        (uint256 freeFlips,) = arcadeCoinflip.allUserInfo(owner);
        assertEq(freeFlips, 1);
    }

    function testFlip() public {
        vm.prank(owner);
        uint256 x = arcadeCoinflip.flip();
        console.log(x);
    }

    function testEmergencyWithdraw() public{
        vm.prank(owner);
        arcadeCoinflip.emergencyWithdraw(address(arcadeCoinflip).balance);
    }
 
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import './Safemath.sol';
import './HederaTokenService.sol';

contract ArcadeCoinflip is HederaTokenService {
    using SafeMath for uint256;

    uint256 MINIMUM_LIMIT = 1000; 
    uint256 JACKPOT_PERCENT = 250;
    address JACKPOT_WALLET = address(0x12179E); // 0.0.1185694
    address CLIENT_WALLET = address(0x111310); // 0.0.1118992
    uint256 AIRDROP_FLIP = 5;
    uint256 HBAR_DECIMAL = 100000000;
    uint256 REWARD_DECIMAL = 10000;
    uint256 nounce = 0;

    struct userInfo {
        uint256 freeFlips;
        bool hasFlipped;
    }

    mapping(address => userInfo) public allUserInfo;

    receive() external payable {}
    fallback() external payable {}

    modifier onlyOwner {
        require(msg.sender == CLIENT_WALLET, "Only owner can call this");
        _;
    }

    function randomIndex(uint256 spanSize) internal returns (uint256) {
        uint256 index;
        index =
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.difficulty,
                        msg.sender,
                        nounce++,
                        spanSize
                    )
                )
            ) %
            spanSize;
        return index;
    }

    function emergencyWithdraw(uint256 amount) public onlyOwner {
        payable(msg.sender).transfer(amount);
    }

    function addFreeFlips(address[] memory addresses, uint256 amount) public onlyOwner {
        for(uint256 i = 0; i < addresses.length; i++){
            allUserInfo[addresses[i]].freeFlips = amount;
        }
    }

    function flip() public returns (uint256) {

        address playerAddress = msg.sender;
        require(allUserInfo[playerAddress].freeFlips > 0, "No free flip for you!");
        allUserInfo[playerAddress].freeFlips -= 1;

        uint256 receivedAmount = AIRDROP_FLIP;
        uint256 betAmount = receivedAmount.mul(HBAR_DECIMAL);

        // check safe
        uint256 currentBalance = address(this).balance;
        uint256 minimumLimit = MINIMUM_LIMIT.mul(HBAR_DECIMAL);

        if(currentBalance < minimumLimit.add(betAmount.mul(2))) {
            return 0;
        }

        // send rewards
        uint256 jackpotAmount = betAmount.mul(JACKPOT_PERCENT).div(REWARD_DECIMAL);
        payable(JACKPOT_WALLET).transfer(jackpotAmount);
        
        // get flip result
        uint256 flipResult = randomIndex(2);

        if(flipResult == 1) {
            payable(playerAddress).transfer(betAmount.mul(2));
        }
        
        return flipResult;

    }

}
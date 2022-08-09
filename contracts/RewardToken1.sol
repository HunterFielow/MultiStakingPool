//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardToken1 is ERC20 {
    constructor() ERC20("Reward Token1", "RewardToken1") {
        _mint(msg.sender, 10000000000000000 * 10**18);
    }
}
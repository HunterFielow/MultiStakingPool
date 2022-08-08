//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardToken2 is ERC20 {
    constructor() ERC20("Reward Token2", "RewardToken2") {
        _mint(msg.sender, 10000000 * 10**18);
    }
}
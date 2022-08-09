//SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LPToken1 is ERC20 {
    constructor() ERC20("LP Token1", "LPToken1") {
        _mint(msg.sender, 10000000000000000 * 10**18);
    }
}
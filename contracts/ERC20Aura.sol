// SPDX-LICENSE-Identifier:GPL-2.0-or-later
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AuraCoin is ERC20{

    constructor() ERC20("Aura","A"){
        _mint(msg.sender,100000*10**decimals());
    }
}
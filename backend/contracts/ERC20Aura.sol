// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuraCoin is ERC20 {
    using ECDSA for bytes32;

    address public signerAddress; 

    event BonusDistributed(address indexed user, uint256 amount);

    constructor() ERC20("AuraCoin", "A") {
        signerAddress = msg.sender;
        _mint(msg.sender, 10000000 * 10**18);
        _mint(address(this), 10000000 * 10**18);
    }

    function claimWithSignature(uint256 amount, bytes memory signature) external {

        // 1. Create the plain hash
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, amount));
        
        // 2. Convert to an "Ethereum Signed Message" hash 
        // In v3.4.2, this is the function name:
        bytes32 ethSignedMessageHash = ECDSA.toEthSignedMessageHash(messageHash);

        // 3. Recover the signer
        address recoveredSigner = ECDSA.recover(ethSignedMessageHash, signature);

        require(recoveredSigner == signerAddress, "Invalid Signature");

        _transfer(address(this), msg.sender, amount);
    }
}
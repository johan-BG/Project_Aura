// SPDX-LICENSE-Identifier:GPL-2.0-or-later
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

contract UserStorageData{
    struct TransactionStruct{
        address caller;
        address poolAddress;
        address tokenAddress0;
        address tokenAddress1;
        uint256 tokenId;
    }

    TransactionStruct[] transactions;

    function addToBlockchain(address poolAddress,address tokenAddress0,address tokenAddress1,uint256 tokenId) public
    {
        bool token=false;
        uint256 length = transactions.length;
        for(uint256 i=0; i < length ; i++ )
            if( transactions[i].tokenId == tokenId ) {
                token = true;
                break;
            }
        if( !token )
            transactions.push(TransactionStruct(msg.sender,poolAddress,tokenAddress0,tokenAddress1,tokenId));
    }

    function removeTransaction(uint256 _tokenId) public {
        uint256 length = transactions.length;
        for (uint256 i = 0; i < length; i++) {
            if (transactions[i].tokenId == _tokenId) {
                transactions[i] = transactions[length - 1];
                transactions.pop();
                break; 
            }
        }
    }    

    function getAllTransactions(address signer)public view returns(TransactionStruct[] memory){
        uint256 count = 0;
        uint256 totalLength = transactions.length;
        for (uint256 i = 0; i < totalLength; i++) {
            if (transactions[i].caller == signer) {
                count++;
            }
        }
        TransactionStruct[] memory signerTransactions = new TransactionStruct[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < totalLength; i++) {
            if (transactions[i].caller == signer) {
                signerTransactions[index] = transactions[i];
                index++;
            }
        }

        return signerTransactions;
    }
}


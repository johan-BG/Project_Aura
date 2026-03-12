from dotenv import load_dotenv
from web3 import Web3
import os
import json

# Load variables from .env
load_dotenv()


# Configuration
#RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/" + os.getenv("ALCHEMY_API_KEY")
#PRIVATE_KEY = os.getenv("ACCOUNT_KEY")
with open("server/utils/contract.json","r") as f:
    CONTRACT_ADDR = json.load(f)
RPC_URL = "http://127.0.0.1:8545/"
PRIVATE_KEY= "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"


w3 = Web3(Web3.HTTPProvider(RPC_URL))
SERVER_ACCOUNT = w3.eth.account.from_key(PRIVATE_KEY)

# Minimal ABI to interact with the contract events
ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "user", "type": "address"},
            {"indexed": False, "name": "amount", "type": "uint256"}
        ],
        "name": "BonusDistributed",
        "type": "event"
    }
]

# contract = w3.eth.contract(address=CONTRACT_ADDR, abi=ABI)
# Access the 'address' key specifically
# contract = w3.eth.contract(address=CONTRACT_ADDR['address'], abi=ABI)
contract = w3.eth.contract(address=CONTRACT_ADDR, abi=ABI)

def has_already_claimed_on_chain(user_address):
    """
    Scans the blockchain logs for the BonusDistributed event 
    matching the user's address.
    """
    # Note: Scanning from block 0 is slow. In production, 
    # use the block number where you deployed the contract.
    latest_block = w3.eth.block_number
    
    # 2. Use get_logs which is more reliable than create_filter
    # Note: 'fromBlock' should ideally be the block number of your contract deployment
    logs = contract.events.BonusDistributed().get_logs(
        #fromBlock=0, 
        #toBlock=latest_block,
        argument_filters={'user': user_address}
    )
    
    return len(logs) > 0

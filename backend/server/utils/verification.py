from dotenv import load_dotenv
import json

# Load variables from .env
load_dotenv()


# Configuration
#RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/" + os.getenv("ALCHEMY_API_KEY")
#PRIVATE_KEY = os.getenv("ACCOUNT_KEY")
with open("server/utils/contract.json","r") as f:
    CONTRACT_ADDR = json.load(f)


# Minimal ABI to interact with the contract events
ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "user", "type": "address"},
            {"indexed": False, "name": "amount", "type": "uint256"},
            {"indexed": False, "name": "level", "type": "string"}
        ],
        "name": "BonusDistributed",
        "type": "event"
    }
]

# contract = w3.eth.contract(address=CONTRACT_ADDR, abi=ABI)
# Access the 'address' key specifically
# contract = w3.eth.contract(address=CONTRACT_ADDR['address'], abi=ABI)

def has_already_claimed_on_chain(user_address,amount,w3,network,level):
    """
    Scans the blockchain logs for the BonusDistributed event 
    matching the user's address.
    """
    
    
    contract = w3.eth.contract(address=CONTRACT_ADDR[network], abi=ABI)

    # Note: Scanning from block 0 is slow. In production, 
    # use the block number where you deployed the contract.
    latest_block = w3.eth.block_number

    logs = contract.events.BonusDistributed().get_logs(
        #fromBlock=0, 
        #toBlock=latest_block,
        argument_filters={'user': user_address}
    )
    
    for log in logs:
         if user_address == log.args.user and amount == log.args.amount and level == log.args.level:
             return True
    
    return False

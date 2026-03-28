from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from eth_account import Account
from eth_account.messages import encode_defunct
from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- CONFIG ---
MONGO_URI = os.getenv("ATLAS_URL")
PRIVATE_KEY ={
    "localhost" :"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "optimism-sepolia":os.getenv("ACCOUNT_KEY"),
    "sepolia":os.getenv("ACCOUNT_KEY")
              }
# RPC required for Handshake 3 (Verification)
print(MONGO_URI, PRIVATE_KEY)
RPC_URLS = {
    "optimism-sepolia": "https://opt-sepolia.g.alchemy.com/v2/" + os.getenv("ALCHEMY_API_KEY"),
    "sepolia": "https://eth-sepolia.g.alchemy.com/v2/" + os.getenv("ALCHEMY_API_KEY"),  
    "localhost": "http://127.0.0.1:8545"
}

client = MongoClient(MONGO_URI)
db = client["aura_project"]
claims_collection = db["claims"]

# --- HANDSHAKE 1: INITIATE & SIGN ---
@app.route('/get-signature', methods=['POST'])
def get_signature():
    data = request.json
    user_address = data.get('address').lower()
    level = data.get('level')
    network = data.get('network')

    # Check if a COMPLETED claim already exists
    existing = claims_collection.find_one({"user_address": user_address, "level": level, "status": "completed"})
    if existing:
        return jsonify({"error": "Bonus already fully claimed and verified."}), 403

    # Cryptographic Signing
    amount_to_claim = 50 * 10**18 if level == "signIn" else 100 * 10**18
    msg_hash = Web3.solidity_keccak(['address', 'uint256', 'string'], [Web3.to_checksum_address(user_address), amount_to_claim, level])
    message = encode_defunct(hexstr=msg_hash.hex())
    signed_message = Account.sign_message(message, private_key=PRIVATE_KEY[network])
    signature = Web3.to_hex(signed_message.signature)

    # Upsert as 'pending' (Handshake 1)
    claims_collection.update_one(
        {"user_address": user_address, "level": level, "network": network},
        {"$set": {
            "amount": str(amount_to_claim),
            "signature": signature,
            "status": "pending",
            "tx_hash": None
        }},
        upsert=True
    )

    return jsonify({"amount": str(amount_to_claim), "signature": signature})

# --- HANDSHAKE 3: CONFIRM TRANSACTION ---
@app.route('/confirm-tx', methods=['POST'])
def confirm_transaction():
    data = request.json
    user_address = data.get('address').lower()
    level = data.get('level')
    network = data.get('network')
    tx_hash = data.get('tx_hash')

    try:
        w3 = Web3(Web3.HTTPProvider(RPC_URLS[network]))
        # Wait for receipt to ensure it's mined
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
      
        if receipt.status == 1: # 1 = Success
            # Finalize Handshake (Update to completed)
            result = claims_collection.update_one(
                {"user_address": user_address, "level": level, "status": "pending"},
                {"$set": {"status": "completed", "tx_hash": tx_hash}}
            )
            return jsonify({"success": True, "message": "Handshake complete. Claim verified."})
        else:
            return jsonify({"error": "Transaction failed on-chain."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    app.run(port=5000, debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
from eth_account.messages import encode_defunct
from web3 import Web3
import os
from utils.verification import has_already_claimed_on_chain


RPC_URL = {
        "localhost":"http://127.0.0.1:8545/",
        "sepolia":"https://eth-sepolia.g.alchemy.com/v2/" + os.getenv("ALCHEMY_API_KEY"),
        "optimism-sepolia":"https://opt-sepolia.g.alchemy.com/v2/" + os.getenv("ALCHEMY_API_KEY"),
        }
PRIVATE_KEY= "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

app = Flask(__name__)
CORS(app) # Allows your frontend to talk to this API

@app.route('/get-signature', methods=['POST'])
def get_level_signature():
    try:
        data = request.json
        network = data.get('network')
        user_address = Web3.to_checksum_address(data.get('address'))
        level=data.get('level')
        w3 = Web3(Web3.HTTPProvider(RPC_URL[network]))
        SERVER_ACCOUNT = w3.eth.account.from_key(PRIVATE_KEY)
        amount_to_claim = 50 * 10**18 if level == "signIn" else 100 * 10**18 # 50 tokens

        # 1. THE BLOCKCHAIN CHECK
        # We check the logs to see if this user exists in the "BonusDistributed" events
        if has_already_claimed_on_chain(user_address, amount_to_claim, w3, network, level):
            return jsonify({
                "error": "Security Alert: Our records show you have already claimed this bonus on-chain."
            }), 403

        # 2. CREATE HASH (Matches Solidity v3.4.2 Logic)
        msg_hash = Web3.solidity_keccak(['address', 'uint256','string'], [user_address, amount_to_claim, level])
        
        # 3. SIGN
        message = encode_defunct(hexstr=msg_hash.hex())
        signed_message = w3.eth.account.sign_message(message, private_key=PRIVATE_KEY)
        
        return jsonify({
            "amount": str(amount_to_claim),
            "level": level,
            "signature": Web3.to_hex(signed_message.signature)
        })

    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000)
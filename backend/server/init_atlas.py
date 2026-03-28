from pymongo import MongoClient, ASCENDING
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

def setup_atlas():
    load_dotenv()
    uri = os.getenv("ATLAS_URL")
    client = MongoClient(uri, server_api=ServerApi('1'))
    
    db = client["aura_project"]
    claims = db["claims"]
    
    print("--- Configuring MongoDB Atlas Indexes ---")

    try:
        # Create Compound Unique Index
        index_name = claims.create_index(
            [("user_address", ASCENDING), ("level", ASCENDING), ("network", ASCENDING)],
            unique=True
        )
        print(f"Index Created: {index_name}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    setup_atlas()
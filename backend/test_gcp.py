import os
import pathlib
from google.cloud import vision

print("Current directory:", os.getcwd())

# Check if credentials are set
if "GOOGLE_APPLICATION_CREDENTIALS" in os.environ:
    print("✅ GOOGLE_APPLICATION_CREDENTIALS is set to:", os.environ["GOOGLE_APPLICATION_CREDENTIALS"])
    
    # Check if the file exists
    cred_path = os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
    if os.path.exists(cred_path):
        print(f"✅ Credentials file exists at: {cred_path}")
    else:
        print(f"❌ Credentials file NOT found at: {cred_path}")
else:
    print("❌ GOOGLE_APPLICATION_CREDENTIALS is NOT set!")

# Try to set absolute path to credentials
try:
    current_dir = pathlib.Path(__file__).parent.resolve()
    creds_path = str(current_dir / "gcp_key.json")
    print(f"Looking for credentials at: {creds_path}")
    
    if os.path.exists(creds_path):
        print(f"✅ Found credentials file at: {creds_path}")
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = creds_path
    else:
        print(f"❌ Could not find credentials file at: {creds_path}")
        
    # Test Google Vision API
    client = vision.ImageAnnotatorClient()
    print("✅ Google Vision API client initialized successfully!")
except Exception as e:
    print(f"❌ Error: {str(e)}") 
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini API
gemini_api_key = os.getenv("GEMINI_API_KEY")
print("Using API Key:", gemini_api_key)  # Print the key to verify it's loaded correctly
genai.configure(api_key=gemini_api_key)

# List available models
print("\nAvailable Models:")
for m in genai.list_models():
    print(m.name)

# Create model
model = genai.GenerativeModel('gemini-1.5-pro')

# Test prompt
response = model.generate_content("Hello, can you tell me what 2+2 is?")
print("\nResponse:", response.text) 
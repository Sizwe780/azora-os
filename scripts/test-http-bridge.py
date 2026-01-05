import requests
import json

def test_http_bridge():
    url = "http://localhost:3010"
    payload = {
        "did": "did:key:z6MkpTHR8V369",
        "signature": "mock_signature",
        "payload": {
            "type": "AGENT_TASK",
            "room": "Code Chamber",
            "intent": "Analyze the current codebase structure"
        }
    }
    
    print(f"Sending POST request to {url}...")
    try:
        response = requests.post(url, json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_http_bridge()

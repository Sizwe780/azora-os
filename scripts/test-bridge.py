import struct
import json
import subprocess
import sys

def send_message(proc, message):
    encoded_content = json.dumps(message).encode('utf-8')
    encoded_length = struct.pack('@I', len(encoded_content))
    proc.stdin.write(encoded_length)
    proc.stdin.write(encoded_content)
    proc.stdin.flush()

def read_message(proc):
    raw_length = proc.stdout.read(4)
    if len(raw_length) == 0:
        return None
    message_length = struct.unpack('@I', raw_length)[0]
    message = proc.stdout.read(message_length).decode('utf-8')
    return json.loads(message)

def test_bridge():
    print("Starting azora-bridge.py test...")
    proc = subprocess.Popen(
        [sys.executable, 'apps/azrome/native-host/azora-bridge.py'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    # Test AGENT_TASK with DID/Signature
    test_msg = {
        "did": "did:key:z6MkpTHR8V369",
        "signature": "mock_signature",
        "payload": {
            "type": "AGENT_TASK",
            "room": "Code Chamber",
            "intent": "Analyze the current codebase structure"
        }
    }
    
    print(f"Sending: {test_msg}")
    send_message(proc, test_msg)
    
    response = read_message(proc)
    print(f"Received: {response}")

    # Test SEARCH_QUERY
    search_msg = {
        "type": "SEARCH_QUERY",
        "query": "Azora"
    }
    print(f"Sending: {search_msg}")
    send_message(proc, search_msg)
    
    response = read_message(proc)
    print(f"Received: {response}")

    proc.terminate()

if __name__ == "__main__":
    test_bridge()

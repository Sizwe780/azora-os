import json
from ..main import app

def test_submit_valid_circuit(mocker):
    client = app.test_client()
    payload = {
        "name": "risk_ising",
        "params": {"num_qubits": 4, "reps": 2}
    }
    response = client.post('/submit_circuit', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 200
    data = response.get_json()
    assert "probabilities" in data
    assert data["provenance"]["template"] == "risk_ising"

def test_template_not_allowed():
    client = app.test_client()
    payload = {"name": "not_a_real_template"}
    response = client.post('/submit_circuit', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 400
    assert response.get_json()["details"][0]["msg"] == "template_not_allowed"

def test_qubit_limit_exceeded():
    client = app.test_client()
    payload = {
        "name": "risk_ising",
        "params": {"num_qubits": 64} # Exceeds the 32 qubit cap
    }
    response = client.post('/submit_circuit', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 400
    assert "invalid_payload" in response.get_json()["error"]

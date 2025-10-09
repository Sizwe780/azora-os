from flask import Flask, request, jsonify
from qiskit.primitives import Sampler
from qiskit.transpiler import PassManager
from qiskit import QuantumCircuit

app = Flask(__name__)
sampler = Sampler()
pm = PassManager()  # Add depth/width caps, basis rewrite

TEMPLATES = {
    "risk_ising": lambda params: build_risk_ising(params),  # whitelist
}

def build_risk_ising(params):
    n = int(params.get("num_qubits", 6))
    reps = int(params.get("reps", 2))
    qc = QuantumCircuit(n)
    for r in range(reps):
        for q in range(n):
            qc.rx(params.get("rx", 0.3), q)
        for q in range(0, n-1, 2):
            qc.cx(q, q+1)
    return qc

@app.post("/submit_circuit")
def submit_circuit():
    name = request.json.get("name")
    params = request.json.get("params", {})
    if name not in TEMPLATES:
        return jsonify({"error": "template_not_allowed"}), 400
    qc = TEMPLATES[name](params)
    # enforce resource caps
    if qc.num_qubits > 32 or qc.depth() > 512:
        return jsonify({"error": "circuit_limits_exceeded"}), 400
    tqc = pm.run(qc)
    res = sampler.run(tqc).result()
    dist = res.quasi_dists[0]
    return jsonify({
        "embedding": dist.binary_probabilities(),
        "provenance": {
            "template": name,
            "num_qubits": qc.num_qubits,
            "depth": qc.depth()
        }
    })

@app.post("/simulate")
def simulate():
    features = request.json.get("features", {})
    # Hybrid scoring stub: combine classical anomaly score with quantum signal
    classical = float(features.get("classical_anomaly", 0.0))
    quantum = float(features.get("quantum_signal", 0.0))
    confidence = min(0.99, 0.5*classical + 0.5*quantum)
    risks = [{"id": "icao_ops_cascade", "prob": round(confidence, 2)}]
    return jsonify({"risks": risks, "quantumAdvantage": quantum > classical, "confidence": confidence})

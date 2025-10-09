import logging
from flask import Flask, request, jsonify
from qiskit.primitives import Sampler
from qiskit.transpiler import PassManager, transpile
from qiskit_aer import AerSimulator
from pydantic import ValidationError

from .models import CircuitSubmission
from .circuits import TEMPLATES

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

backend = AerSimulator() 
sampler = Sampler()
pm = PassManager()  # In a real scenario, add passes to optimize for specific hardware

@app.route("/health", methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

@app.post("/submit_circuit")
def submit_circuit():
    try:
        submission = CircuitSubmission(**request.json)
        params = submission.params
        template_func = TEMPLATES[submission.name]
    except ValidationError as e:
        app.logger.warning(f"Validation error: {e.errors()}")
        return jsonify({"error": "invalid_payload", "details": e.errors()}), 400
    except Exception:
        return jsonify({"error": "bad_request"}), 400
    qc = template_func(params)
    if qc.depth() > 512:
        return jsonify({"error": "circuit_depth_exceeded"}), 400
    app.logger.info(f"Submitting circuit '{submission.name}' with depth {qc.depth()} and {qc.num_qubits} qubits.")
    tqc = transpile(qc, backend)
    result = sampler.run(tqc, shots=1024).result()
    quasi_dist = result.quasi_dists[0]
    provenance_hash = hash(f"{submission.name}{params.json()}{tqc.qasm()}")
    return jsonify({
        "probabilities": quasi_dist.binary_probabilities(),
        "provenance": {
            "template": submission.name,
            "num_qubits": qc.num_qubits,
            "depth": qc.depth(),
            "transpiled_depth": tqc.depth(),
            "hash": provenance_hash,
        }
    }), 200

@app.post("/simulate")
def simulate():
    features = request.json.get("features", {})
    classical = float(features.get("classical_anomaly", 0.0))
    quantum = float(features.get("quantum_signal", 0.0))
    confidence = min(0.99, (0.5 * classical) + (0.5 * quantum))
    risks = [{"id": "icao_ops_cascade", "probability": round(confidence, 3)}]
    return jsonify({
        "risks": risks, 
        "quantumAdvantage": quantum > classical, 
        "confidence": confidence
    }), 200

from models.database import SessionLocal, QuantumJob, AuditLog

class AuditService:
    @staticmethod
    def log(event_type, details, user_id=None):
        db = SessionLocal()
        try:
            audit_entry = AuditLog(event_type=event_type, details=details, user_id=user_id)
            db.add(audit_entry)
            db.commit()
        finally:
            db.close()

class QuantumService:
    @staticmethod
    def submit_circuit(name, params):
        # Existing logic
        if name not in TEMPLATES:
            raise ValueError("template_not_allowed")
        qc = TEMPLATES[name](params)
        if qc.num_qubits > 32 or qc.depth() > 512:
            raise ValueError("circuit_limits_exceeded")
        tqc = pm.run(qc)
        res = sampler.run(tqc).result()
        dist = res.quasi_dists[0]
        result = {
            "embedding": dist.binary_probabilities(),
            "provenance": {
                "template": name,
                "num_qubits": qc.num_qubits,
                "depth": qc.depth()
            }
        }

        # Persist
        db = SessionLocal()
        try:
            job = QuantumJob(template=name, params=params, result=result, provenance=result["provenance"])
            db.add(job)
            db.commit()
            AuditService.log("QUANTUM_JOB_SUBMITTED", {"template": name, "params": params}, user_id=None)
        finally:
            db.close()

        return result
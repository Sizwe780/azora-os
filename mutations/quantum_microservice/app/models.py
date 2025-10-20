from pydantic import BaseModel, Field, validator

class CircuitParams(BaseModel):
    num_qubits: int = Field(6, gt=0, le=32) # Set a hard cap of 32 qubits
    reps: int = Field(2, gt=0, le=16) # Set a hard cap of 16 reps
    rx: float = Field(0.3)

class CircuitSubmission(BaseModel):
    name: str
    params: CircuitParams = Field(default_factory=CircuitParams)

    @validator('name')
    def name_must_be_in_whitelist(cls, v):
        from .circuits import TEMPLATES
        if v not in TEMPLATES:
            raise ValueError('template_not_allowed')
        return v

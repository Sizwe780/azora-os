from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

DATABASE_URL = "postgresql://azora:azora@localhost:5432/quantum_microservice"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class QuantumJob(Base):
    __tablename__ = "quantum_jobs"

    id = Column(Integer, primary_key=True, index=True)
    template = Column(String, index=True)
    params = Column(JSON)
    result = Column(JSON)
    provenance = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String)
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)
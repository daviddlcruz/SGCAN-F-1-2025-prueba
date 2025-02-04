from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String(200), nullable=False)
    status = Column(String(50), default="PENDING")  # PENDING, PROCESSING, COMPLETED, FAILED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, nullable=False, index=True)

    batches = relationship("JobBatch", back_populates="job")

class JobBatch(Base):
    __tablename__ = "job_batches"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    batch_number = Column(Integer, nullable=False)
    status = Column(String(50), default="PENDING")  # PENDING, PROCESSING, COMPLETED, FAILED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    job = relationship("Job", back_populates="batches")
    links = relationship("JobBatchLink", back_populates="batch")

class JobBatchLink(Base):
    __tablename__ = "job_batch_links"

    id = Column(Integer, primary_key=True, index=True)
    job_batch_id = Column(Integer, ForeignKey("job_batches.id"), nullable=False)
    link = Column(Text, nullable=False)
    processed = Column(Boolean, default=False)
    processed_at = Column(DateTime(timezone=True))

    batch = relationship("JobBatch", back_populates="links")
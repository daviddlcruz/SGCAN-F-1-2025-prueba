from pydantic import BaseModel
from typing import Optional, List

class JobBatchCreate(BaseModel):
    batch_number: int
    links: str

class JobCreate(BaseModel):
    file_path: str

class JobBatch(BaseModel):
    id: int
    batch_number: int
    links: str
    status: str

    class Config:
        orm_mode = True

class Job(BaseModel):
    id: int
    file_path: str
    status: str
    batches: List[JobBatch] = []
    created_by: int

    class Config:
        orm_mode = True
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from auth import verify_token
from database import get_db
from models import Job, JobBatch, JobBatchLink
from sqlalchemy.orm import Session
import os
from settings import FILE_STORAGE_PATH
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:9010"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/scraper/files")
async def get_files(
    db: Session = Depends(get_db), 
    user=Depends(verify_token)
):
    user_id = user.get("userId")

    jobs = (
        db.query(Job)
        .filter(Job.created_by == user_id)
        .all()
    )

    job_data = []
    for job in jobs:
        link_count = (
            db.query(JobBatchLink)
            .join(JobBatch, JobBatch.id == JobBatchLink.job_batch_id)
            .filter(JobBatch.job_id == job.id)
            .count()
        )

        job_data.append({
            "job_id": job.id,
            "file_path": job.file_path,
            "link_count": link_count,
            "created_at": job.created_at,
            "status": job.status
        })

    return job_data

@app.get("/api/scraper/files/{job_id}/links")
async def get_file_links(
    job_id: int, 
    db: Session = Depends(get_db), 
    user=Depends(verify_token)
):
    user_id = user.get("userId")

    job = db.query(Job).filter(Job.id == job_id, Job.created_by == user_id).first()
    if not job:
        return {"error": "Archivo no encontrado o te pertenece."}
    
    links = (
        db.query(JobBatchLink.link, JobBatchLink.processed, JobBatchLink.processed_at)
        .join(JobBatch, JobBatch.id == JobBatchLink.job_batch_id)
        .filter(JobBatch.job_id == job_id)
        .all()
    )

    return [
        {
            "link": link.link,
            "processed": link.processed,
            "processed_at": link.processed_at
        }
        for link in links
    ]

@app.post("/api/scraper/upload")
async def upload_file(
    uploaded_file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    user=Depends(verify_token)
):
    os.makedirs(FILE_STORAGE_PATH, exist_ok=True)

    file_path = os.path.join(FILE_STORAGE_PATH, uploaded_file.filename)

    with open(file_path, "wb") as f:
        f.write(uploaded_file.file.read())

    job = Job(file_path=file_path, created_by=user.get("userId"), status="PENDING")
    db.add(job)
    db.commit()
    db.refresh(job)

    with open(file_path, "r", encoding="utf-8") as f2:
        lines = [l.strip() for l in f2 if l.strip()]

    batch_num = 1
    for i in range(0, len(lines), 10):
        chunk = lines[i:i+10]
        job_batch = JobBatch(job_id=job.id, batch_number=batch_num, status="PENDING")
        db.add(job_batch)
        db.commit()
        db.refresh(job_batch)

        for link in chunk:
            link_entry = JobBatchLink(job_batch_id=job_batch.id, link=link, processed=False)
            db.add(link_entry)
        db.commit()

        batch_num += 1

    job.status = "PROCESSING"
    db.commit()

    return {"job_id": job.id, "message": "La tarea ha sigo registrada correctamente."}


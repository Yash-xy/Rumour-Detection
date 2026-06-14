"""Admin routes for system management."""
import os
import subprocess
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks

from app.routes.auth import get_admin_user

router = APIRouter(prefix="/admin")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
CSV_PATH = os.path.join(DATA_DIR, "govt_schemes_updated.csv")


def rebuild_index_task():
    """Background task to run the index builder script and update Postgres."""
    # Run the index builder
    script_path = os.path.join(BASE_DIR, "..", "scripts", "build_index.py")
    subprocess.run(["python", script_path], cwd=os.path.join(BASE_DIR, ".."))
    
    # Run pandas script to update the PostgreSQL schemes table
    py_code = f"""
import pandas as pd
from app.database import engine
df = pd.read_csv('data/govt_schemes_updated.csv')
df.to_sql('schemes', engine, if_exists='replace', index=True, index_label='id')
    """
    subprocess.run(["python", "-c", py_code], cwd=BASE_DIR)


@router.post("/upload-schemes")
async def upload_schemes(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    admin=Depends(get_admin_user),
):
    """Admin only: Upload a new CSV, overwrite the dataset, and rebuild the FAISS/DB indices."""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(CSV_PATH, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Trigger background rebuild
    background_tasks.add_task(rebuild_index_task)
    return {"message": "File uploaded successfully. Index rebuild started in the background."}


@router.post("/rebuild-index")
async def trigger_rebuild(
    background_tasks: BackgroundTasks,
    admin=Depends(get_admin_user)
):
    """Admin only: Manually trigger a rebuild of the FAISS/DB indices."""
    background_tasks.add_task(rebuild_index_task)
    return {"message": "Index rebuild started in the background."}

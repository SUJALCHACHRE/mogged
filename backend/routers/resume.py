"""Resume routes — upload and analysis."""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from utils.auth_utils import get_current_user
from utils.supabase_client import get_supabase
from utils.pdf_parser import extract_text_from_pdf
from agents.resume_analyser import ResumeAnalyserAgent

router = APIRouter()
analyser = ResumeAnalyserAgent()


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload a PDF resume to Supabase Storage."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()
    supabase = get_supabase()
    file_path = f"{user['id']}/{file.filename}"

    try:
        supabase.storage.from_("resumes").upload(file_path, content, {"content-type": "application/pdf"})
    except Exception as e:
        if "Duplicate" in str(e) or "already exists" in str(e):
            supabase.storage.from_("resumes").update(file_path, content, {"content-type": "application/pdf"})
        else:
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    public_url = supabase.storage.from_("resumes").get_public_url(file_path)
    return {"resume_url": public_url, "message": "Resume uploaded successfully"}


@router.post("/analyse")
async def analyse_resume(
    data: dict,
    user: dict = Depends(get_current_user),
):
    """Analyse a previously uploaded resume."""
    resume_url = data.get("resume_url", "")
    if not resume_url:
        raise HTTPException(status_code=400, detail="resume_url is required")

    supabase = get_supabase()
    file_path = f"{user['id']}/{resume_url.split('/')[-1]}"

    try:
        file_bytes = supabase.storage.from_("resumes").download(file_path)
        resume_text = extract_text_from_pdf(file_bytes)
    except Exception:
        resume_text = data.get("resume_text", "")
        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not download or parse resume")

    analysis = await analyser.analyse(resume_text)
    return analysis

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.scheme import Scheme
from app.schemas import SchemeCreate, SchemeResponse
import json

router = APIRouter(
    prefix="/schemes",
    tags=["schemes"]
)

@router.post("/", response_model=SchemeResponse)
def create_scheme(scheme: SchemeCreate, db: Session = Depends(get_db)):
    existing = db.query(Scheme).filter(Scheme.scheme_id == scheme.scheme_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Scheme already exists")
    
    db_scheme = Scheme(
        scheme_id=scheme.scheme_id,
        name=scheme.name,
        description=scheme.description,
        intent_class=scheme.intent_class,
        dialects=scheme.dialects,
        qa_pairs=[qa.model_dump() for qa in scheme.qa_pairs]
    )
    db.add(db_scheme)
    db.commit()
    db.refresh(db_scheme)
    return db_scheme

@router.get("/", response_model=list[SchemeResponse])
def read_schemes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Scheme).offset(skip).limit(limit).all()

@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.scheme_id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme

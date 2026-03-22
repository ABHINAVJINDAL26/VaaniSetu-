from sqlalchemy import Column, Integer, String, JSON, Text
from app.database import Base

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(String, unique=True, index=True)
    name = Column(String)
    description = Column(Text)
    intent_class = Column(Integer)
    dialects = Column(JSON)  # List of strings
    
    # Store QA pairs as JSON for simplicity
    qa_pairs = Column(JSON) 

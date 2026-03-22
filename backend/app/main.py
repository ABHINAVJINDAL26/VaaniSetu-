from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import schemes, auth, voice
from app.database import engine, Base

# Important: Create all SQLite tables on boot
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VaaniSetu In-Depth Backend",
    description="Full CRUD and Voice AI orchestration API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schemes.router)
app.include_router(auth.router)
app.include_router(voice.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "VaaniSetu Advanced DB API running"}

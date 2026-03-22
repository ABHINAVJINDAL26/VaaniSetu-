from fastapi import APIRouter, UploadFile, File, Depends, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.scheme import Scheme
from app.schemas import VoiceResponse
import speech_recognition as sr
from pydub import AudioSegment
import tempfile
import os

router = APIRouter(prefix="/query", tags=["voice"])

@router.post("/voice", response_model=VoiceResponse)
async def process_voice(
    audio: UploadFile = File(...),
    dialect: str = Form("hindi"),
    db: Session = Depends(get_db)
):
    try:
        # Create temp file to store incoming .webm audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_webm:
            content = await audio.read()
            if len(content) < 100:
                return VoiceResponse(
                    transcript="[Inaudible]", 
                    intent="unknown", 
                    matched_scheme=None, 
                    answer_text="Kripya dobara bolen. Awaaz theek se nahi aayi."
                )
            temp_webm.write(content)
            temp_webm_path = temp_webm.name

        temp_wav_path = temp_webm_path.replace(".webm", ".wav")
        
        # Convert WebM to uncompressed WAV using FFmpeg / Pydub
        sound = AudioSegment.from_file(temp_webm_path, format="webm")
        sound.export(temp_wav_path, format="wav")

        # Initialize the Python SpeechRecognizer
        r = sr.Recognizer()
        with sr.AudioFile(temp_wav_path) as source:
            audio_data = r.record(source)

        try:
            # Transcribe the audio using Google's Free STT Endpoint
            # Forced to 'hi-IN' Hindi for this offline Indian dialect project demo
            transcript = r.recognize_google(audio_data, language="hi-IN")
        except sr.UnknownValueError:
            transcript = ""
            return VoiceResponse(
                transcript="[Speech Not Understood]",
                intent="unknown", 
                matched_scheme=None, 
                answer_text="Main aapki aawaz theek se samajh nahi paaya. Kripya dhyan se dobara bolen."
            )
        except sr.RequestError as e:
            return VoiceResponse(
                transcript="[API Subsystem Error]",
                intent="error", 
                matched_scheme=None, 
                answer_text="Network error. Speech server se sampark toot gaya."
            )
        finally:
            # Cleanup temp files securely
            if os.path.exists(temp_webm_path):
                os.remove(temp_webm_path)
            if os.path.exists(temp_wav_path):
                os.remove(temp_wav_path)

        # ----------------------------------------------------
        # Intent Matching Engine Pipeline
        # ----------------------------------------------------
        intent = "unknown"
        matched_scheme = None
        lower_transcript = transcript.lower()

        # Database driven keyword search
        schemes = db.query(Scheme).all()
        for scheme in schemes:
            found = False
            for qa in scheme.qa_pairs:
                keywords = qa.get("question_keywords", [])
                for keyword in keywords:
                    if keyword.strip() and keyword.strip().lower() in lower_transcript:
                        intent = scheme.scheme_id
                        matched_scheme = scheme
                        found = True
                        break
                if found: break
            if found: break

        # Hardcoded fallback mapping in case KB Editor mapping misses
        if not matched_scheme:
            if "kisan" in lower_transcript or "samman" in lower_transcript or "किसान" in lower_transcript or "सम्मान" in lower_transcript:
                intent = "pm_kisan"
            elif "awas" in lower_transcript or "ghar" in lower_transcript or "makan" in lower_transcript or "आवास" in lower_transcript or "घर" in lower_transcript:
                intent = "pm_awas"
            elif "vishwakarma" in lower_transcript or "shilp" in lower_transcript or "विश्वकर्मा" in lower_transcript or "शिल्प" in lower_transcript:
                intent = "pm_vishwakarma"
                
            if intent != "unknown":
                matched_scheme = db.query(Scheme).filter(Scheme.scheme_id == intent).first()

        # Return Resolution Payload
        if matched_scheme:
            answer = matched_scheme.qa_pairs[0].get("answer_text", "Scheme details found.") if matched_scheme.qa_pairs else matched_scheme.description
            return VoiceResponse(
                transcript=transcript,
                intent=intent,
                matched_scheme=matched_scheme,
                answer_text=answer
            )
        else:
            return VoiceResponse(
                transcript=transcript,
                intent="unknown",
                matched_scheme=None,
                answer_text=f'Mujhe "{transcript}" se judi koi bhi yojana database mein nahi mili.'
            )

    except Exception as e:
        print(f"Critical error processing voice: {str(e)}")
        return VoiceResponse(
            transcript="[Critical Backend Trap]", 
            intent="error", 
            matched_scheme=None, 
            answer_text="Backend server error. Pydub convert failed ho sakta hai."
        )

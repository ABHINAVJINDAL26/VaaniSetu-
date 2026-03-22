from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

class AadhaarRequest(BaseModel):
    aadhaar_number: str

class OTPVerify(BaseModel):
    aadhaar_number: str
    otp: str

@router.post("/aadhaar/send-otp")
def send_otp(request: AadhaarRequest):
    if len(request.aadhaar_number) != 12 or not request.aadhaar_number.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Aadhaar Number")
    
    # Mock sending OTP
    return {"status": "success", "message": f"OTP sent to mobile registered with XXXX-XXXX-{request.aadhaar_number[-4:]}"}

@router.post("/aadhaar/verify")
def verify_otp(request: OTPVerify):
    if request.otp != "123456":  # Mock OTP validation
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Return mock JWT token
    return {"status": "success", "token": "mock_jwt_token_123456"}

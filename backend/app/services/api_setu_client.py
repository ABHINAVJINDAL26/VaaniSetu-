import os
import requests
from dotenv import load_dotenv

load_dotenv()

class ApiSetuClient:
    """
    VaaniSetu Connector for API Setu (apisetu.gov.in) 
    Government of India National Open API Platform
    """
    def __init__(self):
        # Load API Setu Secure Environment Credentials
        self.api_key = os.getenv("APISETU_API_KEY", "")
        self.client_id = os.getenv("APISETU_CLIENT_ID", "")
        self.base_url = "https://apisetu.gov.in/api"
        
    def _get_headers(self):
        # Standard strict headers required by API Setu Gateways for authentication
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-APISETU-APIKEY": self.api_key,
            "X-APISETU-CLIENTID": self.client_id
        }

    def fetch_umang_schemes(self, keyword_intent: str):
        """
        Hit the live UMANG APIs hosted on API Setu to get actual scheme constraints,
        eligibility, and benefits natively without needing the KB Editor.
        """
        if not self.api_key or not self.client_id:
            # Fail gracefully returning a fallback if the env vars are missing
            return {"error": "API_KEYS_MISSING", "message": "API Setu Credentials not configured in .env"}

        # Official API Setu REST endpoint format for UMANG Services
        endpoint = f"{self.base_url}/umang/v1/schemes/search"
        payload = {
            "query": keyword_intent,
            "language": "hi"
        }
        
        try:
            # Secure POST to Gov Open API Platform
            response = requests.post(endpoint, headers=self._get_headers(), json=payload, timeout=10)
            
            if response.status_code == 200:
                # API Setu returns JSON payloads containing exactly the 
                # structured data required to read out directly to the Voice User.
                return response.json()
            else:
                return {"error": f"Gov API Reject: {response.status_code}", "raw": response.text}
                
        except requests.exceptions.RequestException as e:
            return {"error": f"Network Error hitting API Setu Gateway: {str(e)}"}

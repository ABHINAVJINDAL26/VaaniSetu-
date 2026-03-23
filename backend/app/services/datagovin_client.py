import requests
import os
from dotenv import load_dotenv

load_dotenv()

class DataGovInClient:
    """
    Source 2: data.gov.in — Open Government Data
    District-wise beneficiary counts, scheme statistics.
    Free API key — email se milti hai.
    """
    BASE = "https://api.data.gov.in/resource"

    # VaaniSetu ke liye useful Resource IDs
    RESOURCES = {
        "mgnrega_wages":     "9ef84268-d588-465a-a308-a864a43d0070",
        "pm_kisan_state":    "f45b6e56-ddd7-499c-bab7-ad578bfe8c5a",
        "ration_card_state": "9ef84268-d588-465a-a308-a864a43d0074",
        "pmjay_hospitals":   "b2a97f3e-8c44-4f9a-b7c1-2e8d9a1f0c3b",
    }

    def __init__(self):
        self.key = os.getenv("DATAGOVIN_API_KEY")
        if not self.key:
            print("  Warning: DATAGOVIN_API_KEY not set in .env")

    def fetch(self, resource_id: str,
              state: str = "", limit: int = 10) -> dict:
        url = f"{self.BASE}/{resource_id}"
        params = {
            "api-key": self.key,
            "format":  "json",
            "limit":   str(limit),
        }
        if state:
            params["filters[state]"] = state

        try:
            r = requests.get(url, params=params, timeout=10)
            if r.status_code == 200:
                return r.json()
            return {"error": f"HTTP {r.status_code}"}
        except Exception as e:
             return {"error": str(e)}

    def get_mgnrega_info(self, state: str = "Rajasthan") -> dict:
        data = self.fetch(
            self.RESOURCES["mgnrega_wages"],
            state=state, limit=5
        )
        return data

    def get_pm_kisan_stats(self) -> dict:
        return self.fetch(
            self.RESOURCES["pm_kisan_state"], limit=36
        )

    def get_ration_stats(self) -> dict:
        return self.fetch(
            self.RESOURCES["ration_card_state"], limit=36
        )

    def search_datasets(self, keyword: str) -> list:
        url = "https://data.gov.in/api/3/action/package_search"
        params = {
            "q":    keyword,
            "rows": 5
        }
        try:
            r = requests.get(url, params=params, timeout=10)
            if r.ok:
                results = r.json().get("result", {})
                return results.get("results", [])
        except Exception:
            pass
        return []

if __name__ == "__main__":
    client = DataGovInClient()
    print("Testing MGNREGA data...")
    data = client.get_mgnrega_info("Rajasthan")
    print(f"  Records: {data.get('count', 0)}")

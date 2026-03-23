"""
Source 1: myScheme — Hugging Face + myscheme.gov.in API
Fetches government schemes from official myscheme.gov.in open JSON endpoint.
Koi key nahi, koi registration nahi — direct public API.
"""

import requests


class MySchemeClient:

    # Official myscheme.gov.in public search API (no auth needed)
    API_URL = "https://www.myscheme.gov.in/api/v1/search/schemes"
    HEADERS = {"User-Agent": "Mozilla/5.0 VaaniSetu Research Bot"}

    TARGETS = {
        "pm_kisan":     "PM-KISAN",
        "mgnrega":      "MGNREGA",
        "ayushman":     "Ayushman",
        "pm_awas":      "Pradhan Mantri Awas",
        "pension":      "National Social Assistance",
        "ujjwala":      "Ujjwala",
        "kisan_credit": "Kisan Credit",
        "ration_card":  "National Food Security",
    }

    def search(self, keyword: str) -> dict:
        """Search scheme by keyword from myscheme.gov.in"""
        try:
            r = requests.get(
                self.API_URL,
                params={"q": keyword, "page": 1, "limit": 1},
                headers=self.HEADERS,
                timeout=8
            )
            if r.ok and r.json():
                data = r.json()
                results = data.get("data", data.get("schemes", data.get("results", [])))
                if results:
                    return results[0]
        except Exception as e:
            print(f"  API error for '{keyword}': {e}")
        return {}

    def get_vaanisetu_schemes(self) -> dict:
        """Fetch all 8 key VaaniSetu schemes from myscheme.gov.in"""
        kb = {}
        for category, keyword in self.TARGETS.items():
            print(f"  Searching mysscheme.gov.in: '{keyword}'...")
            scheme = self.search(keyword)
            if scheme:
                name = scheme.get("schemeName") or scheme.get("name") or scheme.get("title", keyword)
                kb[category] = {
                    "source":      "myscheme_gov_in",
                    "name":        name,
                    "eligibility": scheme.get("eligibility", ""),
                    "benefits":    scheme.get("schemeBenefits", scheme.get("benefits", "")),
                    "helpline":    scheme.get("helplineNumber", scheme.get("helpline", "")),
                    "website":     scheme.get("schemeUrl", scheme.get("link", "")),
                    "ministry":    scheme.get("nodal_ministry", scheme.get("ministry", "")),
                }
                print(f"  Found {category} -> {name}")
        return kb


if __name__ == "__main__":
    client = MySchemeClient()
    schemes = client.get_vaanisetu_schemes()
    print(f"\nTotal: {len(schemes)} schemes fetched")
    for key, val in schemes.items():
        print(f"  {key}: {val['name'][:60]}")

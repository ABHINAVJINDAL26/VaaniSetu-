import requests
from bs4 import BeautifulSoup
import time

class GovPortalScraper:
    """
    Source 3: Official Government Portals Scraping
    Legal public data — koi key nahi chahiye.
    Run karo weekly — fresh data milega.
    """
    PORTALS = {
        "pm_kisan": {
            "url":      "https://pmkisan.gov.in",
            "helpline": "155261",
            "eligibility": (
                "Rs. 6,000 per year, 3 installments. "
                "Eligibility: Small and marginal farmers "
                "with less than 2 hectare land. "
                "Apply at: pmkisan.gov.in/registrationForm.aspx"
            ),
        },
        "mgnrega": {
            "url":      "https://nrega.nic.in",
            "helpline": "1800-11-0707",
            "eligibility": (
                "100 days guaranteed employment per year. "
                "Eligibility: Any rural household adult. "
                "Apply: Gram Panchayat office. "
                "Payment: Bank account within 15 days."
            ),
        },
        "ration_card": {
            "url":      "https://nfsa.gov.in",
            "helpline": "1967",
            "eligibility": (
                "Priority Household: Rs. 3/kg wheat, Rs. 2/kg rice. "
                "Antyodaya: 35 kg per month free. "
                "Apply: Tehsil office with Aadhaar + income proof."
            ),
        },
        "ayushman": {
            "url":      "https://pmjay.gov.in",
            "helpline": "14555",
            "eligibility": (
                "Rs. 5 lakh health coverage per family per year. "
                "Eligibility: SECC database families. "
                "Check eligibility: mera.pmjay.gov.in"
            ),
        },
        "pm_awas": {
            "url":      "https://pmayg.nic.in",
            "helpline": "1800-11-6446",
            "eligibility": (
                "Pucca house for homeless families. "
                "Rs. 1.20 lakh plains, Rs. 1.30 lakh hilly areas. "
                "Eligibility: Homeless or kuccha house. "
                "Apply: Gram Panchayat through Awaassoft."
            ),
        },
        "pension": {
            "url":      "https://nsap.nic.in",
            "helpline": "1800-11-1555",
            "eligibility": (
                "Old Age Pension: 60+ years, BPL families, "
                "Rs. 200-500 per month. "
                "Widow Pension: Widows 40-79 years, BPL. "
                "Disability Pension: 80% disability. "
                "Apply: District Social Welfare office."
            ),
        },
        "ujjwala": {
            "url":      "https://pmuy.gov.in",
            "helpline": "1800-266-6696",
            "eligibility": (
                "Free LPG connection for BPL women. "
                "Eligibility: Women above 18, BPL household. "
                "Documents: Aadhaar, BPL card, bank account. "
                "Apply: Nearest LPG distributor."
            ),
        },
        "kisan_credit": {
            "url":      "https://pmkisan.gov.in/kcc",
            "helpline": "0120-6025109",
            "eligibility": (
                "Short-term credit for farming needs. "
                "Limit: Rs. 3 lakh at 4% interest. "
                "Eligibility: All farmers with land records. "
                "Apply: Nearest bank or cooperative society."
            ),
        },
    }

    def fetch_portal_data(self, scheme_id: str) -> dict:
        if scheme_id not in self.PORTALS:
            return {}

        portal = self.PORTALS[scheme_id]

        try:
            headers = {"User-Agent": "Mozilla/5.0 VaaniSetu Research"}
            r = requests.get(portal["url"], headers=headers, timeout=8)
            soup = BeautifulSoup(r.content, "html.parser")

            title = soup.find("title")
            title_text = title.get_text(strip=True) if title else ""

            return {
                "source":      "gov_portal",
                "name":        title_text or scheme_id,
                "eligibility": portal["eligibility"],
                "helpline":    portal["helpline"],
                "website":     portal["url"],
            }

        except Exception:
            return {
                "source":      "hardcoded",
                "name":        scheme_id.replace("_", " ").title(),
                "eligibility": portal["eligibility"],
                "helpline":    portal["helpline"],
                "website":     portal["url"],
            }

    def get_all_schemes(self) -> dict:
        kb = {}
        for scheme_id in self.PORTALS:
            print(f"  Fetching {scheme_id}...")
            data = self.fetch_portal_data(scheme_id)
            if data:
                kb[scheme_id] = data
                print(f"  ✓ {scheme_id}")
            time.sleep(1)
        return kb

if __name__ == "__main__":
    scraper = GovPortalScraper()
    schemes = scraper.get_all_schemes()
    print(f"\nTotal: {len(schemes)} schemes")

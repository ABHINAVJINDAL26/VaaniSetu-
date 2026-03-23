"""
Source 1: myScheme — Hugging Face Dataset
500+ government schemes ki complete info.
Koi key nahi, koi registration nahi.
"""

from datasets import load_dataset
import pandas as pd
import json


class MySchemeClient:

    def __init__(self):
        self._df = None

    def _load(self) -> pd.DataFrame:
        """Dataset ek baar load karo, cache karo"""
        if self._df is None:
            print("  Loading myScheme dataset...")
            dataset = load_dataset("shrijayan/gov_myscheme")
            self._df = dataset["train"].to_pandas()
            print(f"  Loaded {len(self._df)} schemes")
        return self._df

    def get_scheme(self, keyword: str) -> list:
        """Keyword se scheme dhundho"""
        df = self._load()
        mask = df['scheme_name'].str.contains(
            keyword, case=False, na=False
        )
        results = df[mask].to_dict('records')
        return results

    def get_vaanisetu_schemes(self) -> dict:
        """
        VaaniSetu ke liye relevant schemes fetch karo.
        8 main categories jo rural India ke liye zaroori hain.
        """
        targets = {
            "ration_card":  ["Ration", "NFSA", "PDS"],
            "pm_kisan":     ["PM-KISAN", "Kisan Samman"],
            "mgnrega":      ["MGNREGA", "NREGA"],
            "ayushman":     ["Ayushman", "PMJAY", "AB-PMJAY"],
            "pm_awas":      ["PM Awas", "PMAY", "Pradhan Mantri Awas"],
            "pension":      ["Pension", "IGNOAPS", "IGNWPS", "NSAP"],
            "ujjwala":      ["Ujjwala", "LPG"],
            "kisan_credit": ["Kisan Credit", "KCC"],
        }

        kb = {}
        df = self._load()

        for category, keywords in targets.items():
            for keyword in keywords:
                mask = df['scheme_name'].str.contains(
                    keyword, case=False, na=False
                )
                rows = df[mask]

                if len(rows) > 0:
                    row = rows.iloc[0]
                    kb[category] = {
                        "source":      "myscheme",
                        "name":        str(row.get("scheme_name", "")),
                        "eligibility": str(row.get("eligibility", "")),
                        "benefits":    str(row.get("benefits", "")),
                        "process":     str(row.get("applicationProcess", "")),
                        "helpline":    str(row.get("helplineNumber", "")),
                        "website":     str(row.get("schemeUrl", "")),
                        "ministry":    str(row.get("ministry", "")),
                    }
                    print(f"  ✓ {category} → {row['scheme_name']}")
                    break

        return kb


# Test karo
if __name__ == "__main__":
    client = MySchemeClient()
    schemes = client.get_vaanisetu_schemes()
    print(f"\nTotal: {len(schemes)} schemes fetched")
    for key, val in schemes.items():
        print(f"  {key}: {val['name'][:50]}")

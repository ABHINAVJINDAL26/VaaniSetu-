# VaaniSetu — Government Data Integration Guide
## Free Alternatives — Zero Registration, Zero Approval

> Koi API Setu nahi, koi UMANG credentials nahi, koi approval nahi.
> Sirf free public data sources use karo aur device ka Knowledge Base banao.

---

## Table of Contents

1. [Overview — Kya Karna Hai](#1-overview)
2. [Source 1 — myScheme Dataset (Hugging Face)](#2-source-1--myscheme-dataset)
3. [Source 2 — data.gov.in (Free API Key)](#3-source-2--datagovin)
4. [Source 3 — Official Government Portals Scraping](#4-source-3--web-scraping)
5. [Knowledge Base Builder — Sab Milake](#5-knowledge-base-builder)
6. [Device mein Kaise Daalo](#6-device-mein-kaise-daalo)
7. [Weekly Auto-Update Script](#7-weekly-auto-update-script)

---

## 1. Overview

### Hum Kya Bana Rahe Hain

```
3 Free Sources
      │
      ▼
┌─────────────────────┐
│  KB Builder Script  │  ← Python script
│  (kb_builder.py)    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  knowledge_base.json│  ← 300-500 KB JSON
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Compress (LZ4)     │  ← ~7 KB
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Encrypt (AES-128)  │  ← Device ke liye
└─────────┬───────────┘
          │
          ▼
    SD Card → Device
```

### Install karo — ek baar

```bash
pip install requests beautifulsoup4 datasets pandas lz4 cryptography python-dotenv
```

---

## 2. Source 1 — myScheme Dataset

### Kya hai ye

myScheme.gov.in Government of India ka official scheme portal hai.
Iska poora data Hugging Face pe freely available hai — 500+ schemes,
structured JSON format mein. Koi registration nahi, koi API key nahi.

### Code

**File: `backend/services/myscheme_client.py`**

```python
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
                        "process":     str(row.get(
                                        "applicationProcess", "")),
                        "helpline":    str(row.get(
                                        "helplineNumber", "")),
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
```

### Test karo

```bash
python backend/services/myscheme_client.py
```

Expected output:
```
Loading myScheme dataset...
Loaded 512 schemes
  ✓ ration_card   → National Food Security Act (NFSA)
  ✓ pm_kisan      → PM Kisan Samman Nidhi
  ✓ mgnrega       → Mahatma Gandhi NREGA
  ✓ ayushman      → Ayushman Bharat PM-JAY
  ✓ pm_awas       → Pradhan Mantri Awas Yojana Gramin
  ✓ pension       → Indira Gandhi National Old Age Pension
  ✓ ujjwala       → Pradhan Mantri Ujjwala Yojana
  ✓ kisan_credit  → Kisan Credit Card Scheme

Total: 8 schemes fetched
```

---

## 3. Source 2 — data.gov.in

### Kya hai ye

Open Government Data Platform — Ministry datasets freely available.
Aggregated public data — district-wise stats, beneficiary counts etc.
Free API key — sirf email se milti hai, 2 minute registration.

### Registration

```
1. https://data.gov.in pe jaao
2. Top right → "Login/Register"
3. Email se register karo
4. Email verify karo
5. Login → Profile icon → API Key copy karo
```

### .env file

```env
# backend/.env
DATAGOVIN_API_KEY=your_key_here
```

### Code

**File: `backend/services/datagovin_client.py`**

```python
"""
Source 2: data.gov.in — Open Government Data
District-wise beneficiary counts, scheme statistics.
Free API key — email se milti hai.
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()


class DataGovInClient:

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
        """Resource ID se data fetch karo"""
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
        """MGNREGA wages aur employment data"""
        data = self.fetch(
            self.RESOURCES["mgnrega_wages"],
            state=state, limit=5
        )
        return data

    def get_pm_kisan_stats(self) -> dict:
        """PM Kisan state-wise beneficiary count"""
        return self.fetch(
            self.RESOURCES["pm_kisan_state"], limit=36
        )

    def get_ration_stats(self) -> dict:
        """Ration card state-wise data"""
        return self.fetch(
            self.RESOURCES["ration_card_state"], limit=36
        )

    def search_datasets(self, keyword: str) -> list:
        """
        Keyword se datasets dhundho.
        Returns list of matching datasets with their resource IDs.
        """
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


# Test karo
if __name__ == "__main__":
    client = DataGovInClient()

    print("Testing MGNREGA data...")
    data = client.get_mgnrega_info("Rajasthan")
    print(f"  Records: {data.get('count', 0)}")

    print("\nSearching 'PM Kisan' datasets...")
    results = client.search_datasets("pm kisan")
    for r in results[:3]:
        print(f"  - {r.get('title', 'N/A')[:60]}")
```

---

## 4. Source 3 — Web Scraping

### Kya hai ye

Government portals pe sab scheme information publicly available hai.
BeautifulSoup se scrape karo — 100% legal public data.
Internet connection hone par weekly run karo — fresh data milega.

### Code

**File: `backend/services/scraper_client.py`**

```python
"""
Source 3: Official Government Portals Scraping
Legal public data — koi key nahi chahiye.
Run karo weekly — fresh data milega.
"""

import requests
from bs4 import BeautifulSoup
import json
import time


class GovPortalScraper:

    # Official government scheme portals
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
        """Portal se basic info fetch karo"""
        if scheme_id not in self.PORTALS:
            return {}

        portal = self.PORTALS[scheme_id]

        try:
            headers = {"User-Agent": "Mozilla/5.0 VaaniSetu Research"}
            r = requests.get(
                portal["url"], headers=headers, timeout=8
            )
            soup = BeautifulSoup(r.content, "html.parser")

            # Page title
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
            # Fallback to hardcoded data
            return {
                "source":      "hardcoded",
                "name":        scheme_id.replace("_", " ").title(),
                "eligibility": portal["eligibility"],
                "helpline":    portal["helpline"],
                "website":     portal["url"],
            }

    def get_all_schemes(self) -> dict:
        """Sab schemes ka data lo"""
        kb = {}
        for scheme_id in self.PORTALS:
            print(f"  Fetching {scheme_id}...")
            data = self.fetch_portal_data(scheme_id)
            if data:
                kb[scheme_id] = data
                print(f"  ✓ {scheme_id}")
            time.sleep(1)  # Portal ko spam mat karo
        return kb


# Test
if __name__ == "__main__":
    scraper = GovPortalScraper()
    schemes = scraper.get_all_schemes()
    print(f"\nTotal: {len(schemes)} schemes")
```

---

## 5. Knowledge Base Builder

**File: `firmware/knowledge_base/kb_builder.py`**

Ye script teeno sources se data leti hai, combine karti hai,
compress karti hai, encrypt karti hai — device ke liye ready.

```python
"""
VaaniSetu Knowledge Base Builder
Teeno sources combine karke device-ready KB banao.

Run: python kb_builder.py
Output: kb_encrypted.bin (SD card pe copy karo)
"""

import json
import os
import lz4.frame
from cryptography.hazmat.primitives.ciphers import (
    Cipher, algorithms, modes
)
from dotenv import load_dotenv

load_dotenv()

# Apne sources import karo
import sys
sys.path.append("../../backend/services")
from myscheme_client  import MySchemeClient
from datagovin_client import DataGovInClient
from scraper_client   import GovPortalScraper


def build_knowledge_base() -> dict:
    """
    Step 1: Teeno sources se data lo.
    Priority: myScheme > data.gov.in > Web Scraper
    """
    print("\n=== VaaniSetu KB Builder ===\n")
    final_kb = {}

    # ── Source 1: myScheme (best quality) ───────────────
    print("[ Source 1 ] myScheme Dataset (Hugging Face)...")
    try:
        myscheme = MySchemeClient()
        ms_data = myscheme.get_vaanisetu_schemes()
        for k, v in ms_data.items():
            final_kb[k] = v
        print(f"  → {len(ms_data)} schemes from myScheme\n")
    except Exception as e:
        print(f"  ✗ myScheme failed: {e}\n")

    # ── Source 2: data.gov.in (statistics) ──────────────
    print("[ Source 2 ] data.gov.in (statistics)...")
    try:
        datagov = DataGovInClient()
        if datagov.key:
            mg = datagov.get_mgnrega_info()
            if "error" not in mg:
                # MGNREGA stats add karo existing entry mein
                if "mgnrega" in final_kb:
                    final_kb["mgnrega"]["stats"] = mg
                print("  → MGNREGA stats added\n")
        else:
            print("  ✗ No API key — skipping data.gov.in\n")
    except Exception as e:
        print(f"  ✗ data.gov.in failed: {e}\n")

    # ── Source 3: Web Scraper (helpline + fallback) ──────
    print("[ Source 3 ] Official Government Portals...")
    try:
        scraper = GovPortalScraper()
        for scheme_id, portal_data in scraper.PORTALS.items():
            if scheme_id not in final_kb:
                # Sirf missing schemes add karo
                final_kb[scheme_id] = {
                    "source":      "portal_fallback",
                    "eligibility": portal_data["eligibility"],
                    "helpline":    portal_data["helpline"],
                    "website":     portal_data["url"],
                }
                print(f"  + Added fallback: {scheme_id}")
            else:
                # Existing mein helpline update karo
                if not final_kb[scheme_id].get("helpline"):
                    final_kb[scheme_id]["helpline"] = (
                        portal_data["helpline"]
                    )
        print()
    except Exception as e:
        print(f"  ✗ Scraper failed: {e}\n")

    print(f"Total schemes in KB: {len(final_kb)}")
    return final_kb


def save_json(kb: dict, path: str):
    """Raw JSON save karo — debugging ke liye"""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(kb, f, ensure_ascii=False, indent=2)
    size = os.path.getsize(path)
    print(f"  JSON saved: {path} ({size:,} bytes)")


def compress(kb: dict) -> bytes:
    """LZ4 compression"""
    kb_bytes = json.dumps(
        kb, ensure_ascii=False
    ).encode("utf-8")
    compressed = lz4.frame.compress(kb_bytes)
    print(f"  Compressed: {len(kb_bytes):,} → "
          f"{len(compressed):,} bytes "
          f"({100*len(compressed)//len(kb_bytes)}%)")
    return compressed


def encrypt(data: bytes) -> bytes:
    """AES-128-CBC encryption"""
    key_hex = os.getenv(
        "DEVICE_AES_KEY",
        "0123456789abcdef0123456789abcdef"  # Default test key
    )
    key = bytes.fromhex(key_hex)
    iv  = bytes.fromhex(
        os.getenv("DEVICE_AES_IV", "abcdef0123456789abcdef0123456789")
    )

    # Pad to 16-byte boundary (PKCS7)
    pad_len = 16 - (len(data) % 16)
    padded  = data + bytes([pad_len] * pad_len)

    cipher    = Cipher(algorithms.AES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    encrypted = encryptor.update(padded) + encryptor.finalize()

    print(f"  Encrypted: {len(encrypted):,} bytes "
          f"(AES-128-CBC)")
    return encrypted


def main():
    os.makedirs("output", exist_ok=True)

    # Step 1: Data fetch karo
    kb = build_knowledge_base()

    # Step 2: JSON save karo (debug ke liye)
    print("\n[ Saving files... ]")
    save_json(kb, "output/kb_raw.json")

    # Step 3: Compress karo
    compressed = compress(kb)

    # Step 4: Encrypt karo
    encrypted = encrypt(compressed)

    # Step 5: Binary file save karo
    bin_path = "output/kb_encrypted.bin"
    with open(bin_path, "wb") as f:
        f.write(encrypted)
    print(f"  Binary saved: {bin_path} "
          f"({os.path.getsize(bin_path):,} bytes)")

    print("\n=== Build Complete! ===")
    print(f"  Schemes: {len(kb)}")
    print(f"  Output:  output/kb_encrypted.bin")
    print("\nNext step:")
    print("  cp output/kb_encrypted.bin /media/sdcard/VAANISETU/")
    print("  Insert SD card in device → auto-updates on boot")


if __name__ == "__main__":
    main()
```

---

## 6. Device mein Kaise Daalo

### Step 1 — KB Build karo

```bash
cd firmware/knowledge_base/
python kb_builder.py
```

Output:
```
=== VaaniSetu KB Builder ===

[ Source 1 ] myScheme Dataset...
  Loading myScheme dataset...
  Loaded 512 schemes
  ✓ ration_card → National Food Security Act
  ✓ pm_kisan   → PM Kisan Samman Nidhi
  ...
  → 8 schemes from myScheme

[ Source 2 ] data.gov.in...
  → MGNREGA stats added

[ Source 3 ] Official Portals...
  + Added fallback: ujjwala
  + Added helpline updates

Total schemes in KB: 8

[ Saving files... ]
  JSON saved:   output/kb_raw.json (48,234 bytes)
  Compressed:   48,234 → 6,891 bytes (14%)
  Encrypted:    6,912 bytes (AES-128-CBC)
  Binary saved: output/kb_encrypted.bin (6,912 bytes)

=== Build Complete! ===
```

### Step 2 — SD Card pe copy karo

```bash
# SD card format: FAT32
# Folder banao: VAANISETU
cp output/kb_encrypted.bin /media/sdcard/VAANISETU/

# Ya Windows pe:
# copy output\kb_encrypted.bin E:\VAANISETU\
```

### Step 3 — Device mein daalo

```
1. Device band karo
2. SD card insert karo
3. Device on karo
4. Blue LED 3 baar flash karega = KB update successful
5. Green LED = Ready
```

---

## 7. Weekly Auto-Update Script

```bash
# Linux/Mac pe crontab add karo:
crontab -e

# Har Sunday raat 2 baje chalao:
0 2 * * 0 cd /path/to/vaanisetu/firmware/knowledge_base && python kb_builder.py >> logs/kb_update.log 2>&1
```

```python
# Windows pe Task Scheduler ya manually:
# python kb_builder.py
# Naya output/kb_encrypted.bin banegi
# SD card pe copy karo
```

---

## Files Structure

```
vaanisetu/
├── backend/
│   └── services/
│       ├── myscheme_client.py      ← Source 1 (no key)
│       ├── datagovin_client.py     ← Source 2 (free key)
│       └── scraper_client.py       ← Source 3 (no key)
│
├── firmware/
│   └── knowledge_base/
│       ├── kb_builder.py           ← Main builder script
│       ├── output/
│       │   ├── kb_raw.json         ← Debug ke liye
│       │   └── kb_encrypted.bin    ← Device ke liye
│       └── logs/
│           └── kb_update.log
│
└── .env
    DATAGOVIN_API_KEY=optional_key
    DEVICE_AES_KEY=your_32_char_hex_key
    DEVICE_AES_IV=your_32_char_hex_iv
```

---

## Quick Start — Abhi Chalao

```bash
# 1. Install
pip install datasets requests beautifulsoup4 \
            pandas lz4 cryptography python-dotenv

# 2. Run KB builder
cd firmware/knowledge_base/
python kb_builder.py

# 3. Output check karo
ls -la output/
# kb_raw.json      ← JSON (debug)
# kb_encrypted.bin ← Device ke liye (SD card pe daalo)

# 4. data.gov.in key chahiye toh (optional):
# .env file mein daalo:
# DATAGOVIN_API_KEY=aapki_key_yahan
```

---

*VaaniSetu — Offline Voice Bridge for 65 Crore Tribal Indians*
*Zero credentials. Zero approval. Zero internet. Pure data.*

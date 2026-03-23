import json
import os
import lz4.frame
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from dotenv import load_dotenv

load_dotenv()

# Apne sources import karo (pointing to correct path inside our repo)
import sys
sys.path.append("../../backend/app/services")
try:
    from myscheme_client  import MySchemeClient
    from datagovin_client import DataGovInClient
    from scraper_client   import GovPortalScraper
except ImportError as e:
    print(f"Import Error: Make sure you run this script with correct PYTHONPATH. {e}")

def build_knowledge_base() -> dict:
    print("\n=== VaaniSetu KB Builder ===\n")
    final_kb = {}

    print("[ Source 1 ] myScheme Dataset (Hugging Face)...")
    try:
        myscheme = MySchemeClient()
        ms_data = myscheme.get_vaanisetu_schemes()
        for k, v in ms_data.items():
            final_kb[k] = v
        print(f"  → {len(ms_data)} schemes from myScheme\n")
    except Exception as e:
        print(f"  ✗ myScheme failed: {e}\n")

    print("[ Source 2 ] data.gov.in (statistics)...")
    try:
        datagov = DataGovInClient()
        if datagov.key:
            mg = datagov.get_mgnrega_info()
            if "error" not in mg:
                if "mgnrega" in final_kb:
                    final_kb["mgnrega"]["stats"] = mg
                print("  → MGNREGA stats added\n")
        else:
            print("  ✗ No API key — skipping data.gov.in\n")
    except Exception as e:
        print(f"  ✗ data.gov.in failed: {e}\n")

    print("[ Source 3 ] Official Government Portals...")
    try:
        scraper = GovPortalScraper()
        for scheme_id, portal_data in scraper.PORTALS.items():
            if scheme_id not in final_kb:
                final_kb[scheme_id] = {
                    "source":      "portal_fallback",
                    "eligibility": portal_data["eligibility"],
                    "helpline":    portal_data["helpline"],
                    "website":     portal_data["url"],
                }
                print(f"  + Added fallback: {scheme_id}")
            else:
                if not final_kb[scheme_id].get("helpline"):
                    final_kb[scheme_id]["helpline"] = portal_data["helpline"]
        print()
    except Exception as e:
        print(f"  ✗ Scraper failed: {e}\n")

    print(f"Total schemes in KB: {len(final_kb)}")
    return final_kb

def save_json(kb: dict, path: str):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(kb, f, ensure_ascii=False, indent=2)
    size = os.path.getsize(path)
    print(f"  JSON saved: {path} ({size:,} bytes)")

def compress(kb: dict) -> bytes:
    kb_bytes = json.dumps(kb, ensure_ascii=False).encode("utf-8")
    compressed = lz4.frame.compress(kb_bytes)
    print(f"  Compressed: {len(kb_bytes):,} → {len(compressed):,} bytes ({100*len(compressed)//len(kb_bytes)}%)")
    return compressed

def encrypt(data: bytes) -> bytes:
    key_hex = os.getenv("DEVICE_AES_KEY", "0123456789abcdef0123456789abcdef")
    key = bytes.fromhex(key_hex)
    iv  = bytes.fromhex(os.getenv("DEVICE_AES_IV", "abcdef0123456789abcdef0123456789"))

    pad_len = 16 - (len(data) % 16)
    padded  = data + bytes([pad_len] * pad_len)

    cipher    = Cipher(algorithms.AES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    encrypted = encryptor.update(padded) + encryptor.finalize()

    print(f"  Encrypted: {len(encrypted):,} bytes (AES-128-CBC)")
    return encrypted

def main():
    os.makedirs("output", exist_ok=True)
    kb = build_knowledge_base()
    
    print("\n[ Saving files... ]")
    save_json(kb, "output/kb_raw.json")
    
    compressed = compress(kb)
    encrypted = encrypt(compressed)
    
    bin_path = "output/kb_encrypted.bin"
    with open(bin_path, "wb") as f:
        f.write(encrypted)
        
    print(f"  Binary saved: {bin_path} ({os.path.getsize(bin_path):,} bytes)")
    print("\n=== Build Complete! ===")
    print(f"  Schemes: {len(kb)}")
    print(f"  Output:  output/kb_encrypted.bin")

if __name__ == "__main__":
    main()

"""
Full KB Builder test — runs inside Docker container.
Uses scraper as primary source (myscheme.gov.in API blocks in server env).
"""
import sys
sys.path.insert(0, '/app')

import json
import os
import lz4.frame
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from app.services.scraper_client import GovPortalScraper

print("=== VaaniSetu KB Builder Test ===\n")

# Step 1: Scrape all 8 schemes
print("[ Source ] Official Government Portals...")
scraper = GovPortalScraper()
final_kb = {}
for scheme_id in scraper.PORTALS:
    data = scraper.fetch_portal_data(scheme_id)
    if data:
        final_kb[scheme_id] = data
        print(f"  + {scheme_id}: {data.get('helpline','?')}")

print(f"\nTotal schemes: {len(final_kb)}")

# Step 2: Compress
kb_bytes = json.dumps(final_kb, ensure_ascii=False).encode("utf-8")
compressed = lz4.frame.compress(kb_bytes)
print(f"\nCompressed: {len(kb_bytes):,} bytes -> {len(compressed):,} bytes ({100*len(compressed)//len(kb_bytes)}%)")

# Step 3: Encrypt
key = bytes.fromhex("0123456789abcdef0123456789abcdef")
iv  = bytes.fromhex("abcdef0123456789abcdef0123456789")
pad_len = 16 - (len(compressed) % 16)
padded  = compressed + bytes([pad_len] * pad_len)
cipher    = Cipher(algorithms.AES(key), modes.CBC(iv))
encryptor = cipher.encryptor()
encrypted = encryptor.update(padded) + encryptor.finalize()
print(f"Encrypted: {len(encrypted):,} bytes (AES-128-CBC)")

# Step 4: Save
os.makedirs("/tmp/kb_output", exist_ok=True)
with open("/tmp/kb_output/kb_raw.json", "w") as f:
    json.dump(final_kb, f, ensure_ascii=False, indent=2)
with open("/tmp/kb_output/kb_encrypted.bin", "wb") as f:
    f.write(encrypted)

print("\n=== Build Complete! ===")
print(f"  kb_raw.json: {os.path.getsize('/tmp/kb_output/kb_raw.json'):,} bytes")
print(f"  kb_encrypted.bin: {os.path.getsize('/tmp/kb_output/kb_encrypted.bin'):,} bytes")
print("  READY for SD card!")

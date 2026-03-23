import sys
sys.path.insert(0, '/app')
from app.services.myscheme_client import MySchemeClient

print("Testing myScheme HuggingFace client...")
c = MySchemeClient()
schemes = c.get_vaanisetu_schemes()
print(f"Total from HuggingFace: {len(schemes)} schemes")
for key, val in schemes.items():
    print(f"  {key}: {val['name'][:60]}")

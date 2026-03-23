import sys
sys.path.insert(0, '/app')
from datasets import load_dataset

print("Loading dataset to inspect schema...")
dataset = load_dataset("shrijayan/gov_myscheme")
df = dataset["train"].to_pandas()
print(f"Total rows: {len(df)}")
print(f"Columns: {list(df.columns)}")
if len(df) > 0:
    print("\nSample row:")
    for col in df.columns:
        print(f"  {col}: {str(df.iloc[0][col])[:80]}")

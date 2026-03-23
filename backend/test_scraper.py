from app.services.scraper_client import GovPortalScraper
s = GovPortalScraper()
kb = s.get_all_schemes()
print(f"Total scraped: {len(kb)} schemes")
for k, v in kb.items():
    print(f"  {k}: helpline={v['helpline']}")

from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:9002")
        new_releases_section = page.locator('section:has-text("New Releases")')
        new_releases_section.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

run()

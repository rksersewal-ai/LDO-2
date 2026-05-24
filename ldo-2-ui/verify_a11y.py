from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000/login")
    page.wait_for_timeout(500)

    # Inject token if necessary to avoid login redirect
    page.evaluate("window.localStorage.setItem('ldo_token', 'mock_token_for_verification');")

    # We can navigate to bom which contains the mock table directly
    page.goto("http://localhost:3000/bom")
    page.wait_for_timeout(3000)

    # Check that View and Branch buttons have aria-labels on BOM table
    view_button = page.locator("button[aria-label^='View BOM item']").first
    if view_button:
        try:
            print("Found View button with aria-label:", view_button.get_attribute("aria-label", timeout=5000))
        except Exception as e:
            print("View button not found or timeout", e)

    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()

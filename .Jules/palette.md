## 2025-02-18 - Playwright Auth Bypass for Visual Verification
**Learning:** When trying to verify authenticated states visually via Playwright, relying on UI interaction to log in (typing user/pass and clicking submit) can fail due to race conditions or strict element locators timing out.
**Action:** Inject the required `sessionStorage` token state directly using `page.add_init_script` prior to navigating to the authenticated URL. This safely bypasses the login screen entirely and makes visual verification scripts significantly more reliable.

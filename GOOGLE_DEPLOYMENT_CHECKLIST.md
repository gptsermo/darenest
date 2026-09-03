# DareNest — Production & Google Setup

## Locked baseline
Step 9.4 is the source baseline for this production-preparation build.

## Completed locally
- SEO titles and descriptions reviewed
- Canonical URLs on public HTML pages
- Open Graph metadata
- Favicon references
- Google Analytics added to public pages
- `robots.txt`
- `sitemap.xml`
- Privacy Policy expanded for analytics/cookies/advertising disclosure
- Terms & Conditions expanded
- About and Contact pages reviewed
- Custom `404.html`
- Netlify security headers
- Existing six-game flow and master question database retained

## Still requires the live domain / Google account
These items cannot be truthfully completed before deployment:
1. Google Search Console property verification.
2. Google Search Console sitemap submission.
3. AdSense site addition and ownership verification.
4. AdSense publisher code insertion after Google provides the publisher ID/snippet.
5. `ads.txt` creation using the exact publisher ID supplied by Google.
6. Consent-management configuration if required for the site's visitors/regions.
7. Final live URL crawl and Search Console indexing checks.

Do not invent a publisher ID or verification token.

## Recommended first deployment
Deploy this package once the Netlify site/domain is ready.

Then:
1. Open the live homepage and test the complete Category → Age → Game → Question flow.
2. Open `https://darenest.com/robots.txt`.
3. Open `https://darenest.com/sitemap.xml`.
4. In Search Console, verify the property and submit `/sitemap.xml`.
5. In AdSense, add the live domain and complete the verification/review process.
6. Add the exact AdSense code supplied by Google.
7. Add `ads.txt` only with the exact publisher information supplied by Google.
8. Perform one final live mobile/desktop audit before placing ads.

## Important AdSense note
Do not place ads over buttons, navigation, game controls or question interactions. Ads must remain clearly distinguishable from navigation and content and must not interfere with user interaction.

## Analytics
Existing Google Analytics measurement ID:
`G-89MMTSRPZ7`

## Contact
`gptsermo@gmail.com`

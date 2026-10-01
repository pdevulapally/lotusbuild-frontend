# Syncrun reference and implementation scope

Reference: https://syncrun.framer.website/
Marketplace: https://www.framer.com/marketplace/templates/syncrun/
Designer: Marso Angelov. Inspected 27 September 2026.

This is a Next.js recreation, not a Framer export. The chosen reference controls
the visual direction: Libre Caslon Condensed 500 display type, Public Sans body,
#f7f5f3 paper background, #262626 text, thin double borders, pill buttons, a centred
hero, split product panels, vertical feature sections and generous spacing.
Shared elements are implemented once; content is in src/content/site.ts.

Intentional adaptations: LotusBuild name and factual copy; no invented customer
testimonials, customer counts, ROI statistics, partner endorsements, blog posts,
annual discounts or legal policies. Purple in the original landscape is removed
with CSS grayscale to preserve the user's no-purple requirement. Unverified
marketing sections are omitted. No approved LotusBuild logo was provided, so the
brand is rendered as a text wordmark rather than copying the Syncrun symbol.

Pricing is read server-side from the configured API's public GET /plans route.
Backend contract: lotusbuildbackendserver/src/billing/routes.ts. No local price
catalogue, Stripe keys, Firebase credentials or authenticated requests are used.
The seed catalogue is explicitly not treated as authoritative live pricing.

Account sign-in, project CRUD, generation, desktop streaming, and billing checkout
are not integrated in this frontend yet. /workspace is an explicit access screen,
not a fabricated project list. There is no production deployment.

## Reference assets

- public/reference/grain.png: https://framerusercontent.com/images/rR6HYXBrMmX4cRpXfXUOvpvpB0.png
- public/reference/landscape.avif: https://framerusercontent.com/images/vv6ShYQM1T5frNtHgyN67Y8mFo.png?width=960&height=1200

Assets were saved from the selected reference for this local recreation. The
marketplace identifies its licence as Limited; off-platform redistribution rights
have not been established. Review the template licence before publishing.
Fonts are self-hosted through Fontsource packages; licence files remain in those
packages. Original template scripts, testimonials, logos and portraits are not used.

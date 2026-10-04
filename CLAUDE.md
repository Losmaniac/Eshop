# CLAUDE.md: Minimalist e-shop for CNC laser-cut steel products

## 0. How to work (read first)

1. **Before writing any code, ask me the questions in section 9.** Ask them in one batch, with sensible defaults proposed for each, then wait for my answers.
2. After that, build in the phases from section 10. Finish and verify each phase before starting the next.
3. Keep it **simple**. No CMS, no admin panel, no payment gateway, no user accounts in v1. If you are about to add a dependency, check whether the platform or a few lines of code can do the job.
4. The UI is in **Czech**. Code, comments, commit messages and README are in **English**.
5. Make small, readable commits. Keep a short `README.md` with: how to run, how to deploy, how to add or edit a product, required environment variables, and 3 sentences on why you picked this stack.

## 1. Business context

A small Czech workshop with a CNC laser cutter sells **2D laser-cut parts made from leftover and standard sheet metal** (steel, corten, stainless, aluminum). **Nothing is welded or bent**: every item is a flat cut part, or a slot-together kit that the customer assembles.

Goal of the shop: a calm, premium-looking storefront that sells a handful of high-margin products and collects project inquiries. The owner processes orders manually.

## 2. Products (v1 catalog)

Prices are **placeholders**; the owner will confirm them. Display all prices as `1 000 Kč` (space as thousands separator, always include the currency). Use decimal comma for non-integer numbers (for example `23,7 kg`).

| # | Product | Order type | Material | Notes |
|---|---|---|---|---|
| 1 | **Façade and reception logos, letters, signs** | **Inquiry only** (no cart) | stainless, aluminum, steel, 3-5 mm | Quote-based, typically 10 000-60 000 Kč. Customer uploads a vector file and describes the project. |
| 2 | **Large wall art** (tree of life, maps, silhouettes) | Cart | corten, 2-3 mm, 1 200-2 000 mm | Roughly 6 000-25 000 Kč. Hanging holes are cut into the panel. Variants by size and motif. |
| 3 | **Slot-together fire pit kit** | Cart | steel or corten, 4-6 mm | Roughly 5 000-15 000 Kč. Ships flat. Variants by diameter or size and material. |
| 4 | **Grill plates for fire pits** | Cart | black steel S235, 6-8 mm, Ø 600-1 000 mm | Roughly 2 500-8 000 Kč. Variants by diameter. Sold standalone and as a bundle with product 3. |

Product data must live in **one typed content file or folder in the repo** (for example `content/products.ts` or MDX/JSON), so the owner can edit it without touching components. Each product has: `slug`, `name`, `shortDescription`, `description`, `orderType` (`cart` or `inquiry`), `images[]`, `material`, `thickness`, `variants[]` (label, price, weight in kg, dimensions), `personalization` (optional fields, for example engraved text), `leadTimeDays`, `category`.

Product-specific content rules:
- **Grill plates**: show a clear warning that the plate is **black steel for food contact, never galvanized**, and that the cut edge may need light sanding before first use. Include care instructions (oil after use, a patina forms over time).
- **Fire pit kit**: show "ships flat, assembled without tools" if the owner confirms that; otherwise ask.
- **Bundle**: product 3 + product 4 offered together with a visible saving (owner sets the discount).

## 3. Core user flows

**A. Cart purchase (products 2-4)**
Browse → product page (choose variant, optional personalization text, quantity) → add to cart (slide-in drawer) → checkout → order confirmation page showing **payment instructions with a QR code**.

**B. Inquiry (product 1)**
Product/service page → "Poptat realizaci" form: name, email, phone (optional), company (optional), project type, material preference, approximate dimensions, deadline, description, **file upload** (SVG, DXF, AI, PDF, PNG; max 10 MB; up to 3 files). On submit: confirmation page, and emails to both the owner and the customer.

## 4. Payment: bank transfer with QR (no gateway)

- No card payments in v1. The customer pays by **bank transfer**; the order is only produced after the owner marks it as paid (manually).
- Generate a unique numeric **order number of at most 10 digits** and use it as the **variable symbol (VS)**.
- Show on the confirmation page and in the confirmation email: amount, account number and IBAN, VS, due date (default 7 days, configurable), and a **Czech QR payment code in SPAYD format** (the `qrcode` npm package or equivalent):
  `SPD*1.0*ACC:<IBAN>*AM:<amount with dot decimal>*CC:CZK*X-VS:<vs>*MSG:<short text>`
  (SPAYD itself requires a dot as the decimal separator; this is the only place a dot is correct. All human-readable amounts use the Czech format.)
- Include a "copy" button next to account number, amount and VS.
- Order statuses: `new` → `awaiting_payment` → `paid` → `in_production` → `shipped` → `done` (plus `cancelled`). Storing the status is required; a UI for changing it is not (see section 8).

## 5. Pages

1. **Home**: hero with one strong product photo, one-line value proposition, 3-4 product cards, a short "how it works" strip (design → laser cut → ship), a trust strip (made in Czechia, material certificates if applicable), and a footer.
2. **Shop** (`/obchod`): grid of products with category filter only if there are more than 6 products.
3. **Product detail**: image gallery, variant selector, price, personalization field, material and size spec table, lead time, add-to-cart button (or inquiry button for product 1).
4. **Cart**: drawer plus a full `/kosik` page.
5. **Checkout** (`/pokladna`): contact details, delivery address, delivery method, order note, consent checkboxes, order summary. One page, no account.
6. **Order confirmation** (`/objednavka/[id]`): summary plus payment block with QR. Must be reachable via an unguessable token in the URL, not a sequential id.
7. **Inquiry** (`/poptavka`): form from flow B.
8. **About and contact**: short story, workshop photo, address, email, phone, opening hours.
9. **Legal stubs**: terms and conditions, privacy policy (GDPR), cookie notice, returns info, complaints procedure. Create them with clearly marked placeholder text and a visible `TODO: have a lawyer review` note in the README (not on the live page).
10. **404** page in the same style.

Legal note to surface in the README: products made to the customer's specification are generally excluded from the 14-day consumer withdrawal right in Czech law (items made to measure or personalized). The owner should confirm the final wording with a lawyer.

## 6. Design direction

**Minimalist, tactile, calm.** The product photos of metal do the talking.

- **Palette**: warm off-white background (`#F7F5F2`), near-black text (`#141414`), mid-gray for secondary text, one accent in **corten rust** (`#B4532A`) used sparingly for buttons, links and hover states. Dark footer is allowed.
- **Typography**: a clean grotesque for UI and body (Inter or Geist), plus one refined display face for headings (for example Fraunces, or a tight grotesque in a heavier weight). Max two families. Generous line height, large headings, a clear type scale.
- **Layout**: lots of whitespace, a 12-column grid, max content width about 1 200 px, large product images with consistent aspect ratios, no sidebars, no carousels that auto-play.
- **Components**: flat buttons with a subtle hover, 2-4 px corner radius (sharp and industrial, not bubbly), thin 1 px borders, no heavy shadows. Cart opens as a right-hand drawer.
- **Motion**: subtle only (fade or slide of 150-250 ms). Respect `prefers-reduced-motion`.
- **Imagery**: until real photos exist, use neutral placeholder images (solid dark steel-colored blocks with the product name), clearly easy to replace. Assume final photos are landscape and portrait mixes; use `object-fit: cover` with defined aspect ratios.
- **Dark mode**: not required in v1.
- **Mobile-first.** Test at 360, 768, 1 280 and 1 920 px widths.

## 7. Technical requirements

- **Stack**: your choice, optimized for *simple to run, cheap to host, easy to edit*. A sensible default is **Next.js (App Router) + TypeScript + Tailwind CSS**, deployed on Vercel or a similar host, with transactional email through **Resend** (or another simple provider). Justify any other choice in the README in 3 sentences.
- **Persistence**: orders and inquiries must be stored durably, not only emailed. Pick the simplest store that fits the host (for example Turso/libSQL, Supabase, or a SQLite file if self-hosted on a VPS). Email is a notification, not the system of record.
- **Cart**: client-side state persisted in `localStorage`; **prices are always recalculated and validated on the server** at checkout. Never trust prices sent from the client.
- **Forms**: server-side validation (for example Zod), honeypot field plus rate limiting for spam. Cloudflare Turnstile is optional.
- **File upload** for inquiries: validate type and size server-side, store in object storage or the chosen store, and send the owner a download link in the email rather than a heavy attachment.
- **Emails** (Czech, plain and clean HTML): order confirmation to customer with payment block and QR; new-order notification to owner; inquiry confirmation to customer; new-inquiry notification to owner.
- **Config via environment variables**: owner email, sender address, bank account (IBAN and local format), payment due days, site URL, email API key, storage credentials. Provide `.env.example`.
- **Number and currency formatting**: use `Intl.NumberFormat('cs-CZ')` with a non-breaking space between number and `Kč` (for example `1 000 Kč`; non-integers with a decimal comma).
- **SEO**: per-page metadata, Open Graph images, `sitemap.xml`, `robots.txt`, JSON-LD `Product` markup on product pages.
- **Performance**: Lighthouse 95 or better on mobile for performance, accessibility, best practices and SEO. Optimize images (WebP/AVIF, responsive sizes, lazy loading except hero).
- **Accessibility**: semantic HTML, visible focus states, labels on all inputs, sufficient contrast (especially the rust accent on off-white), full keyboard operation of the cart drawer and checkout.
- **Analytics**: none by default. If added later, use a cookie-less option (Plausible or similar) to avoid a consent banner.
- **Tests**: unit tests for price calculation, order number and VS generation, and SPAYD string building. One end-to-end smoke test of "add to cart → checkout → confirmation with QR".

## 8. Explicitly out of scope for v1

Card or gateway payments, user accounts, a full admin UI, discount codes, multi-currency, reviews, a blog, live chat, marketplace integrations, shipping-carrier API integrations.

Nice-to-have for v1.1 (do not build now, but do not make them hard to add): a password-protected `/admin` page listing orders and inquiries with a status dropdown; a "mark as paid" button that triggers an email; English and Slovak translations; invoice PDF generation; a Zásilkovna or PPL widget.

## 9. Questions to ask me before coding

Ask these in one message, with your proposed default in brackets, and wait for my answers:

1. **Brand**: shop name, logo (or a text-only wordmark for now?), and domain. [Default: text wordmark, placeholder name]
2. **Languages and currency**: Czech only and CZK only? Is a Slovak or English version needed soon? [Default: Czech and CZK only, structure ready for i18n]
3. **Tone of voice**: formal "vy" or informal "ty" in the UI copy? [Default: formal]
4. **Seller details for legal pages and emails**: company or sole trader name, IČO, DIČ, VAT payer or not, address, contact email and phone. [Default: placeholders]
5. **Bank account**: account number and IBAN for payments, and the due period. [Default: placeholder IBAN, 7 days]
6. **Shipping**: which methods and prices (personal pickup, courier for heavy items, Zásilkovna for small items, ČR only or SK too)? Heavy items such as a Ø 800 mm × 6 mm plate weigh about 23,7 kg, so weight limits matter. [Default: personal pickup plus one courier price table by weight, ČR only]
7. **Photos and designs**: do real product photos exist? How many motifs for the wall art (product 2)? [Default: placeholders, 3 motifs]
8. **Final prices and variants** for products 2-4, the bundle discount, and lead times. [Default: use the placeholder ranges in section 2]
9. **Personalization**: which products offer engraved or custom text, and with what character limit? [Default: wall art only, 40 characters]
10. **Hosting**: any preference or existing account (Vercel, Cloudflare, VPS)? [Default: Vercel]
11. **Extras**: newsletter signup, Instagram link, Google Maps embed? [Default: Instagram link only]

## 10. Build phases and definition of done

**Phase 1: Foundation.** Scaffold, design tokens (colors, type scale, spacing), layout, header, footer, cart drawer shell, placeholder content.
**Phase 2: Catalog.** Product data model, shop page, product detail page with variants and personalization, SEO metadata.
**Phase 3: Cart and checkout.** Cart state, server-side price validation, checkout form, order creation, persistence, order number and VS, confirmation page with QR and copy buttons.
**Phase 4: Inquiry.** Inquiry form with file upload, storage, emails.
**Phase 5: Emails and legal.** All four email templates, legal page stubs, contact page.
**Phase 6: Polish and QA.** Responsive check at all four widths, accessibility pass, Lighthouse run, tests, README, `.env.example`, deployment instructions.

**Done means**
- [ ] A visitor can complete a cart order for products 2-4 and see a correct QR payment code that scans in a Czech banking app.
- [ ] The inquiry form for product 1 stores the request and files and sends both emails.
- [ ] Prices cannot be manipulated from the browser.
- [ ] Owner can add or edit a product by editing one content file, without touching components.
- [ ] Lighthouse is 95 or better on mobile for all four categories.
- [ ] README lets a non-developer deploy and configure the shop.
- [ ] All user-facing text is in Czech, and every price shows as `1 000 Kč`.

@AGENTS.md

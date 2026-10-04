# Ocel & Laser – e-shop

A small, minimalist e-shop for CNC laser-cut steel products: fire pit kits, grill plates, corten wall art, and custom façade logos (inquiry only). The UI is in Czech. Payment is by bank transfer with a Czech QR payment code. The owner handles orders manually.

## Why this stack

The shop runs on Next.js (App Router), TypeScript and Tailwind CSS. One codebase gives you fast static product pages, a few small API routes for orders and inquiries, and free hosting on Vercel or any Node server. Orders and inquiries are stored in libSQL. That is a plain SQLite file on a VPS, or a free hosted Turso database on serverless hosts. There is no CMS: products live in one TypeScript file, and the type checker catches mistakes before deployment. Emails go through Resend's HTTP API with no SDK, and the only runtime dependencies besides Next.js are `zod` (validation), `qrcode` (QR payment) and `@libsql/client` (database).

## Run locally

Requirements: Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # then edit the values
npm run dev                  # http://localhost:3000
```

Without `RESEND_API_KEY`, emails are only printed to the terminal. Without `DATABASE_URL`, data is stored in `data/shop.db`.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build && npm start` | Production build of the full shop |
| `npm run build:static` | Static demo into `out/` (no server, see below) |
| `npm test` | Unit tests (prices, order number/VS, SPAYD, formatting) |
| `npm run test:e2e` | End-to-end test: add to cart → checkout → confirmation with QR |
| `npm run lint`, `npm run typecheck` | Code checks |
| `npm run render` | Re-render the product images from the 3D models (see below) |

## Two build modes

- **Full shop** (default): API routes, database and emails. Use this for the real shop.
- **Static demo** (`STATIC_EXPORT=1`): plain HTML for GitHub Pages. Checkout and the inquiry form run only in the browser. Nothing is stored or emailed, and a banner says it is a demo. The QR code uses a sample bank account.

Files named `*.server.ts(x)` are only used in the full build. Files named `*.static.tsx` are only used in the demo build (see `next.config.ts`).

## Deploy

### Demo on GitHub Pages (current)

1. On GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push to `main` (or the current working branch). The **Deploy demo to GitHub Pages** workflow builds and publishes the site to `https://<user>.github.io/<repo>/`.

GitHub Pages for a private repository requires a paid GitHub plan.

### Real shop on Vercel (recommended)

1. Create a free database at [turso.tech](https://turso.tech) and copy its URL and token.
2. Create a free account at [resend.com](https://resend.com), verify your domain and create an API key.
3. At [vercel.com](https://vercel.com), click **Add New → Project** and import this repository. Keep the defaults.
4. Under **Settings → Environment Variables**, add the variables from the table below. Use `libsql://…` for `DATABASE_URL`.
5. Deploy, then add your domain under **Settings → Domains**.

Note: Vercel limits request bodies to 4,5 MB, so larger inquiry attachments fail there. If customers often send big files, host on a VPS, or tell them to email large files.

### Real shop on a VPS

```bash
npm ci && npm run build
DATABASE_URL=file:/var/lib/eshop/shop.db npm start   # behind nginx/Caddy with HTTPS
```

Back up the database file regularly.

## Environment variables

| Variable | Required | Example / meaning |
|---|---|---|
| `SITE_URL` | yes | `https://www.example.cz`, used in emails, sitemap and SEO |
| `OWNER_EMAIL` | yes | Where new orders and inquiries are sent |
| `EMAIL_FROM` | yes | `Ocel & Laser <obchod@example.cz>` (domain verified in Resend) |
| `RESEND_API_KEY` | yes | Resend API key |
| `BANK_IBAN` | yes | `CZ65 0800 0000 1920 0014 5399` |
| `BANK_ACCOUNT` | yes | `19-2000145399/0800` (shown to customers) |
| `BANK_RECIPIENT` | no | Account holder name in the QR code (defaults to the shop name) |
| `PAYMENT_DUE_DAYS` | no | Default `7` |
| `DATABASE_URL` | yes | `file:data/shop.db` or `libsql://…turso.io` |
| `DATABASE_AUTH_TOKEN` | Turso only | Turso token |

The bank account values in `.env.example` are the sample account from the Czech QR payment specification. Replace them before going live.

## Edit products and settings

- **Products:** `src/content/products.ts`. Each product has a name, descriptions, images, material, thickness, variants (options, price, weight, dimensions), optional personalization, lead time, warnings and care instructions. The fire pit + grill plate set is defined under `bundles`; its price is computed from the parts minus `discountPercent`.
  - To add a product, copy an existing block, change the `slug` (it becomes the URL) and the values, and give each variant a unique `id`.
  - Do not change variant `id`s once orders exist; old orders refer to them.
  - To turn personalization on or off for a product, add or remove its `personalization` block (`maxLength`, optional `price`).
- **Shop settings:** `src/content/settings.ts`. This holds the shop name, seller details (shown on the contact and legal pages and in emails), shipping methods and prices by weight, the global personalization switch, and the default payment due period.
- **Images:** files live in `public/images/`; reference them as `/images/name.webp`. Landscape images around 1 600 px wide work best (cropped to 4:3). An image can be tied to a variant with `match`, e.g. `{ src: "...", alt: "...", match: { Motiv: "Mapa Česka" } }`; it is then shown only when that option is selected.

## Product images and the 3D view

The product images in `public/images/products/` are renders of 3D models of the products, not photos. The models live in `src/three/`:

- `models.ts`: the geometry. Each part is an extruded flat outline, just like the laser-cut part (grill plate ring, the four slot-together fire pit panels, the wall art motifs, the façade letters).
- `materials.ts`: procedural corten, steel, stainless and plaster textures (generated in the browser, no texture files).
- `scenes.ts`: the studio, evening fire, wall and façade scenes and the list of image shots.
- `viewer.ts`: the interactive 3D view on product pages. It is loaded only after the visitor clicks "Zobrazit ve 3D", and it follows the selected variant.

After changing a model or adding a shot, run `npm run render` (or `npm run render -- hero plate-studio` for specific shots). It needs Chromium (`npx playwright install chromium`) and ImageMagick. When you have real photos, just replace the files or change the paths in `products.ts`; the 3D view keeps working.

The Czech border for the map motif comes from Natural Earth (public domain); the sample logo uses Inter Tight (SIL Open Font License). The laser-cutting photos are credited on `/zdroje-fotografii`.

## Orders

Each order gets a 10-digit number (`YYMMDD` + 4 random digits). It is also the variable symbol (VS) for the payment. The customer sees the payment details and QR code at `/objednavka/<random-token>` and in the confirmation email.

Orders are stored in the `orders` table with a `status` column: `new` → `awaiting_payment` (set once the confirmation email is sent) → `paid` → `in_production` → `shipped` → `done`, or `cancelled`. Version 1 has no admin page, so change the status directly in the database, for example in the Turso dashboard:

```sql
UPDATE orders SET status = 'paid' WHERE order_number = '2610041234';
```

Inquiries are stored in `inquiries`. Their files are in `inquiry_files`, and the owner gets a download link for each file by email.

## Legal

- **TODO: have a lawyer review** the terms, privacy policy, cookie notice, returns and complaints pages (`src/app/obchodni-podminky`, `ochrana-osobnich-udaju`, `cookies`, `vraceni-zbozi`, `reklamace`). They are placeholder texts. Values in square brackets come from `settings.ts` and are still empty.
- Under Czech law (§ 1837 of the Civil Code), goods made to the customer's specification or personalized are generally excluded from the 14-day withdrawal right. This covers custom logos and wall art with custom text. The checkout asks for an extra confirmation when the cart contains personalized items. Confirm the final wording with a lawyer.
- The site uses no tracking or analytics cookies, so no consent banner is needed. If you add analytics later, use a cookie-less tool such as Plausible.

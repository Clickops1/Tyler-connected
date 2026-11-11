# The Great Unknown Liquidation: Shopify theme

A custom Shopify theme for The Great Unknown Liquidation (Franklin, WI), built on Shopify's Dawn theme and styled to the
TGU brand guidelines v1.0 (forest / sand / cream, Antonio + Montserrat, the mountain-and-river mark).

Tyler and Kylee manage products, orders and payments in Shopify. This repo only controls how the store looks.

## What's in it

| Area | What it does |
| --- | --- |
| Brand layer | `assets/tgu-brand.css`: Antonio uppercase headlines, pill buttons, brand badges, forest plates, contour motif, focus rings, reduced-motion support. Color schemes live in `config/settings_data.json`. |
| Logos and icons | `assets/tgu-logo-{sand,forest,cream}.png`, `tgu-mark-sand.png`, favicons and app icon, pulled from the brand guidelines PDF. The header shows the mark until a logo is uploaded in the theme editor. |
| Homepage | `templates/index.json`: hero, "What we carry" category plates, "What's on the shelves this week" products, mystery box teaser with email sign-up, our story, visit (address + map). |
| Custom sections | `sections/tgu-*.liquid`: all editable in the Shopify theme editor and addable to any page. |
| Condition badges | `snippets/tgu-product-badges.liquid`: shows **Open box**, **As is**, **New**, etc. on product cards and product pages. |
| % below retail | Product cards and pages show "35% below retail" when a compare-at price is set. |
| Stock left | Product pages show the real stock count when 5 or fewer are left. |
| "Just in" badge | Products added in the last 7 days get a "Just in" badge (change the window in Theme settings → TGU Liquidation). |
| Motion | Hero ridge line draws itself and the copy rises in; sections slide in as you scroll; icons draw on; a slow "finds" ticker; a dotted "trail" linking the How-it-works steps. All motion switches off for visitors who turn on reduced motion. |
| Product page | Retail-vs-our-price box (only with a real compare-at price), condition explainer, "Want to see it first?" visit prompt, FAQ accordions, real low-stock count, "Your recent finds" strip. |
| Shopping | "New this week" row (newest products first, quick view on every card), "Just missed it" strip of real sold-out items, quick view on collection pages, filter sidebar, recently viewed. |
| Pages | Templates for About, Visit, Mystery boxes, What we carry and Wholesale & contractors (see below). |

## Connect it to the store (one time)

1. In Shopify admin go to **Online Store → Themes**.
2. Click **Add theme → Connect from GitHub**, sign in to GitHub, and pick this repository and the branch to use.
3. The theme appears in the theme library. Click **Customize** to preview it, then **Publish** when ready.

From then on, changes pushed to that branch show up in the store automatically, and edits made in the theme editor are
committed back to the branch.

## How Tyler adds products

In the Shopify app or admin, under **Products → Add product**:

- **Photos:** real photos of the actual item (brand rule: no AI or stock product photos).
- **Price:** what TGU sells it for.
- **Compare-at price:** the item's **real retail price**, only if known. This creates the "% below retail" badge.
  Leave it empty otherwise. Never invent a retail price.
- **Quantity:** track inventory so items sell out properly and "only X left" shows when stock is low.
- **Condition:** add one tag such as `condition:new`, `condition:open-box`, `condition:like-new`, `condition:used`
  or `condition:as-is`. Dashes become spaces, so the badge reads "Like new" or "As is".
  (Alternatively, create a product metafield `custom.condition` as single-line text; it takes priority over tags.)
- **Collection:** add it to one of the category collections below.

For a whole pallet, use **Products → Import** with Shopify's CSV template. Put the condition tag in the `Tags` column.

## Store setup checklist

### Page templates
Create each page in **Online Store → Pages**, then pick its template under **Theme template**:

| Page | Handle | Template | What's on it |
| --- | --- | --- | --- |
| About | `about` | `page.about` | Story, values, the page's own text, trail, visit. The homepage "Read our story" button links here. |
| Visit | `visit` | `page.visit` | Address, map, visiting FAQ, contact form. "Book a visit" buttons link here by default. |
| Help & FAQ | `faq` | `page.faq` | Searchable FAQ with topic navigation, plus FAQ structured data for Google. |
| Condition guide | `condition-guide` | `page.condition-guide` | What New / Like new / Open box / Used / As is mean, each linking to that condition's products. |
| How it works | `how-it-works` | `page.how-it-works` | 4-step trail, next drop, buying FAQ, visit. |
| Drops | `drops` | `page.drops` | Next-drop countdown, just landed, finds videos, just sold. |
| What we carry | `what-we-carry` | `page.what-we-carry` | Category cards, ticker, new arrivals, just sold. |
| Mystery boxes | `mystery-boxes` | `page.mystery-boxes` | Coming-soon page with the box reveal and sign-up. |
| Franklin, WI (local SEO) | `liquidation-store-franklin-wi` | `page.local` | Local landing page for "liquidation store near Milwaukee / Franklin" searches. |
| Wholesale & contractors | `wholesale` | `page.wholesale` | **[CONFIRM]** Only publish once Tyler confirms they offer it. |
| Faith statement | `faith` | `page.faith` | In Tyler and Kylee's own words (the page's text). |

The 404 page ("Off the trail.") and blog articles (breadcrumbs) are styled automatically.

### Menus (hamburger)
The header uses a hamburger menu on every screen size, with a "Book a visit" button beside it on desktop. Set up
**Online Store → Navigation**:

- **Main menu** (`main-menu`): Shop all, New this week (`/collections/all?sort_by=created-descending`), Drops,
  What we carry (with the four category collections nested under it), Mystery boxes, How it works, Condition guide,
  About, Help & FAQ, Visit.
- **Footer menu** (`footer`): Help & FAQ, Condition guide, Visit, Faith statement, plus the Shopify policies.

The menu also shows the address, hours, contact details and TikTok from **Theme settings → TGU Liquidation**.

### SEO checklist
Built in:
- Structured data: the store as a local business (address, area served, TikTok), products with real price,
  availability and **condition** (shows as New/Used in Google), breadcrumbs on products, collections and articles,
  and FAQ data on the Help & FAQ page.
- Brand share image (logo on forest) for any page without its own image, plus Open Graph and Twitter tags.
- One main heading per page (TGU page heroes hide the duplicate page title).

To do in Shopify:
- [ ] **Business details** in Theme settings → TGU Liquidation: fill in phone, email and hours once confirmed. They feed
      the menu and the structured data.
- [ ] **Search engine listing** on every product, collection and page (Edit → Search engine listing): a clear title
      ("Open-box power recliner | The Great Unknown Liquidation") and a one-sentence description.
- [ ] **Homepage title and description** in Online Store → Preferences, e.g. "Liquidation store in Franklin, WI |
      The Great Unknown Liquidation" and "Overstock and returns at liquidation prices near Milwaukee: renovation gear,
      furniture, electronics, watches and home goods."
- [ ] **Alt text** on product photos: say what the item is and its condition.
- [ ] **Google Business Profile** for the Franklin address, linking to the site, and **Google Search Console** with the
      sitemap at `/sitemap.xml` (Shopify generates it).
- [ ] **Collection descriptions**: two or three plain sentences each (they show at the top of the collection).
- [ ] Optional: a **blog** ("Finds journal") with hauls and how-tos. Each post is a new page Google can find.

### Filters (shop by condition, category, price)
Install Shopify's free **Search & Discovery** app, then under **Filters** add: Availability, Price, Product type, and
**Tag** (or the `custom.condition` metafield) for condition. The collection pages show them in a sidebar automatically.

### Keep sold items published
The "Just missed it" strip shows real sold-out products. It only works if sold-out products stay published (Shopify's
default). It hides itself when nothing is sold out.

### Create in Shopify admin
- [ ] Collections: **Renovation & tools**, **Furniture**, **Electronics & watches**, **Home goods**. Then in the
      theme editor, link each "What we carry" plate to its collection.
- [ ] Navigation: a `main-menu` (Shop all, the four categories, About, Visit) and a `footer` menu (About, Contact,
      Faith statement, policies).
- [ ] Pages: **About** (link it from the "Read our story" button), **Contact**, **Faith statement** (in Tyler and
      Kylee's own words).
- [ ] Policies under **Settings → Policies**: returns, and an as-is policy if they use one.
- [ ] Payments (Shopify Payments), shipping and/or local pickup under **Settings**.
- [ ] Social sharing image: **Online Store → Preferences**, using the logo-on-forest image (1200×630).
- [ ] Theme settings → Logo: upload `tgu-logo-sand.png` or the mark if you want something other than the default
      header mark.

### [CONFIRM] with Tyler and Kylee before launch
The brand guidelines say: don't invent prices, hours, policies, reviews, stock counts or social handles.

- [ ] Hours: the site currently says **"Showroom open by appointment"** (Visit section and footer).
- [ ] Phone number: blank for now. Add it in the Visit section, which also turns on the "Book a visit" button.
- [ ] Booking method: a phone call, a contact form, or a booking app? Set the Visit section's booking link.
- [ ] Email address for the contact page.
- [ ] Instagram and Facebook handles. Only TikTok (@tguliquidation) is confirmed and set.
- [ ] Local pickup and/or shipping. Nothing on the site promises either yet.
- [ ] "Stock changes weekly" and "You never know what you'll find" are **not** used on the site until confirmed.
- [ ] Real photos: store and aisles for the hero background, Tyler and Kylee for "Our story".
- [ ] Vector logo (SVG/AI) and a horizontal lockup from their designer, if they exist.
- [ ] Swap the mystery box art for photos of the real boxes once they exist.
- [ ] Condition definitions on product pages (theme editor → Product → Condition explainer). The defaults are
      general ("Open box: the packaging has been opened…"); Tyler and Kylee should approve the wording.
- [ ] FAQ answers on product pages and the Visit page say the showroom is by appointment.
- [ ] Wholesale & contractors page: only publish if they offer it.

## Working on the theme locally

```bash
npm install -g @shopify/cli
shopify theme dev --store <store>.myshopify.com   # live preview against the real store
shopify theme check                               # lint
```

## Credits

Based on [Dawn](https://github.com/Shopify/dawn) by Shopify (see `LICENSE.md`).

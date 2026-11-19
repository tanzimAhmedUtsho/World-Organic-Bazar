# World Organic Bazar — implementation plan

## Requirements and current project

The supplied project brief defines a Bangladeshi premium food marketplace, a working customer shop, an authenticated database-backed admin, content management, and operations. The workspace previously contained a Next.js customer storefront with a typed example catalog and localStorage basket. It had no database, authentication, checkout, or admin. The user-provided brief is now the source of truth; the earlier narrower assumptions are superseded.

## Architecture

- **Framework and UI:** Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion, Lucide, React Hook Form, and Zod. Server components serve catalog/content and metadata; client components are limited to interactive experiences.
- **Persistence:** PostgreSQL with Prisma. Use `Decimal` for monetary values, BDT currency, explicit variant-level weight/price/stock, indexes for search/filter keys, unique slugs/SKUs/order numbers, timestamps, and restrictive/cascading relations chosen per record lifecycle.
- **Domain models:** User, Address, Role/Permission, Category, Product, ProductImage, ProductVariant, Cart/CartItem, Wishlist/WishlistItem, Order/OrderItem, OrderStatusHistory, Payment, Coupon/CouponUsage, Review, Video/VideoCategory, BlogPost/BlogCategory, NewsletterSubscriber, HomepageSection, Banner, SiteSetting, InventoryTransaction, and AuditLog.
- **Backend boundary:** Validated server actions and route handlers call domain services. Product prices, stock, shipping, coupon eligibility, ownership, and payment state are recalculated/verified server-side. Checkout reserves/decrements stock and redeems coupons in database transactions. Payment adapters keep COD usable and provide explicit server-verified integration points for SSLCommerz, bKash, and Nagad.
- **Authentication/security:** Auth.js sessions, hashed credentials where enabled, server-enforced role/permission checks, protected admin mutations, rate limits for sensitive public endpoints, validated upload types/sizes, order ownership checks, and admin audit events. Secrets are environment-only.
- **Media and email:** Provider interfaces for Cloudinary-compatible image/video storage and email; no credentials or successful external integration are fabricated. `.env.example` and README document configuration.

## Brand and design system

- Brand direction: premium Bangladeshi food culture, authentic sourcing and traditional taste, with editorial photography and whitespace rather than a generic grocery grid.
- Palette: Forest Green `#173F2B`, Deep Olive `#536B3B`, Warm Cream `#F8F5EC`, Natural Beige `#E9DFC9`, Earth Brown `#79583C`, White.
- Bengali typography: Hind Siliguri or Noto Sans Bengali; English display/body pairing uses refined serif and clear sans. Include locally hosted fonts when licensed assets are supplied; otherwise provide robust fallbacks.
- Shared tokens, responsive shell, sticky navigation/search, product/category cards, cart controls, empty/loading/error states, admin primitives, focus states, keyboard support, reduced motion, and touch-sized controls.
- Avoid unsupported organic/certification claims. Reviews and seed content are visibly demo data until verified.

## Customer website

- Home: editable announcement/hero, category collection, best sellers, seasonal campaign, trust cards, video stories, founder/brand story, demo-marked testimonials, newsletter and editable footer.
- Shop/category/product: database-backed product cards and detail, variant-specific price/stock, search, filters, sort, pagination, wishlist and related products.
- Cart/checkout: persistent cart, selected variants, coupons, shipping calculations, BDT totals, validated COD orders, customer details, order status timeline and tracking by order/phone.
- Account/content: registration/login, addresses, orders, wishlist, food stories and videos, blog/recipes, contact, policies, SEO metadata and structured data.

## Admin dashboard

- `/admin/login` and protected `/admin` shell with responsive navigation, metrics from real records, activity, order statistics and reports.
- Product/variant/image/category CRUD; orders and status timeline; customer lookup; variant inventory/adjustments; video/blog CMS; homepage sections; coupon/review moderation; delivery/payment settings; users/roles; reports and CSV export.
- Every dashboard mutation uses server permission checks, schema validation and audit logging. Dashboard metrics and records come from the same PostgreSQL services as the storefront.

## Phases and acceptance

### Phase 1 — project foundation

- Align the app structure to `src/app/(store)`, `src/app/admin`, reusable component domains, Prisma, Auth.js, validation, shared utilities, Tailwind, environment template, seed workflow, and setup/deployment docs.
- Add normalized schema and migration/seed instructions, with a secure env-configured Super Admin seed.
- Acceptance: dependencies install, Prisma client generates, TypeScript checks, and production build succeeds. Database-backed flows require a configured PostgreSQL URL.

### Phase 2 — customer website and commerce

- Build the specified responsive brand site, database-fed catalog and product variants, search/filter/sort/pagination, wishlist, cart, checkout with COD, order creation/tracking, customer account, content pages and SEO.
- Acceptance: verified against configured PostgreSQL; stock/price/coupon logic is server-side and transactional; COD order lifecycle works.

### Phase 3 — admin dashboard

- Build protected dashboard, metrics, product/category/order/customer/inventory/video/blog/homepage/coupon/review/shipping/settings/user management, and analytics/export.
- Acceptance: CRUD persists to PostgreSQL, permission boundaries hold server-side, and important changes create audit/history rows.

### Phase 4 — integrations

- Add configured object storage, email notifications, and payment adapters for SSLCommerz/bKash/Nagad. Online payments remain pending until verified by trusted server callbacks.
- Acceptance: integrations are tested in provider sandbox when credentials exist; unavailable credentials are documented without fake success.

### Phase 5 — quality and deployment

- Check key customer/admin paths, security boundaries, responsive breakpoints, SEO metadata, upload validation, errors/loading states, and Vercel deployment readiness.
- Acceptance: production build passes, configured database migration/seed completes, and outstanding external credentials are listed clearly.

## External inputs and configuration still needed

- A PostgreSQL connection string and deployment environment.
- Verified catalog, variants, prices, stock, product photos, actual sourcing/certification language, delivery districts/fees, and business contact/social links.
- Cloudinary-compatible media credentials and email provider if uploads/notifications should be live.
- Payment credentials and business onboarding for SSLCommerz, bKash, or Nagad.
- Production admin email/password supplied through environment variables; never committed.

# World Organic Bazar

A premium editorial food marketplace for Bangladesh, built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Auth.js, Zod, React Hook Form, and Framer Motion.

## Requirements

- Node.js 20.9 or newer
- PostgreSQL 14 or newer
- npm

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Use a unique random auth secret and an admin password of at least 12 characters.
3. Create the PostgreSQL database named in `DATABASE_URL`.
4. Apply the schema with `npm run db:migrate`.
5. Generate the local development catalog and Super Admin with `npm run db:seed`.
6. Run `npm run dev` and open `http://localhost:3000`.

The seed requires an admin email and password from the environment. It creates product/category sample content, draft CMS examples, an inactive demo coupon, and an unpublished demo video. Seeded prices, stock and sample imagery are development data; confirm all business information before launch. The sample review is pending and marked as demo, so it is never displayed as real feedback.

## Useful commands

- `npm run dev` — local development server
- `npm run build` — generate Prisma Client and build the production app
- `npm run start` — run the production build
- `npm run typecheck` — TypeScript validation
- `npm run db:generate` — regenerate Prisma Client
- `npm run db:migrate` — create/apply a development migration
- `npm run db:deploy` — apply committed migrations in a deployment environment
- `npm run db:seed` — seed development content and the environment-defined Super Admin
- `npx prisma studio` — inspect local records

## Environment configuration

See `.env.example` for PostgreSQL, Auth.js, admin seed, optional media/email, and payment-provider variables. Keep `.env` out of version control. The online payment variables are placeholders for later merchant setup; the application must keep payment state pending until a trusted provider callback validates a transaction.

## Database and core models

The Prisma schema includes users and Auth.js tables, addresses, roles and permissions, product/category/variant/image records, carts, wishlists, orders and status history, payments, coupons, reviews, video and blog CMS, newsletter subscriptions, homepage sections and banners, site/shipping settings, inventory transactions, and audit logs. Product variants own the SKU, weight, BDT price and stock quantity. Orders keep immutable item and address snapshots.

For deployment, set the same required environment variables in the hosting provider, provision PostgreSQL, run `npm run db:deploy`, run the seed once with a secure admin credential if needed, then deploy the Next.js app. Configure image storage and email before enabling uploads and notifications. Configure SSLCommerz, bKash, or Nagad only with merchant credentials and server-side callback verification.

## Project areas

- `src/app` — storefront, account, API, and protected admin routes
- `src/components` — reusable layout, product, cart, and admin UI
- `src/lib` — Prisma, authentication, authorization, domain utilities, and validation
- `src/actions` — validated server mutations
- `prisma` — PostgreSQL schema and seed


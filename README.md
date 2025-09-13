# Flex Living – Reviews Dashboard

## What this is
Manager dashboard to review and publish guest reviews to the public property page. Data is normalized from the Hostaway mock and filtered/sorted client side via a Next.js API.

## Tech stack
- Next.js (App: pages router) + TypeScript
- Tailwind CSS
- Recharts for analytics
- Prisma (SQLite) for storing review status
- Jest + React Testing Library for unit tests
- MSW v2 for API mocking (optional for e2e/unit)

## Key decisions
- Unified `status` field on reviews: `pending | approved`
- Category scores normalized to 1–5 (from Hostaway 10-pt scale) for UI; API supports category filtering
- Analytics defaults to approved-only KPIs when appropriate
- Stateless filtering via querystring (bookmarkable)

## Features
- Property overview (totals, average rating, approved)
- Filters: channel, rating, status, date range, category + min category, sort (date/rating)
- Approve, reset (pending) flows
- Category quick stats (cleanliness, communication, location, accuracy, check-in, value)
- Review analytics chart (count + average over time)
- Public property page that mirrors Flex Living style; displays only approved reviews
- Lightbox gallery with keyboard navigation

## API
`GET /api/reviews/hostaway`
- Query: `property, channel, rating, status, startDate, endDate, category, minCategory, sort, limit, offset`
- Returns: `{ status: 'success', data: NormalizedReview[], total }`

`POST /api/reviews/approve` → body `{ reviewId }` → sets status=approved  
`POST /api/reviews/reset` → body `{ reviewId }` → sets status=pending


## Prerequisite

- **Node.js 20.x** (required)
	- You can check your version with:
		```bash
		node -v
		```
	- [Download Node.js 20 LTS](https://nodejs.org/en/download)

## Run locally
```bash
# 0. Clone code
git clone https://github.com/ntnhan2266/flex-living-reviews.git

# 1. Install dependencies
npm install

# 2. Set up environment variables
# (Copy .env.example to .env and update as needed)
cp .env.example .env

# 3. Run database migrations (using Prisma)
npx prisma migrate dev --name init

# 4. Start the development server
npm run dev

# 5. Run tests (optional)
npm run test

# 6. Run linter (optional)
npm run lint

# 7. Run formatter
npm run format
```

## Project Structure

- `src/` – Main source code (components, pages, lib, data)
- `prisma/` – Prisma schema and migrations
- `public/` – Static assets
- `styles/` – Global styles (Tailwind CSS)

## Troubleshooting

- If you encounter issues with the database, try resetting with:
	```bash
	npx prisma migrate reset
	```

## Google Reviews Integration
Check `docs/GOOGLE_REVIEW.md`

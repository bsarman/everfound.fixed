# EverFound — Modernized

Classic multi-page recreation of the original **EverFound.com** (2000–2003 ColdFusion address-book / social contacts site).

**Goal:** Keep the original look and feel (blue theme, tab navigation, table layouts) while using a modern, secure stack.

## Stack

- **Next.js 15** (App Router) — classic multi-page style
- **TypeScript**
- **PostgreSQL** + **Prisma**
- **iron-session** + **bcrypt** for auth
- **Tailwind CSS v4** (used lightly; most styling is classic CSS)
- **Vercel** ready

## Features implemented

### Auth & Account
- Login with “Remember Me”
- Logout
- Registration (`/join`)
- Account preferences (email, password change, rows-per-page)
- Password-reminder placeholder

### Contacts
- List contacts (with folder filter)
- Add contact
- Edit contact
- Soft-delete contact
- Manage folders (create / delete / filter)

### Groups
- List groups
- Create group (with year / invite options)
- Edit group properties
- Invite people (from existing contacts or manual entry)
- View members & invite status
- Delete group

### Static pages
- About
- How EverFound Works
- Privacy Policy

### Layout
- Classic blue header + tab bar (Contacts / Groups / Preferences / Appointments)
- Original color scheme and table-based feel
- Original graphics (partial set) in `public/graphics/`

## Getting started

```bash
cd everfound-modern
npm install
cp .env.example .env
# Edit .env → set DATABASE_URL and SESSION_SECRET (min 32 chars)
```

Create a free Postgres database (Neon or Vercel Postgres recommended), then:

```bash
npx prisma db push
npx prisma generate
npm run dev
```

Open http://localhost:3000

### Deploy to Vercel

1. Push this folder to a GitHub repo
2. Import into Vercel
3. Add environment variables `DATABASE_URL` and `SESSION_SECRET`
4. Deploy

## Project structure (key files)

```
src/app/
  page.tsx              → Login / home
  join/                 → Registration
  contacts/             → List, new, [id] edit, delete
  folders/              → Folder management
  groups/               → List, new, [id] edit+invite, delete
  account/              → Preferences
  about/ how/ privacy/  → Static pages
  logout/
src/components/
  ClassicLayout.tsx     → Shared classic header + tabs
src/lib/
  auth.ts session.ts prisma.ts
prisma/schema.prisma    → Full inferred schema
```

## Next possible work

- Appointments / calendar (schema already present)
- Car recall feature
- Real email sending for invites & password reset (Resend / Postmark)
- Move more original GIFs into the tab bar
- Seed script with sample data

## Notes

- Original passwords were plain text → now bcrypt
- Original queries had SQL injection → Prisma parameterizes everything
- Many original pages were missing from the zip → reconstructed from patterns and remaining code
- Classic multi-page navigation is preserved (no SPA client routing)

See `INVENTORY_AND_SCHEMA.md` for the full original page inventory and schema notes.

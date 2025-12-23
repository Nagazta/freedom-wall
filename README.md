# Freedom Wall — Soft Rebirth

An anonymous, public "freedom wall" web application for Christmas and New Year reflection. A safe, calm space where people can share unsaid feelings before the year ends.

## Theme

**Soft Rebirth** — Christmas warmth + New Year renewal

A place to release the words you never said this year, anonymously and honestly.

## Features

- **Anonymous Posting** — No accounts, no usernames, just honest words
- **Mood Tags** — Express feelings: Gratitude, Regret, Love, Apology, Hope
- **Public Feed** — Read all confessions, filter by mood, or discover random posts
- **Time Lock** — Posting closes Dec 31, 2025 at 11:59 PM UTC
- **Read-Only Archive** — After the deadline, the wall becomes a time capsule
- **Safety First** — Basic profanity filtering and rate limiting (1 post per minute)
- **Beautiful UX** — Soft animations, dark calming theme, gentle snow effects

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** Custom CSS with Soft Rebirth theme
- **Animations:** Framer Motion
- **Backend:** Supabase (PostgreSQL)
- **Security:** Row Level Security (RLS), Anonymous access only

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd freedom-wall
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

The `.env` file has already been created with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

### 6. Build for Production

```bash
npm run build
npm run preview
```

**2025 — Soft Rebirth**

_Anonymous. Honest. Forever._

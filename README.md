# Mini-Economy Simulation 💰🎮

A production-ready Next.js application managing a 50-minute financial literacy game for kids. 
Children use printed QR codes as "Debit Cards". Station volunteers and bank tellers scan the cards using mobile and desktop cameras to onboard kids, process debits, and distribute rewards or fines.

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Atomic RPCs + Row-Level Locking)
- **Client**: `@supabase/supabase-js` (Service Role authentication)
- **QR Engine**: `html5-qrcode`

---

## 📁 Project Architecture

```
├── app/
│   ├── api/
│   │   ├── citizens/
│   │   │   └── route.js        # POST /api/citizens (Onboarding) & GET /api/citizens
│   │   └── transactions/
│   │       └── route.js        # POST /api/transactions (Atomic RPC execution)
│   ├── bank/
│   │   └── page.js             # Desktop view: Bank Desk & Kid Registration
│   ├── pos/
│   │   └── page.js             # Mobile-first: Volunteer POS with 2s green takeover
│   ├── globals.css             # Tailwind base styles & video scanner styling
│   ├── layout.js               # Root layout
│   └── page.js                 # Landing portal & station switcher
├── lib/
│   └── supabase.js             # Supabase client using Service Role Key
├── schema.sql                  # PostgreSQL tables, indexes & process_transaction RPC
├── .env.example                # Environment variables template
├── jsconfig.json               # Path alias configuration (@/*)
├── tailwind.config.js          # Tailwind CSS theme configuration
└── package.json
```

---

## 🛠️ Step 1: Database Setup (Supabase)

1. Open your Supabase project dashboard at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** from the left navigation.
3. Paste the contents of [`schema.sql`](./schema.sql) and click **Run**.
   - Creates `citizens` and `transactions` tables with indexes and check constraints.
   - Deploys the `process_transaction` atomic stored procedure with row-level locking (`FOR UPDATE`) to prevent race conditions during rapid scanning.

---

## ⚙️ Step 2: Environment Variables

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

Inside `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-api-key"
```

> **Note**: Obtain the **Service Role Key** under **Project Settings → API**. The service role key bypasses RLS in backend API routes to safely run the transactional ledger.

---

## 💻 Step 3: Run the Application

```bash
# Install dependencies (already completed)
npm run dev
```

Visit:
- **Home**: [http://localhost:3000](http://localhost:3000)
- **Bank Desk (Desktop)**: [http://localhost:3000/bank](http://localhost:3000/bank)
- **Volunteer POS (Mobile)**: [http://localhost:3000/pos](http://localhost:3000/pos)

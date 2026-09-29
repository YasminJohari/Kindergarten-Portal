# Tadika Cahaya Bintang — Portal Sambungan Ibu Bapa & Prasekolah

A Malaysian kindergarten (tadika) parent–school connection portal built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Firebase**. Available to parents and teachers in Bahasa Melayu.

Runs fully offline in **Demo Mode** with no backend required, and upgrades to a live multi-user portal the moment you paste in Firebase keys.

---

## Feature overview

| Area | What it does |
| --- | --- |
| **Authentication** | Email/password login, self-service registration, Google sign-in, password-reset email. A route guard redirects unauthenticated visitors to `/login`. |
| **Role-based portal** | One codebase, two experiences. `parent` sees feed, billing, messages and the child record; `admin` sees attendance marking, post creator, fee management and class roster. Identity comes from the logged-in account — there is no role toggle. |
| **PDF receipts** | A real `jsPDF` + `jspdf-autotable` A4 receipt generated in the browser and downloaded as `INV-TCB-2026-xxxx.pdf`. No third-party API, no cost. |
| **Firebase sync** | Live `onSnapshot` subscriptions for posts, invoices and attendance; writes are mirrored back to Firestore. Guardian subscriptions are automatically scoped to their own children. Every call degrades gracefully when Firebase is absent. |
| **AI assistant** | Chat panel answering questions about fees, attendance and activity. Uses the **server-side proxy** at `/api/ai` (Google Gemini free tier, Groq fallback) and always falls back to a built-in offline engine. |
| **Payments** | FPX online banking, DuitNow QR, Touch 'n Go and GrabPay checkout flows with transaction reference generation. |

---

## Quick start (Demo Mode — zero configuration)

```bash
npm install
npm run dev
```

Open <http://localhost:3000> — you are redirected to `/login`. Use a demo account:

| Role | Email | Password |
| --- | --- | --- |
| Parent | `parent@tadika.my` | `sayang1` |
| Teacher / admin | `admin@tadika.my` | `cikgu1` |

The one-tap **Demo Ibu Bapa** / **Demo Cikgu** buttons fill these in for you.

---

## Connect a real Firebase project

1. Create a project at <https://console.firebase.google.com> — the **Spark** free plan is enough.
2. **Build → Authentication → Sign-in method**: enable **Email/Password** and **Google**.
3. **Build → Firestore Database → Create database**.
4. **Project settings → Your apps → Web app**: copy the config values.
5. Copy the env template and paste the values in:

   ```bash
   cp .env.local.example .env.local
   ```

6. Deploy the security rules that ship with this repo (they enforce the parent/admin split):

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init      # or copy .firebaserc.example to .firebaserc and set your project id
   firebase deploy --only firestore:rules
   ```

   > **Cloud Firestore only — Storage is not used.** This portal never uploads a byte: receipts are generated in the browser with jsPDF and activity photos are plain URLs. Cloud Storage for Firebase also requires the paid Blaze plan, so `src/lib/firebase.ts` initialises **Auth + Firestore only**, `firebase.json` has no `storage` block, and `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` may stay blank.

7. Restart `npm run dev`. The header banner flips from **“Mod Demo”** to **“Disambungkan ke Firebase”**.

### Seeding your first admin

Roles live in `users/{uid}.role`. After registering in the UI, open Firestore and set your document's `role` to `"admin"`, or sign in with one of the staff emails pre-listed in `ADMIN_EMAILS` inside `src/lib/auth.tsx`.

> **Important:** `firestore.rules` reads the role from the `users` document, so a parent cannot escalate themselves to admin by editing their own profile.

### Firestore security rules

`firestore.rules` ships with the repo and is wired up in `firebase.json`. It is the actual enforcement layer — the UI hiding a tab is only cosmetic.

| Collection | Read | Write |
| --- | --- | --- |
| `users/{uid}` | owner, or admin | self-create; self-update limited to `displayName`, `lastLoginAt`, `photoURL`, `phone`, `provider`; `delete` admin-only |
| `posts` | any signed-in user | admin only |
| `invoices` | admin, or the owning guardian | admin only — except that a guardian may set `status`, `paidDate`, `paymentMethod`, `transactionId` on their own invoice |
| `attendance` | admin, or the owning guardian | admin only |
| `announcements` | any signed-in user | admin only |
| `messages` | any signed-in user | create any signed-in; update/delete admin |
| anything else | denied | denied |

`isAdmin()` does a `get()` on `users/{uid}` and checks `role == 'admin'`, which is why editing your own profile can never grant you admin rights. `ownsDocument()` then decides the guardian split, and because it is a `diff()`-based allowlist, a parent cannot quietly edit their own total.

### Linking a parent to their child

A guardian sees fees and attendance only for the student ids listed in `childIds` on **their own** profile. Staff set it in the Firestore console — a parent must never edit it themselves, and the rules exclude it from self-update:

```
users/<parent uid>
  role:     "parent"
  childIds: ["std-1", "std-2"]   # student ids of that family's pupils
```

How the pieces fit together:

- Every guardian read of `invoices`/`attendance` is filtered **in the query** (`where('studentId', 'in', childIds)`), because Firestore refuses an entire subscription if any single candidate row would fail a rule. Staff keep the unfiltered subscription.
- Filtered queries are sorted in memory rather than with `orderBy()`, so **no composite index** has to be created in the console.
- New invoices are stamped with `parentUid` (the guardian's auth uid), resolved by `findParentUidByStudent()` when staff generate a fee. The rules accept either `parentUid == uid` **or** the `childIds` link, so invoices written before that field existed stay readable with no back-fill.
- A guardian with no `childIds` gets an empty billing/attendance view instead of somebody else's demo rows.

### Try it locally with the emulator

`firebase.json` already exposes the Auth, Firestore and Emulator UI ports:

```bash
firebase emulators:start          # auth :9099, firestore :8080, UI :4000
```

Point the app at the emulator by connecting it in `src/lib/firebase.ts` (`connectAuthEmulator` / `connectFirestoreEmulator`) during development. Rules can then be tested without touching production data, and the Emulator UI shows every read and write against them.

---

## Enable the free AI assistant

Keys are read **only on the server** by `src/app/api/ai/route.ts` and are never shipped to the browser.

```bash
# .env.local
GEMINI_API_KEY=your_key_here      # https://aistudio.google.com/apikey   (free tier)
GROQ_API_KEY=your_key_here        # https://console.groq.com/keys        (optional, free tier)
```

- **Do not** prefix these with `NEXT_PUBLIC_`. That prefix inlines the value into the client bundle, letting any visitor drain your free quota.
- Neither key is required: with no key the assistant uses its offline engine, which still answers from real portal data (fees, attendance, latest activity).
- `AI_RATE_LIMIT` (default `12`) caps requests per minute per visitor to protect your quota.
- Model names are overridable via `GEMINI_MODEL` / `GROQ_MODEL` if a provider deprecates the default.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (type checking enabled) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint — **currently crashes in this workspace**, see [Troubleshooting](#troubleshooting) |
| `npm run dev:direct` / `build:direct` | Invoke Next directly — useful where `npm` scripts are blocked by the PowerShell execution policy |

---

## Project structure

```
src/
  app/
    page.tsx              Dashboard (role-aware tab host)
    login/page.tsx        Login, register, Google sign-in, password reset
    api/ai/route.ts       Server-only AI proxy (Gemini + Groq, rate limited)
  components/             Navbar (profile + logout), feed, billing, AI panel, admin views
  context/
    AppContext.tsx        Shared state + Firestore sync + toast
    Providers.tsx         AppProvider > AppContext
  lib/
    firebase.ts           Auth + Firestore init (no Storage) + isFirebaseConfigured
    auth.tsx              AuthProvider guard, login/register/google/reset, role + childIds
    firestore.ts          subscribeCollection (where filters) / saveDoc / findParentUidByStudent
    receipt.ts            jsPDF receipt generation
    ai.ts                 Assistant client + offline answer engine
    utils.ts              Currency + className helpers
  data/mockData.ts        Demo seed data
firestore.rules           Deployable Firestore security rules (parent/admin split)
firebase.json             Rules paths + emulator config
.env.local.example        Environment template
```

## Demo Mode vs Firebase Mode

Everything is gated on `isFirebaseConfigured` (`src/lib/firebase.ts`), which is true only when a real `NEXT_PUBLIC_FIREBASE_API_KEY` is present.

- **Demo Mode** — session kept in `localStorage`, data from `src/data/mockData.ts`, AI answered offline. Ideal for demos and local development.
- **Firebase Mode** — Firebase Auth sessions, live Firestore data, real role lookups, live AI.

---

## Deployment notes

- Deploy to Vercel and add the same variables under **Project → Settings → Environment Variables**. `GEMINI_API_KEY` / `GROQ_API_KEY` must stay server-side (not exposed).
- Add your production domain to **Firebase Auth → Settings → Authorized domains**.
- Receipts are generated client-side, so no server, cron job or storage bucket is needed for them.

---

## Security assumptions & limitations

- **Guardian access hinges on `childIds`.** Parents now read their own invoices and attendance directly from Firestore — `parentUid` is stamped on new fees and the profile's `childIds` array is the fallback link — but only once staff have populated `childIds`. An account with no linked child deliberately sees nothing. Keeping that link a staff-console action is a security choice: self-service enrolment would let anyone read a stranger's child until you add verification (an invite code or staff approval).
- **Payment flows are simulated.** No money moves and there is no real FPX gateway — integrate a provider (Curlec, iPay89, Billplz) plus a Cloud Function webhook before going live. Until then, the self-service `status`/`transactionId` write in the `invoices` rules is a convenience, not a settlement record; a real gateway must confirm payment server-side.
- **Chat and pickups are still local state.** `sendMessage`, `addPickupPerson` and `addAnnouncement` update the UI only and are not mirrored to Firestore, so they reset on reload.
- **The AI context payload is small by design.** Do not add extra personal data about children to `AssistantContext` beyond what a teacher already shares in-app.

---

## Troubleshooting

| Symptom | Cause & fix |
| --- | --- |
| `Missing or insufficient permissions` in the console | Rules were never deployed, or the signed-in user has no `users/{uid}` document. Run `firebase deploy --only firestore:rules` and create the profile document with a `role`. |
| Parent signs in, but Billing/Attendance is empty | `users/{uid}.childIds` is missing or empty, so the scoped query has nothing to match. Add the student ids in the Firestore console (see [Linking a parent to their child](#linking-a-parent-to-their-child)). |
| Parent's payment does not stick | That invoice has neither `parentUid` nor a `childIds` link, so `ownsDocument()` denies the write. Set `childIds` on the guardian profile, or add `parentUid` to the invoice document. |
| Signed in but stuck on the parent view | Your `users/{uid}.role` is not `"admin"`. Set it in the Firestore console — the client cannot write it (see the rules above). |
| Google button does not appear | `isFirebaseConfigured` is false: `NEXT_PUBLIC_FIREBASE_API_KEY` is missing/empty, or the dev server was not restarted after editing `.env.local`. |
| Google popup fails with `auth/unauthorized-domain` | Add the host (e.g. `localhost`, your Vercel domain) under **Firebase Auth → Settings → Authorized domains**. |
| `auth/popup-blocked` / `popup-closed-by-user` | The browser blocked the OAuth popup, or it was dismissed early. Allow pop-ups for the site. |
| AI panel subtitle reads **"Enjin Pandai Luar Talian — percuma"** instead of `GEMINI (Percuma)` | No server-side key was found at `/api/ai`. Set `GEMINI_API_KEY` (or `GROQ_API_KEY`) and restart the dev server — server-only variables are read at boot, not on hot reload. Individual replies are stamped `Enjin luar talian` vs `gemini · AI langsung`. |
| `Kadar permintaan AI terlalu tinggi` | The per-IP limiter tripped. Normal under rapid testing; raise `AI_RATE_LIMIT` if needed. |
| `next lint` dies with `Failed to load plugin 'react' … Cannot find module './Call'` | Incomplete `node_modules` — `es-abstract/2024/Call.js` is missing. Repair with `npm ci` (or `npm i es-abstract@latest`). Until then `eslint.ignoreDuringBuilds` must stay `true` in `next.config.mjs`, or every build fails. |
| `Browserslist: caniuse-lite is outdated` | Harmless build warning. Clear it with `npx update-browserslist-db@latest`. |
| PowerShell refuses to run `npm` | Run `npm run dev:direct` / `npm run build:direct`, which invoke Next without going through the npm shim. |

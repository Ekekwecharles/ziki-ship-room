# Ziki Ship Room

An owner's view of Ziki. Instead of an issue list, the owner lands on one question: **is my product ready to ship?** Ziki shows only the decisions agents can't make, and the agents carry out each decision.

## Screens

- **Ship Room** (`#/`): a release verdict per platform, the decisions waiting on the owner, the factory flow, and what agents handled without the owner.
- **Decision** (`#/decision/1264`, `#/decision/1187`, `#/decision/1171`): each side of a decision in plain words, what each side actually checked, Ziki's suggestion, and choices that say what they do to the release.

Decisions are live: making one updates the platform verdicts, the counts and the "Handled" list. Every decision can be undone, and "Reset demo" in the footer starts over.

## Data

Issue totals and issue numbers come from the real Ziki Zedu workspace. Per-platform progress, timings and the 24-hour counts are sample data.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

```bash
npm install
npx vercel --prod
```

Or push this folder to GitHub and import the repo at vercel.com/new. Vercel detects Vite automatically.

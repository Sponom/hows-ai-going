# How’s AI Going? — Product Concept

> An anonymous live global map showing how everyday people around the world actually use AI — in work, study, and daily life — or why they skip it.

---

## 1. Idea & Tone

Rather than framing AI as hype or doom, **How’s AI Going?** captures the real ground-level picture of everyday adoption across countries, cities, and life domains.

- **Friendly & non-judgmental:** both heavy daily AI users and people who avoid AI entirely are represented with light, relatable copy.
- **Built for everyone:** covers not just software engineers, but everyday life, studying, creative work, trades, healthcare, retail, and home/family.

---

## 2. User Journey

1. **Explore the live map:** see global AI adoption by country and city, filter by area or use case, and compare how the world changed over the last 12 months ("World then & now").
2. **Answer in ~15 seconds (anonymous, tap-only):**
   - Step 1: How often do you use AI? (`Never`, `Sometimes`, `Often`, `Every day`)
   - Step 2: Which areas apply to you? (multi-select up to 5 across 12 areas)
   - Step 3: What do you use it for / why do you skip it? (optional multi-select)
   - Step 4: Country & optional city (auto-suggested from Cloudflare edge geo, editable)
3. **See your personal report:** a short summary comparing your answer against your country, city, and area, plus a quick link to invite friends.

---

## 3. Data Integrity & Calibration

Map coverage (how many people responded) is kept distinct from adoption rates (what share use AI), so a single vote is never presented as a country-wide statistic:

- **No data (`0` answers):** neutral dark/light fill.
- **Low data (`1` to threshold):** country stays uncolored while live city dots and exact counts remain visible.
- **Preliminary / Reliable (above thresholds):** country fills on the Viridis scale (`0%` → `100%` AI users) and joins rankings.
- **Disputed territories:** rendered neutrally with diagonal hatching and dashed borders using Natural Earth disputed-area boundaries.

Thresholds live in [`shared/config.ts`](../shared/config.ts) (`country: 25 / 150`, `city: 10 / 50`).

---

## 4. Taxonomy

### Areas (12)
1. Tech & Code
2. Design & Creative
3. Writing & Marketing
4. Office & Business
5. Studying
6. Science & Education
7. Healthcare
8. Trades & Manufacturing
9. Service & Retail
10. Freelance / Own Business
11. Home & Family
12. Hobbies & Leisure

### AI Use Cases (7)
- Polite emails & messages
- Instead of Google
- Work tasks & drafts
- Study help
- Everyday life (recipes, travel, translations)
- Advice / brainstorming
- Images, memes & fun

### Reasons for Skipping AI (5)
- Prefer thinking myself
- Don't trust it
- Don't need it
- Tired of AI hype
- Haven't had time yet

---

## 5. Privacy & Anonymity
- No accounts, emails, or cookies required.
- Client stores a random anonymous token in `localStorage` so each browser maps to one updatable answer (stored server-side only as a salted SHA-256 hash).
- Raw IP addresses are never saved (only a daily salted hash for soft anti-spam rate-limiting).
- Coordinates are rounded to `0.1°` (~11 km).

---

## 6. Future Backlog (Post-MVP)
- [ ] Complete localization for the 5 secondary languages (`es`, `pt-BR`, `de`, `ja`, `ko`).
- [ ] Auto-open mobile country card when arriving via a `?sector=XX` deep link.
- [ ] Lazy-load `world-atlas` geometry to trim initial JS bundle size.
- [ ] Invisible Cloudflare Turnstile if traffic spikes virally.
- [ ] Pre-aggregated snapshots / SQL aggregation once volume scales past ~50k answers.
- [ ] Custom domain connection and automated Cloudflare Workers Builds from GitHub.

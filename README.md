# InvenTrack

> Har bir jihoz hisobda, har bir o'zgarish tarixda.

Tashkilotdagi kompyuter va texnik vositalarni elektron hisobga olish tizimining **backend (REST API)** qismi. Jamoa: **404**.

## Imkoniyatlar

- Jihozni qo'shish, tahrirlash, ko'rish, arxivlash; avtomatik inventar raqam (`INV-2026-0001`)
- Tur, xona/bo'lim, mas'ul shaxs, texnik holat va foydalanish holati
- Ta'mirga yuborish va qaytarish qaydi (sana, sabab, ta'mirlovchi, narx, natija)
- Har bir o'zgarishning tarixi (kim, qachon, nima o'zgargan)
- Dashboard, qidiruv, filtr, sahifalash, QR-kod
- Inventarizatsiya hisoboti: Excel (.xlsx), PDF
- Rollar: Administrator, Mas'ul shaxs, Xodim
- AI yordamchi (OpenRouter orqali, faqat o'qish): `POST /api/ai/chat`
- Interaktiv API hujjati: Swagger UI (`/api-docs`)

## Texnologiyalar

| Qism | Stek |
|---|---|
| Backend | Node.js, Express, TypeScript, Prisma ORM, Zod |
| Baza | PostgreSQL (Supabase yoki lokal Docker) |
| AI | OpenRouter (OpenAI SDK orqali) |
| Xavfsizlik | JWT, bcrypt, Helmet, CORS, rate limit, rol nazorati serverda |
| Frontend / mobil | alohida reja: `docs/PLAN_FRONTEND.md`, `docs/PLAN_MOBILE.md` |

## Talablar

- Node.js 20+ va npm
- PostgreSQL bazasi (Supabase yoki Docker)

## O'rnatish va ishga tushirish

```bash
npm install
cp .env.example .env
```

`.env` da `DATABASE_URL`, `DIRECT_URL` va `JWT_SECRET` ni to'ldiring (`JWT_SECRET` kamida 32 belgi):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Jadvallarni yaratish va demo ma'lumotlarni yuklash:

```bash
npm run db:setup
```

Ishga tushirish:

```bash
npm run dev      # ishlab chiqish (tsx watch)
npm run build && npm start   # production
```

- API: http://localhost:4000/api
- Swagger UI: http://localhost:4000/api-docs
- OpenAPI JSON: http://localhost:4000/api/openapi.json

AI yordamchi uchun `.env` ga `OPENROUTER_API_KEY` (va ixtiyoriy `OPENROUTER_MODEL`) qo'shing. Kalit bo'lmasa `/ai/chat` 503 qaytaradi.

## Demo login'lar

Parol hammasi uchun `.env` dagi `SEED_PASSWORD` qiymati.

| Rol | Email |
|---|---|
| Administrator | `admin@inventrack.uz` |
| Mas'ul shaxs | `aziz@inventrack.uz`, `dilnoza@inventrack.uz` |
| Xodim | `bobur@inventrack.uz` |

Demo parolni real muhitda ishlatmang.

## Testlar va tekshiruv

Testlar **alohida** bazada ishlaydi va uni har safar tozalaydi. `.env` da `TEST_DATABASE_URL` ni asosiy bazadan farqli qilib bering.

```bash
npm test          # vitest + supertest
npm run typecheck # tip tekshiruvi
npm run check     # ikkalasi
```

## Lokal PostgreSQL (Docker)

1. `.env` ga `POSTGRES_PASSWORD=<kuchli-parol>` qo'shing
2. `docker compose up -d`
3. `.env` da `DATABASE_URL` va `DIRECT_URL` ni `postgresql://inventrack:<parol>@localhost:5432/inventrack` ga qo'ying
4. `npm run db:setup`

## Papkalar

```
src/            Express API: routes/ (HTTP), services/ (biznes mantiq), schemas.ts (Zod), middleware.ts
prisma/         schema.prisma va seed.ts
tests/          API testlari
docs/           Reja, foydalanuvchi qo'llanmasi
presentation/   Taqdimot (InvenTrack-Pitch.pptx) va uni yaratish skriptlari
```

## Xavfsizlik eslatmalari

- Parol va kalitlar kodga yozilmaydi, faqat `.env` da turadi (`.env` git'ga kirmaydi).
- Parollar bcrypt (cost 12) bilan hashlanadi; login urinishlari cheklangan (IP bo'yicha 15 daqiqada 10 ta), AI so'rovlari ham (daqiqada 15 ta).
- Foydalanuvchi roli va faolligi har so'rovda bazadan tekshiriladi. Parol almashsa, eski tokenlar bekor bo'ladi.
- Production'da `CORS_ORIGIN` ni haqiqiy domen bilan almashtiring va HTTPS ishlating.

## Ma'lum cheklovlar

- PDF hisobotda faqat lotin harflari to'g'ri chiqadi (standart shrift).
- `price` va `cost` `Float` turida; holat/rol qiymatlari bazada `String` (Zod tekshiradi).
- Eksport butun natijani xotiraga oladi; juda katta bazada sahifalash kerak bo'ladi.

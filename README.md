# InvenTrack

> Har bir jihoz hisobda, har bir o'zgarish tarixda.

Tashkilotdagi kompyuter va texnik vositalarni elektron hisobga olish web-tizimi. Jamoa: **404 Found**.

## Imkoniyatlar

- Jihozni qo'shish, tahrirlash, ko'rish, arxivlash; avtomatik inventar raqam (`INV-2026-0001`)
- Tur, xona/bo'lim, mas'ul shaxs, texnik holat va foydalanish holati
- Ta'mirga yuborish va qaytarish qaydi (sana, sabab, ta'mirlovchi, narx, natija)
- Har bir o'zgarishning tarixi (kim, qachon, nima o'zgargan) timeline ko'rinishida
- Dashboard, qidiruv, filtr, sahifalash, QR-kod
- Inventarizatsiya hisoboti: Excel (.xlsx), PDF, chop etish
- Rollar: Administrator, Mas'ul shaxs, Xodim
- Mobil qurilmada ham qulay (responsive)

## Texnologiyalar

| Qism | Stek |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Recharts |
| Backend | Node.js, Express, TypeScript, Prisma ORM, Zod |
| Baza | SQLite (standart) yoki PostgreSQL |
| Xavfsizlik | JWT, bcrypt, Helmet, CORS, login rate limit, rol nazorati serverda |

## Talablar

- Node.js 20+ (sinalgan: 24) va npm
- Docker faqat PostgreSQL ishlatmoqchi bo'lsangiz kerak

## O'rnatish va ishga tushirish

```bash
npm install
cp server/.env.example server/.env
```

`server/.env` faylida `JWT_SECRET` ni tasodifiy uzun qiymatga almashtiring:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Bazani yaratish va demo ma'lumotlarni yuklash:

```bash
npm run db:setup
```

Ishga tushirish (server va client birga):

```bash
npm run dev
```

- Web-ilova: http://localhost:5173
- API: http://localhost:4000/api

## Demo login'lar

Parol hammasi uchun `server/.env` dagi `SEED_PASSWORD` qiymati (standart: `.env.example` ga qarang).

| Rol | Email |
|---|---|
| Administrator | `admin@inventrack.uz` |
| Mas'ul shaxs | `aziz@inventrack.uz`, `dilnoza@inventrack.uz` |
| Xodim | `bobur@inventrack.uz` |

Demo parolni real muhitda ishlatmang.

## Testlar va tekshiruv

```bash
npm test                          # backend testlari (vitest + supertest)
npm run build                     # client: tip tekshiruvi + build
npm run typecheck -w server       # backend tip tekshiruvi
```

## PostgreSQL ishlatish

1. Ildiz papkada `.env` yarating: `POSTGRES_PASSWORD=<kuchli-parol>`
2. `docker compose up -d`
3. `server/prisma/schema.prisma` da `provider = "postgresql"` qiling
4. `server/.env` da `DATABASE_URL="postgresql://inventrack:<parol>@localhost:5432/inventrack"`
5. `npm run db:setup`

## Papkalar

```
client/        React ilovasi
server/        Express API, Prisma sxema, seed, testlar
docs/          Foydalanuvchi qo'llanmasi, reja
presentation/  Taqdimot (InvenTrack-Pitch.pptx) va uni yaratish skriptlari
```

## Xavfsizlik eslatmalari

- Parol va kalitlar kodga yozilmaydi, faqat `.env` da turadi (`.env` git'ga kirmaydi).
- Parollar bcrypt (cost 12) bilan hashlanadi; login urinishlari cheklangan (IP bo'yicha 15 daqiqada 10 ta).
- Foydalanuvchi roli va faolligi har so'rovda bazadan tekshiriladi.
- JWT brauzerda `localStorage` da saqlanadi (oddiy variant). Production uchun httpOnly cookie va HTTPS tavsiya etiladi.
- Production'da `CORS_ORIGIN` ni haqiqiy domen bilan almashtiring.

## Hali yo'q

- AI yordamchi (OpenRouter orqali tezkor tahlil): rejalashtirilgan, amalga oshirilmagan.
- PDF hisobotda faqat lotin harflari to'g'ri chiqadi (standart shrift).

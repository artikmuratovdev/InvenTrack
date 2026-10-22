# InvenTrack — Frontend rejasi (G'olib)

Stek: Vite + React + TypeScript + React Router. UI dizayn: Google Stitch (web va mobil bitta loyihada, bir xil uslub).
API: `/api` (qarang: [PLAN.md](PLAN.md)). Auth: JWT, token `localStorage`da, har so'rovda `Authorization: Bearer`.

## Rollar bo'yicha ko'rinish
| Rol | Ko'radi / qila oladi |
| --- | --- |
| ADMIN | hammasi, shu jumladan `/admin/*` |
| RESPONSIBLE | faqat o'z jihozlari; holat, foydalanish, izoh, ta'mir |
| EMPLOYEE | faqat ko'rish |

Menyu va tugmalar `GET /auth/me` dagi rolga qarab yashiriladi. Haqiqiy tekshiruv serverda, frontend faqat qulaylik uchun.

## Sahifalar
`/login`, `/` (dashboard), `/equipment`, `/equipment/new`, `/equipment/:id`, `/equipment/:id/edit`, `/repairs`, `/reports`, `/admin/users`, `/admin/references`.

## Bosqichlar

### 1. Dizayn (28–29-okt)
- [ ] Stitch'da web ekranlar: login, dashboard, ro'yxat, jihoz kartasi, ta'mir — 28-okt
- [ ] Jamoa bilan tasdiqlash (Nurmuhammad, Sanobar), ranglar va shriftlarni qotirish — 29-okt
- [ ] Stitch'dan kod/HTML eksport → React komponentlarga moslashtirish tartibini belgilash — 1-noy

### 2. Skelet (1–8-noy)
- [ ] Vite + React + routing + UI kutubxona — 1-noy
- [ ] `lib/api.ts`: fetch o'rami, token qo'shish, 401 bo'lsa login'ga qaytarish, xato xabarlari
- [ ] Login sahifasi, token saqlash, himoyalangan marshrutlar — 6-noy (backend auth 1-noyda tayyor bo'ladi)
- [ ] Umumiy layout: sidebar, header, rolga qarab menyu — 8-noy

### 3. Jihozlar (9–22-noy)
- [ ] Ro'yxat: qidiruv, filtr (holat, xona, tur), sahifalash — 15-noy
- [ ] Qo'shish / tahrirlash formasi (rolga qarab maydonlar bloklanadi) — 18-noy
- [ ] Jihoz kartasi + o'zgarishlar tarixi + QR — 20-noy
- [ ] Ta'mir sahifasi: jo'natish / qaytarish — 22-noy

### 4. Hisobot va admin (23–28-noy)
- [ ] Dashboard: grafiklar (holat bo'yicha, foydalanish bo'yicha), statistika — 25-noy
- [ ] Foydalanuvchilar va ma'lumotnomalar (ADMIN) — 27-noy
- [ ] Excel / PDF yuklab olish tugmalari — 28-noy
- [ ] AI yordamchi chat oynasi (`POST /api/ai/chat`) — 28-noy

### 5. Sayqal va topshirish (30-noy – 5-dek)
- [ ] Xatolar, yuklanish va bo'sh holatlar, mobil moslashuv — 30-noy
- [ ] Production deploy (frontend), `VITE_API_URL` — 1-dek
- [ ] Integratsiya xatolarini tuzatish — 2–5-dek
- [ ] Skrinshotlar hisobot va taqdimot uchun — 3-dek

## Backend bilan bog'liqlik
| Frontend vazifasi | Backend tayyor bo'lishi kerak |
| --- | --- |
| Login | Auth — 1-noy |
| Jihozlar ro'yxati | CRUD + qidiruv — 11-noy |
| Jihoz kartasi / tarix | Tarix — 13-noy |
| Ta'mir | Ta'mir moduli — 16-noy |
| Dashboard, eksport | Hisobotlar — 23-noy |
| AI chat | `/api/ai/chat` — 27-noy |

Backend kechiksa, frontend API shartnomasi (28-okt) bo'yicha mock javoblar bilan davom etadi.

## Xavflar
- Login API kechiksa, hamma narsa to'xtaydi. Shuning uchun layout va komponentlar mock bilan quriladi.
- 2-dekdan keyin yangi funksiya yo'q (feature freeze), faqat xato tuzatish.

## Tayyor mezoni
Har bir sahifa uchun: 3 ta rolda tekshirilgan, xato va bo'sh holat ko'rsatiladi, telefon kengligida ishlaydi.

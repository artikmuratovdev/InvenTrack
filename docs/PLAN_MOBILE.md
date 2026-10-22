# InvenTrack — Mobile rejasi (Sanobar)

Stek: React Native (Expo) yoki Flutter — 2-noyda tanlanadi. Tavsiya: Expo, chunki jamoa React/TypeScript bilan ishlaydi va `expo-camera`/`expo-barcode-scanner` QR skaner uchun tayyor.
API: web bilan bir xil `/api` (qarang: [PLAN.md](PLAN.md)). Token xavfsiz saqlashda (`expo-secure-store`).

## Maqsad
Xodim telefon bilan jihozdagi QR kodni skanerlaydi va jihoz kartasini ochadi. Asosiy oqim: **login → ro'yxat → tafsilot → QR skaner**.

## Ekranlar
| Ekran | Vazifa |
| --- | --- |
| Login | `POST /auth/login`, token saqlash |
| Jihozlar ro'yxati | `GET /equipment`, qidiruv, cheksiz sahifalash |
| Jihoz tafsiloti | `GET /equipment/:id`, `/history`, `/repairs` |
| QR skaner | kamera → jihoz id/inventar raqam → tafsilot ekrani |
| Holat o'zgartirish (ixtiyoriy) | `PATCH /equipment/:id`, `POST /equipment/:id/repairs` |

Rollar: EMPLOYEE faqat ko'radi; RESPONSIBLE o'z jihozini yangilay oladi; ADMIN hammasini. Tugmalar `GET /auth/me` rolga qarab ko'rsatiladi.

## Bosqichlar

### 1. Dizayn (28–29-okt)
- [ ] Stitch'da mobil UI: login, ro'yxat, jihoz kartasi, skaner — 29-okt
- [ ] G'olib'ning web uslubi (ranglar, shriftlar, komponentlar) bilan bir xil

### 2. Skelet (2-noy)
- [ ] Texnologiyani tanlash va loyiha skeleti, `.env` orqali API manzili
- [ ] Navigatsiya (stack + auth guard), API o'rami (token, 401 → login)

### 3. Asosiy ekranlar (6–20-noy)
- [ ] Login ekrani va token saqlash — 9-noy (backend auth 1-noyda tayyor)
- [ ] Jihozlar ro'yxati va qidiruv — 16-noy
- [ ] Jihoz tafsilot ekrani (maydonlar, tarix) — 20-noy

### 4. QR skaner (21–27-noy)
- [ ] Kamera ruxsati, skaner ekrani
- [ ] QR ichidagi qiymatni jihozga aylantirish (formatni backend `/equipment/:id/qr` bilan kelishish)
- [ ] Skanerlangan jihoz kartasini ochish, noto'g'ri QR uchun xabar — 27-noy

### 5. Ixtiyoriy va yakun (30-noy – 5-dek)
- [ ] Holat o'zgartirish yoki ta'mirga jo'natish (vaqt qolsa) — 30-noy
- [ ] APK/build tayyorlash (`eas build` yoki `flutter build apk`), real telefonda sinov — 2-dek
- [ ] Xatolarni tuzatish — 2–5-dek
- [ ] Skrinshotlar va demo video — 4-dek

## Backend bilan bog'liqlik
| Mobile vazifasi | Backend tayyor bo'lishi kerak |
| --- | --- |
| Login | Auth — 1-noy |
| Ro'yxat, qidiruv | CRUD + qidiruv — 11-noy |
| Tafsilot | Tarix — 13-noy |
| QR skaner | QR generatsiya — 24-noy |
| Telefonda sinash | Server deploy — 1-dek (oldin: bir tarmoqdagi kompyuter IP'si) |

## Xavflar
- Login API kechiksa, 6–9-noyda qotib qolinadi, shuning uchun auth birinchi.
- QR skaner eng murakkab vazifa. Kechiksa, "ro'yxat + tafsilot" bilan topshirish mumkin. Skaner o'rniga inventar raqamni qo'lda kiritish zaxira variant.
- Telefon va server bir tarmoqda bo'lishi kerak (yoki deploy qilingan manzil). `localhost` telefonda ishlamaydi.

## Tayyor mezoni
Real telefonda: login qiladi, ro'yxatdan jihozni topadi, QR skanerlab kartani ochadi. Ulanish uzilsa, tushunarli xato ko'rsatiladi.

# InvenTrack: foydalanuvchi qo'llanmasi

## 1. Kirish
Brauzerda tizim manzilini oching, email va parolni kiriting. Parol noto'g'ri bo'lsa xabar chiqadi; ketma-ket ko'p xato urinishdan keyin 15 daqiqa kutish kerak. Chiqish uchun chap menyudagi "Chiqish" tugmasini bosing.

## 2. Rollar

| Imkoniyat | Administrator | Mas'ul shaxs | Xodim |
|---|:-:|:-:|:-:|
| Jihozlarni ko'rish | hammasi | faqat o'zinikini | hammasi |
| Jihoz qo'shish, to'liq tahrirlash, arxivlash | ha | yo'q | yo'q |
| Holat, foydalanish holati, izohni yangilash | ha | o'z jihozlari | yo'q |
| Ta'mirga yuborish va qaytarish | ha | o'z jihozlari | yo'q |
| Hisobot | hammasi | o'z jihozlari | hammasi |
| Foydalanuvchilar va ma'lumotnomalar | ha | yo'q | yo'q |

## 3. Dashboard
Jami jihoz, ishlatilayotgan, ta'mirdagi va nosoz jihozlar soni; holat bo'yicha diagrammalar; oxirgi 10 o'zgarish. Inventar raqamni bossangiz jihoz kartochkasi ochiladi.

## 4. Jihozlar
- **Qidirish:** inventar raqam, nom, brend, model yoki seriya raqami bo'yicha.
- **Filtr:** tur, xona, bo'lim, texnik holat, foydalanish holati. "Arxivdagilar" belgisi arxivlanganlarni ko'rsatadi.
- Ro'yxat sahifalanadi; mobilda kartochka ko'rinishida.

### Jihoz qo'shish (Administrator)
1. "Jihozlar" → "+ Jihoz qo'shish".
2. Nomi va turini kiriting (\* belgilari majburiy), qolganlarini xohlaganingizcha.
3. "Saqlash". Inventar raqam (`INV-YYYY-NNNN`) avtomatik beriladi.

### Kartochka
Jihoz ma'lumotlari, QR-kod (inventar raqamni kodlaydi), ta'mirlar jadvali va tarix timeline'i. QR yonidagi "Chop etish" tugmasi sahifani chop etadi.

### Holatlar
- **Texnik holat:** Yangi, Yaxshi, Qoniqarli, Nosoz, Hisobdan chiqarilgan.
- **Foydalanish:** Ishlatilmoqda, Omborda, Ta'mirda, Hisobdan chiqarilgan.
- "Hisobdan chiqarilgan" tanlansa foydalanish holati ham avtomatik shunday bo'ladi.
- "Ta'mirda" holatini qo'lda qo'yib bo'lmaydi: u ta'mir qaydi orqali beriladi.

## 5. Ta'mir
1. Kartochkada "Ta'mirga yuborish": sana, sabab (majburiy), ta'mirlovchi, taxminiy narx.
2. Jihoz "Ta'mirda" holatiga o'tadi. Bir jihozda bir vaqtda faqat bitta ochiq ta'mir bo'ladi.
3. Qaytganda "Ta'mirni yakunlash": qaytgan sana, natija, yakuniy narx, keyingi holat va foydalanish.
4. "Ta'mirlar" sahifasida hozir ta'mirdagi yoki yakunlanganlar ro'yxati bor.

## 6. Tarix
Jihozdagi har bir o'zgarish (qo'shish, tahrirlash, ko'chirish, mas'ul almashishi, holat, ta'mir, arxivlash) **kim** va **qachon** bilan yoziladi. Tarixni o'zgartirib yoki o'chirib bo'lmaydi.

## 7. Hisobotlar
1. "Hisobotlar" sahifasida tur, xona, bo'lim, holat va foydalanish bo'yicha filtrlang.
2. **Excel** yoki **PDF** tugmasi tanlangan filtr bo'yicha to'liq ro'yxatni yuklaydi.
3. **Chop etish** menyu va tugmalarsiz, faqat jadvalni chiqaradi.

## 8. Administrator vazifalari
- **Foydalanuvchilar:** yangi foydalanuvchi yaratish, rolini o'zgartirish, bloklash/faollashtirish, parolni tiklash. O'zingizni bloklay yoki rolingizni tushira olmaysiz. Bloklangan foydalanuvchi darrov tizimga kira olmaydi.
- **Ma'lumotnomalar:** bo'lim, xona va jihoz turlarini qo'shish (yangi tur qo'shilsa u jihoz formasida paydo bo'ladi).

## 9. Tez-tez uchraydigan xabarlar

| Xabar | Sabab va yechim |
|---|---|
| "Email yoki parol noto'g'ri" | Ma'lumotlarni tekshiring yoki administratorga murojaat qiling |
| "Sessiya muddati tugagan, qayta kiring" | Token muddati (8 soat) tugagan: qayta kiring |
| "Bu amal uchun ruxsat yo'q" | Rolingiz bu amalni bajarishga yetmaydi |
| "Bu jihoz allaqachon ta'mirda" | Avval joriy ta'mirni yakunlang |
| "Arxivdagi jihozni tahrirlab bo'lmaydi" | Avval jihozni arxivdan tiklang (Administrator) |

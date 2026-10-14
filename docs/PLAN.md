# InvenTrack — reja (1-bosqich, tasdiqlangan)

Papkalar: `client/` (3-bosqich), `server/` (2-bosqich, tayyor), `docs/`, `presentation/`.

## Ma'lumotlar bazasi
departments, users, rooms, equipment_types, equipment, repairs, equipment_history, inventory_counters.
Holatlar qiymatlari (String, Zod bilan tekshiriladi):
- condition: NEW | GOOD | FAIR | BROKEN | WRITTEN_OFF
- usageStatus: IN_USE | IN_STORAGE | IN_REPAIR | WRITTEN_OFF
- role: ADMIN | RESPONSIBLE | EMPLOYEE

## API (`/api`)
- Auth: POST /auth/login, GET /auth/me
- Jihozlar: GET/POST /equipment, GET/PATCH /equipment/:id, POST /equipment/:id/archive|restore,
  GET /equipment/:id/history|repairs|qr, POST /equipment/:id/repairs
- Ta'mirlar: GET /repairs, PATCH /repairs/:id (qaytarish)
- Ma'lumotnoma: /departments, /rooms, /equipment-types (GET/POST/PATCH)
- Foydalanuvchilar (Admin): /users, /users/:id, /users/:id/reset-password; GET /users/options
- Hisobot: GET /reports/dashboard, /reports/inventory, /reports/inventory/export?format=xlsx|pdf

## Ruxsatlar
Admin: hammasi. Mas'ul: faqat o'z jihozlari (ko'rish, holat/foydalanish/izoh, ta'mir). Xodim: faqat ko'rish.

## Sahifalar (3-bosqich)
/login, /, /equipment, /equipment/new, /equipment/:id, /equipment/:id/edit, /repairs, /reports,
/admin/users, /admin/references.

## Keyinroq
AI yordamchi (OpenRouter, faqat o'qish asboblari) — frontenddan keyin mini-bosqich.

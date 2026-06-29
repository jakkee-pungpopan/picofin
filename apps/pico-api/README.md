# PicoFin API — ระบบสินเชื่อพิโกไฟแนนซ์ (NestJS)

> ระบบตัวอย่าง — ปล่อยกู้จาก "ทุนของผู้ประกอบการเอง" เท่านั้น **ไม่มีการรับฝากเงินจากประชาชน** (ให้สอดคล้องกับกรอบพิโกไฟแนนซ์)

## ฟีเจอร์
- ฝั่งผู้ประกอบการ: แดชบอร์ด, จัดการลูกค้า, อนุมัติ/ปฏิเสธคำขอ, ดูตารางผ่อน, บันทึกรับชำระ
- ฝั่งลูกค้า: ลงทะเบียน, ยื่นขอสินเชื่อ, ดูคำขอ/สัญญา/ตารางผ่อน
- กฎพิโกในระบบ: วงเงิน ≤ 50,000 (PICO) / 100,000 (PICO_PLUS), ดอกเบี้ย ≤ 36% (PICO) / 28% (PICO_PLUS), ผู้กู้ต้องจังหวัดเดียวกับผู้ประกอบการ
- คำนวณตารางผ่อนแบบลดต้นลดดอก (reducing balance), ตัดยอดงวดอัตโนมัติ, atomic ทุกธุรกรรม

## รัน (Docker)
```bash
docker compose -f docker-compose.pico.yml up -d --build
# API: http://localhost:3000  | docs: http://localhost:3000/api/docs
```
จากนั้นเปิด `apps/pico-web/index.html` ในเบราว์เซอร์ → ใส่ลิงก์เซิร์ฟเวอร์ `http://localhost:3000`

## รัน (local)
```bash
cd apps/pico-api
npm install
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```

## บัญชีตัวอย่าง (รหัสผ่าน Password@123)
| บทบาท | อีเมล |
|---|---|
| ผู้ประกอบการ | owner@picofin.local |
| พนักงานสินเชื่อ | staff@picofin.local |
| ลูกค้า (ผู้กู้) | somchai@picofin.local |

## ทดสอบตรรกะ (ไม่ต้องลง dependency)
```bash
npm run test:smoke   # คำนวณตารางผ่อน + กฎพิโก
```

## API หลัก
```
POST /api/auth/login            POST /api/auth/register (ลูกค้า)
GET  /api/dashboard             (ผู้ประกอบการ)
GET  /api/borrowers             POST /api/borrowers
POST /api/applications          GET /api/applications?status=PENDING   GET /api/applications/mine
POST /api/loans/applications/:id/approve     POST .../reject
GET  /api/loans   GET /api/loans/:id   GET /api/loans/mine
POST /api/loans/:loanId/payments
```

## ข้อจำกัด / หมายเหตุทางกฎหมาย
ระบบนี้เป็นซอฟต์แวร์จัดการสินเชื่อ ไม่ได้ทำให้ผู้ใช้ "มีใบอนุญาตพิโกไฟแนนซ์" โดยอัตโนมัติ
การประกอบธุรกิจจริงต้องจดทะเบียนนิติบุคคล + ขออนุญาตกับกระทรวงการคลัง (สศค.) + ปฏิบัติตามเกณฑ์ที่บังคับใช้ ณ ขณะนั้น

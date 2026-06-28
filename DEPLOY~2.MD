# เอา PicoFin ขึ้นคลาวด์ (ฉบับจับมือทำ)

> ระบบตัวอย่าง ปล่อยกู้จากทุนตัวเอง ไม่รับฝากเงินประชาชน

ภาพรวม: ระบบหลังบ้าน+ฐานข้อมูล → Render (ฟรี) | เว็บ 2 ฝั่ง → Netlify (ฟรี)
สิ่งที่คุณสมัครเอง (ผมทำแทนไม่ได้): GitHub, Render, Netlify — ฟรีทั้งหมด

## ขั้นที่ 1 — อัปโค้ดขึ้น GitHub
1. github.com → New repository → ชื่อ `picofin` → Create
2. กด "uploading an existing file"
3. แตก zip `novabank` → เข้าไปในโฟลเดอร์ → เลือกทุกอย่าง (Ctrl+A) → ลากเข้าไปวาง → Commit
   (ต้องเห็นไฟล์ `render.yaml` และโฟลเดอร์ `apps` ที่หน้า repo)

## ขั้นที่ 2 — Render: ระบบหลังบ้าน + ฐานข้อมูล
1. render.com → ล็อกอินด้วย GitHub
2. New → Blueprint → เลือก repo `picofin` → Render อ่าน `render.yaml` เอง (สร้าง picofin-db + picofin-api)
3. Apply → รอ build (~5-10 นาที)
4. คัดลอก URL ของ picofin-api เช่น `https://picofin-api.onrender.com`
5. ทดสอบ: เปิด `https://picofin-api.onrender.com/api/docs` ต้องเห็น Swagger

## ขั้นที่ 3 — Netlify: เว็บ 2 ฝั่ง
1. app.netlify.com/drop
2. ลากไฟล์ `apps/pico-web/index.html` เข้าไปวาง → ได้ลิงก์เว็บ
3. เปิดลิงก์ → ใส่ URL เซิร์ฟเวอร์จากขั้น 2 → บันทึก

## ขั้นที่ 4 — ใช้งาน
- ผู้ประกอบการ: owner@picofin.local / Password@123 → อนุมัติคำขอ → ดูตารางผ่อน → รับชำระ
- ลูกค้า: somchai@picofin.local / Password@123 หรือกด "ลงทะเบียนเป็นลูกค้า"

หมายเหตุ Render ฟรี: เซิร์ฟเวอร์หลับเมื่อไม่มีคนใช้ ครั้งแรกอาจช้า ~50 วิ / ฐานข้อมูลฟรีอายุ ~90 วัน

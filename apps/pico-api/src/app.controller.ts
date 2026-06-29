import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('สถานะระบบ') @Controller()
export class AppController {
  @Get() root() {
    return { name: 'PicoFin API', status: 'ok', docs: '/api/docs',
      notice: 'ระบบสินเชื่อพิโกไฟแนนซ์ (ตัวอย่าง) — ปล่อยกู้จากทุนตัวเอง ไม่รับฝากเงินประชาชน' };
  }
}

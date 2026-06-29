import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  root() {
    return {
      name: 'NovaBank API',
      status: 'ok',
      docs: '/api/docs',
      notice: 'This is a demo banking system. Do not use for real financial transactions.',
    };
  }
}

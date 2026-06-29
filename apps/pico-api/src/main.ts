import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

Object.defineProperty(BigInt.prototype, 'toJSON', { value: function () { return Number(this); }, configurable: true });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useBodyParser('json', { limit: '15mb' });
  app.use(helmet());
  app.setGlobalPrefix('api', { exclude: ['/'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  const cfg = new DocumentBuilder()
    .setTitle('PicoFin API — ระบบสินเชื่อพิโกไฟแนนซ์')
    .setDescription('แพลตฟอร์มสินเชื่อพิโกไฟแนนซ์ — ปล่อยกู้จากทุนตัวเองเท่านั้น ไม่รับเงินฝากจากประชาชน')
    .setVersion('0.1.0').addBearerAuth().build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, cfg));
  const port = process.env.PORT || process.env.API_PORT || 3000;
  await app.listen(port);
  new Logger('Bootstrap').log(`PicoFin API on :${port} | docs /api/docs`);
}
bootstrap();

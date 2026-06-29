import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
@Module({ imports: [JwtModule.register({})], providers: [AdminService], controllers: [AdminController] })
export class AdminModule {}

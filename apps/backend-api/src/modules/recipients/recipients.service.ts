import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecipientDto } from './dto/recipient.dto';
@Injectable()
export class RecipientsService {
  constructor(private prisma: PrismaService) {}
  list(userId: string) { return this.prisma.transferRecipient.findMany({ where: { userId }, orderBy: { isFavorite: 'desc' } }); }
  create(userId: string, dto: CreateRecipientDto) { return this.prisma.transferRecipient.create({ data: { userId, ...dto } }); }
}

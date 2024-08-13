// message.controller.ts
import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ContactDTO, MessageDTO, SendMessageDTO } from './message.model';
import { MessageService } from './message.service';
import {
  CustomerJwtAuthGuard,
  CustomerUser,
  RequestUser,
} from 'src/JwtStrategy/customer.jwt.strategy';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async getAllMessages(@RequestUser() user: CustomerUser): Promise<MessageDTO[]> {
    return await this.messageService.getAllMessages(user.customerId);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @Get('get-personal-messages')
  async getPersonalMessages(
    @RequestUser() user: CustomerUser,
    @Query('receiverId') receiverId: string,
  ): Promise<MessageDTO[]> {
    return await this.messageService.getPersonalMessages(user.customerId, receiverId);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async sendMessage(
    @Body() messageDto: SendMessageDTO,
    @RequestUser() user: CustomerUser,
  ): Promise<MessageDTO[] | undefined> {
    messageDto.senderId = user.customerId;
    const message = await this.messageService.sendMessage(messageDto);
    return message;
  }

  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @Get('contacts')
  async getContacts(@RequestUser() user: CustomerUser): Promise<ContactDTO[]> {
    return await this.messageService.getContacts(user.customerId);
  }
}

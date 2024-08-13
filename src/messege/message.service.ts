import * as sql from 'sql-bricks-postgres';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ContactDTO, MessageDTO, SendMessageDTO } from './message.model';
import { CustomerService } from 'src/customer/customer.service';
import { MessageGateway } from './message.gateway';
const puppeteer = require('puppeteer');
const fs = require('fs');

@Injectable()
export class MessageService {
  constructor(
    private readonly db: DatabaseService,
    private readonly customerService: CustomerService,
    private readonly gateway: MessageGateway,
  ) {}
  async getAllMessages(senderId: string): Promise<MessageDTO[] | undefined> {
    const query = sql
      .select(
        'm.sender_id as "senderId"',
        `jsonb_build_object(
          'customerId', s.id,
          'firstName', s.first_name,
          'lastName', s.last_name,
          'cellphone', s.cell_phone,
          'email', s.email
        ) as "sender"`,
        'm.receiver_id as "receiverId"',
        `jsonb_build_object(
          'customerId', r.id,
          'firstName', r.first_name,
          'lastName', r.last_name,
          'cellphone', r.cell_phone,
          'email', r.email
        ) as "receiver"`,
        'm.message as "content"',
        'm.created_at as "timestamp"',
      )
      .from('message as m')
      .join('customer as s')
      .on('m.sender_id', 's.id')
      .join('customer as r')
      .on('m.receiver_id', 'r.id')
      .where('m.sender_id', senderId)
      .orderBy('m.created_at');

    const result = await this.db.query(query.toParams());
    return result.rows;
  }

  async getPersonalMessages(
    senderId: string,
    receiverId: string,
  ): Promise<MessageDTO[] | undefined> {
    const query = sql
      .select(
        'm.sender_id as "senderId"',
        `jsonb_build_object(
          'customerId', s.id,
          'firstName', s.first_name,
          'lastName', s.last_name,
          'cellphone', s.cell_phone,
          'email', s.email
        ) as "sender"`,
        'm.receiver_id as "receiverId"',
        `jsonb_build_object(
          'customerId', r.id,
          'firstName', r.first_name,
          'lastName', r.last_name,
          'cellphone', r.cell_phone,
          'email', r.email
        ) as "receiver"`,
        'm.message as "content"',
        'm.created_at as "timestamp"',
      )
      .from('message as m')
      .join('customer as s')
      .on('m.sender_id', 's.id')
      .join('customer as r')
      .on('m.receiver_id', 'r.id')
      .where(
        sql.or([
          sql.and([sql.eq('m.sender_id', senderId), sql.eq('m.receiver_id', receiverId)]),
          sql.and([sql.eq('m.receiver_id', senderId), sql.eq('m.sender_id', receiverId)]),
        ]),
      )
      .orderBy('m.created_at');

    const result = await this.db.query(query.toParams());
    return result.rows;
  }

  async sendMessage(message: SendMessageDTO): Promise<MessageDTO[] | undefined> {
    const sender = await this.customerService.getCustomerById(message.senderId);
    if (!sender) {
      throw new BadRequestException('Invalid sender');
    }

    const receiver = await this.customerService.getCustomerById(message.receiverId);
    if (!receiver) {
      throw new BadRequestException('Invalid receiver');
    }

    if (!message.content) {
      throw new BadRequestException('Empty messages cannot be sent!');
    }

    const query = sql
      .insert('message', {
        sender_id: message.senderId,
        receiver_id: message.receiverId,
        message: message.content,
        created_at: sql('now()'),
      })
      .returning('*');
    const result = await this.db.query(query.toParams());

    // Emit the message via WebSocket
    this.gateway.server.to(message.receiverId).emit('receiveMessage', message);
    this.gateway.server.to(message.senderId).emit('receiveMessage', message);

    return this.getPersonalMessages(message.senderId, message.receiverId);
  }

  async getContacts(senderId: string): Promise<ContactDTO[]> {
    const query = await this.db.query({
      text: `select 
        id as "customerId",
        first_name || ' ' || last_name as "name",
        cell_phone as "cellphone",
        email
        from customer 
        where id in (select receiver_id from message where sender_id = $1) 
        or id in (select sender_id from message where receiver_id = $1)
        order by name`,
      values: [senderId],
    });
    return query.rows;
  }
}

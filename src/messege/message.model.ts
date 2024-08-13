import { CustomerDTO } from 'src/customer/customer.model';

export class MessageDTO {
  senderId: string;
  sender: CustomerDTO;
  receiverId: string;
  receiver: CustomerDTO;
  content: string;
  timestamp: Date;
}

export class SendMessageDTO {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
}

export interface ContactDTO {
  customerId: string;
  name: string;
  cellphone: string;
  email: string;
}

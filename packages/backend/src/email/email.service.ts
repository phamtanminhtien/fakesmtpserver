import { Injectable } from '@nestjs/common';
import { Email } from './email.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmailService {
  private emails: Email[] = [];

  getAllEmails(): Email[] {
    return this.emails;
  }

  getEmailById(id: string): Email | undefined {
    return this.emails.find((email) => email.id === id);
  }

  addEmail(email: Omit<Email, 'id' | 'receivedAt'>): Email {
    const newEmail: Email = {
      ...email,
      id: uuidv4(),
      receivedAt: new Date(),
    };
    this.emails.push(newEmail);
    return newEmail;
  }

  deleteAllEmails(): void {
    this.emails = [];
  }

  deleteEmailById(id: string): boolean {
    const initialLength = this.emails.length;
    this.emails = this.emails.filter((email) => email.id !== id);
    return this.emails.length !== initialLength;
  }
}

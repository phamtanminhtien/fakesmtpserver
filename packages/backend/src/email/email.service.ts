import { Injectable } from '@nestjs/common';
import { Email } from './email.model';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private emails: Email[] = [];
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly emailsFilePath = path.join(this.dataDir, 'emails.json');

  constructor() {
    this.ensureDataDirExists();
    this.loadEmailsFromFile();
  }

  private ensureDataDirExists(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private loadEmailsFromFile(): void {
    try {
      if (fs.existsSync(this.emailsFilePath)) {
        const data = fs.readFileSync(this.emailsFilePath, 'utf8');
        const parsedData = JSON.parse(data) as Array<
          Omit<Email, 'receivedAt'> & { receivedAt: string }
        >;
        // Convert receivedAt strings back to Date objects
        this.emails = parsedData.map((email) => ({
          ...email,
          receivedAt: new Date(email.receivedAt),
        }));
      }
    } catch (error) {
      console.error('Error loading emails from file:', error);
      this.emails = [];
    }
  }

  private saveEmailsToFile(): void {
    try {
      fs.writeFileSync(
        this.emailsFilePath,
        JSON.stringify(this.emails, null, 2),
      );
    } catch (error) {
      console.error('Error saving emails to file:', error);
    }
  }

  getAllEmails(): Email[] {
    return this.emails.sort(
      (a, b) => b.receivedAt.getTime() - a.receivedAt.getTime(),
    );
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
    this.saveEmailsToFile();
    return newEmail;
  }

  deleteAllEmails(): void {
    this.emails = [];
    this.saveEmailsToFile();
  }

  deleteEmailById(id: string): boolean {
    const initialLength = this.emails.length;
    this.emails = this.emails.filter((email) => email.id !== id);
    const deleted = this.emails.length !== initialLength;
    if (deleted) {
      this.saveEmailsToFile();
    }
    return deleted;
  }
}

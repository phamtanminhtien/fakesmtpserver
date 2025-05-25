import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SMTPServer, SMTPServerOptions } from 'smtp-server';
import { simpleParser, ParsedMail } from 'mailparser';
import { EmailService } from '../email/email.service';
import { TlsService } from '../tls/tls.service';
import { Readable } from 'stream';
import * as os from 'os';

@Injectable()
export class SmtpService implements OnModuleInit, OnModuleDestroy {
  private server: SMTPServer;
  private readonly logger = new Logger(SmtpService.name);
  private readonly smtpPort: number;
  private readonly fakeUsername: string | undefined;
  private readonly fakePassword: string | undefined;

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly tlsService: TlsService,
  ) {
    this.smtpPort = parseInt(
      this.configService.get<string>('SMTP_PORT', '2525'),
      10,
    );
    this.fakeUsername = this.configService.get<string>('SMTP_FAKE_USER');
    this.fakePassword = this.configService.get<string>('SMTP_FAKE_PASS');

    this.initializeServer();
  }

  private initializeServer() {
    const hasAuth = !!(this.fakeUsername && this.fakePassword);
    const tlsCert = this.tlsService.getCertificateFiles();

    const options: SMTPServerOptions = {
      secure: false, // We'll use STARTTLS instead of implicit TLS
      authOptional: true,
      disabledCommands: hasAuth ? [] : ['AUTH'],
      onAuth: hasAuth
        ? (this.handleAuth.bind(this) as SMTPServerOptions['onAuth'])
        : undefined,
      onData: this.handleEmailData.bind(this) as SMTPServerOptions['onData'],
    };

    // Add TLS support if certificate is available
    if (tlsCert) {
      options.secure = false; // Start with non-secure, allow STARTTLS
      options.key = tlsCert.key;
      options.cert = tlsCert.cert;
      this.logger.log('SMTP Server configured with TLS certificate');
    } else {
      this.logger.log(
        'SMTP Server running without TLS (certificate not available)',
      );
    }

    this.server = new SMTPServer(options);

    if (hasAuth) {
      this.logger.log(`SMTP Authentication enabled with fake credentials`);
    } else {
      this.logger.log(`SMTP Authentication disabled`);
    }
  }

  // Restart the server with new TLS configuration
  async restartWithTLS(): Promise<void> {
    this.logger.log('Restarting SMTP server with new TLS configuration...');

    // Stop current server
    await new Promise<void>((resolve) => {
      this.server.close(() => {
        this.logger.log('SMTP Server stopped for TLS reconfiguration');
        resolve();
      });
    });

    // Reinitialize with new TLS settings
    this.initializeServer();

    // Start server again
    this.startServer();
  }

  private handleAuth(
    auth: {
      username: string;
      password: string;
      method: string;
    },
    session: unknown,
    callback: (err: Error | null, response?: { user: string }) => void,
  ) {
    const username = auth.username;
    const password = auth.password;

    if (username === this.fakeUsername && password === this.fakePassword) {
      this.logger.log(`SMTP Authentication successful for user: ${username}`);
      return callback(null, { user: username });
    }

    this.logger.warn(`SMTP Authentication failed for user: ${username}`);
    return callback(new Error('Invalid username or password'));
  }

  // Get connection information for the SMTP server
  getConnectionInfo() {
    const hostname =
      this.configService.get<string>('SMTP_HOST') || this.getHostname();
    const hasAuth = !!(this.fakeUsername && this.fakePassword);
    const hasTLS = !!this.tlsService.getCertificateFiles();

    return {
      port: this.smtpPort,
      host: hostname,
      secure: false, // Always false as we use STARTTLS
      tls: hasTLS,
      requiresAuth: hasAuth,
      auth: hasAuth
        ? {
            user: this.fakeUsername,
            pass: this.fakePassword,
          }
        : undefined,
    };
  }

  private getHostname(): string {
    // Try to get the local IP address for better usability
    try {
      const networkInterfaces = os.networkInterfaces();
      // Find the first non-internal IPv4 address
      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        if (interfaces) {
          for (const iface of interfaces) {
            if (iface.family === 'IPv4' && !iface.internal) {
              return iface.address;
            }
          }
        }
      }
    } catch (error) {
      this.logger.warn(
        `Failed to determine network address: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }

    // Fallback to localhost
    return 'localhost';
  }

  onModuleInit() {
    this.startServer();
  }

  onModuleDestroy() {
    this.stopServer();
  }

  private startServer() {
    this.server.listen(this.smtpPort, () => {
      this.logger.log(`SMTP Server running on port ${this.smtpPort}`);
    });

    this.server.on('error', (err) => {
      this.logger.error(`SMTP Server error: ${err.message}`);
    });
  }

  private stopServer() {
    this.server.close(() => {
      this.logger.log('SMTP Server stopped');
    });
  }

  private async handleEmailData(
    stream: Readable,
    session: unknown,
    callback: (err?: Error) => void,
  ) {
    try {
      const raw = await this.streamToString(stream);
      const parsedEmail = await simpleParser(raw);

      // Process recipient addresses safely
      const toAddresses = this.extractToAddresses(parsedEmail);

      const email = this.emailService.addEmail({
        from: parsedEmail.from?.text || '',
        to: toAddresses,
        subject: parsedEmail.subject || '',
        text: parsedEmail.text || '',
        html: parsedEmail.html || undefined,
        raw,
      });

      this.logger.log(`Email received: ${email.id}`);
      callback();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing email: ${errorMessage}`);
      callback(new Error('Error processing email'));
    }
  }

  private extractToAddresses(parsedEmail: ParsedMail): string[] {
    if (!parsedEmail.to) {
      return [];
    }

    // Handle both single address object and array of address objects
    if (Array.isArray(parsedEmail.to)) {
      return parsedEmail.to
        .map((addr) => addr.text || '')
        .filter((text) => text.length > 0);
    }

    // Handle single address object
    const addressText = parsedEmail.to.text || '';
    return addressText
      .split(',')
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0);
  }

  private streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      stream.on('error', reject);
    });
  }
}

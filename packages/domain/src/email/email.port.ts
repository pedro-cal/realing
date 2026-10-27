export interface PasswordResetEmailParams {
  to: string;
  resetUrl: string;
  displayName: string;
}

/**
 * Domain port for email communications (Hexagonal Architecture).
 */
export interface IEmailServicePort {
  sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<void>;
}

/**
 * In-memory mock email adapter for local dev, unit tests, and CI pipelines.
 */
export class MockEmailAdapter implements IEmailServicePort {
  public sentEmails: Array<PasswordResetEmailParams & { sentAt: string }> = [];

  async sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<void> {
    this.sentEmails.push({
      ...params,
      sentAt: new Date().toISOString(),
    });
  }

  getLastEmail(): (PasswordResetEmailParams & { sentAt: string }) | undefined {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  clear(): void {
    this.sentEmails = [];
  }
}

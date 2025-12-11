import SibApiV3Sdk from 'sib-api-v3-sdk';

class BrevoClient {
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;
  private configured: boolean;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY;
    this.configured = !!(apiKey && apiKey !== 'placeholder');

    if (this.configured) {
      const defaultClient = SibApiV3Sdk.ApiClient.instance;
      const apiKeyAuth = defaultClient.authentications['api-key'];
      apiKeyAuth.apiKey = apiKey;
      this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    } else {
      // Create dummy instance for development
      this.apiInstance = {} as SibApiV3Sdk.TransactionalEmailsApi;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    if (!this.configured) {
      console.log('📧 [DEV] Would send welcome email to:', userEmail);
      return true;
    }

    try {
      const sendSmtpEmail = {
        to: [{ email: userEmail, name: userName }],
        sender: { email: 'namaste@theholycompany.com', name: 'The Holy Company' },
        subject: 'Welcome to The Holy Company 🙏',
        htmlContent: this.getWelcomeEmailTemplate(userName),
      };

      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  async sendOfferingReceipt(
    userEmail: string,
    userName: string,
    amount: number,
    deity: string,
    orderId: string
  ): Promise<boolean> {
    if (!this.configured) {
      console.log('📧 [DEV] Would send offering receipt to:', userEmail, `Amount: ₹${amount}`);
      return true;
    }

    try {
      const sendSmtpEmail = {
        to: [{ email: userEmail, name: userName }],
        sender: { email: 'namaste@theholycompany.com', name: 'The Holy Company' },
        subject: `Your offering of ₹${amount} received 🌸`,
        htmlContent: this.getOfferingReceiptTemplate(userName, amount, deity, orderId),
      };

      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      return true;
    } catch (error) {
      console.error('Failed to send offering receipt:', error);
      return false;
    }
  }

  async sendStreakReminder(
    userEmail: string,
    userName: string,
    streakCount: number
  ): Promise<boolean> {
    if (!this.configured) {
      console.log('📧 [DEV] Would send streak reminder to:', userEmail, `Streak: ${streakCount}`);
      return true;
    }

    try {
      const sendSmtpEmail = {
        to: [{ email: userEmail, name: userName }],
        sender: { email: 'namaste@theholycompany.com', name: 'The Holy Company' },
        subject: `Your ${streakCount}-day streak is ending today 🔥`,
        htmlContent: this.getStreakReminderTemplate(userName, streakCount),
      };

      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      return true;
    } catch (error) {
      console.error('Failed to send streak reminder:', error);
      return false;
    }
  }

  private getWelcomeEmailTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Crimson Text', serif; background: #FFF8E1; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
          .header { text-align: center; color: #5D4037; }
          .emoji { font-size: 48px; }
          .content { color: #3E2723; line-height: 1.6; }
          .cta { background: #FF6F00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #8D6E63; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🙏</div>
            <h1>Namaste, ${userName}!</h1>
          </div>
          <div class="content">
            <p>Welcome to The Holy Company - your spiritual companion for daily puja and devotion.</p>
            <p>We're honored to have you join our community of devotees. Here's what you can do:</p>
            <ul>
              <li>🪔 Perform virtual puja for 8 different deities</li>
              <li>🎮 Play spiritual games and earn Punya Points</li>
              <li>📖 Explore content about rituals, festivals, and traditions</li>
              <li>🔥 Build your daily streak and unlock rewards</li>
            </ul>
            <p>Start your spiritual journey today by completing your first puja!</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/home" class="cta">Begin Your First Puja</a>
          </div>
          <div class="footer">
            <p>🕉️ The Holy Company | Bridging Tradition with Technology</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getOfferingReceiptTemplate(
    userName: string,
    amount: number,
    deity: string,
    orderId: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Crimson Text', serif; background: #FFF8E1; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
          .header { text-align: center; color: #5D4037; }
          .emoji { font-size: 48px; }
          .amount { font-size: 32px; color: #D4AF37; font-weight: bold; }
          .receipt { background: #FFF8E1; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .receipt-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .footer { text-align: center; color: #8D6E63; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🌸</div>
            <h1>Your Offering Received</h1>
            <div class="amount">₹${amount}</div>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>Your offering has been graciously received. May ${deity} bless you with prosperity and peace.</p>
            <div class="receipt">
              <div class="receipt-row">
                <strong>Order ID:</strong>
                <span>${orderId}</span>
              </div>
              <div class="receipt-row">
                <strong>Amount:</strong>
                <span>₹${amount}</span>
              </div>
              <div class="receipt-row">
                <strong>Deity:</strong>
                <span>${deity}</span>
              </div>
              <div class="receipt-row">
                <strong>Date:</strong>
                <span>${new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>
            <p>Your blessing PDF and premium wallpaper have been unlocked in your account.</p>
          </div>
          <div class="footer">
            <p>🕉️ The Holy Company | Thank you for your devotion</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getStreakReminderTemplate(userName: string, streakCount: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Crimson Text', serif; background: #FFF8E1; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
          .header { text-align: center; color: #5D4037; }
          .emoji { font-size: 48px; }
          .streak { font-size: 48px; color: #FF6F00; font-weight: bold; }
          .cta { background: #FF6F00; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #8D6E63; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🔥</div>
            <h1>Don't Break Your Streak!</h1>
            <div class="streak">${streakCount} Days</div>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>You've maintained an incredible ${streakCount}-day puja streak! This is a testament to your dedication and devotion.</p>
            <p>Complete today's puja to keep your streak alive and continue earning bonus Punya Points.</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/home" class="cta">Complete Today's Puja</a>
            <p><em>Time is running out for today! 🙏</em></p>
          </div>
          <div class="footer">
            <p>🕉️ The Holy Company | Your deity is waiting</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  isConfigured(): boolean {
    return this.configured;
  }
}

// Singleton instance
export const brevoClient = new BrevoClient();

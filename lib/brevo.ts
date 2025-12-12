class BrevoClient {
  private configured: boolean;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY;
    this.configured = !!(apiKey && apiKey !== 'placeholder');
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    console.log('📧 [DEV] Would send welcome email to:', userEmail);
    return true;
  }

  async sendOfferingReceipt(
    userEmail: string,
    userName: string,
    amount: number,
    deity: string,
    orderId: string
  ): Promise<boolean> {
    console.log('📧 [DEV] Would send offering receipt to:', userEmail, `Amount: ₹${amount}`);
    return true;
  }

  async sendStreakReminder(
    userEmail: string,
    userName: string,
    streakCount: number
  ): Promise<boolean> {
    console.log('📧 [DEV] Would send streak reminder to:', userEmail, `Streak: ${streakCount}`);
    return true;
  }


  isConfigured(): boolean {
    return this.configured;
  }
}

// Singleton instance
export const brevoClient = new BrevoClient();

// Convenience function for API routes
export async function sendEmail(
  userEmail: string,
  subject: string,
  content: string,
  type?: string
): Promise<boolean> {
  console.log('📧 [DEV] Would send email to:', userEmail, 'Subject:', subject);
  return true;
}

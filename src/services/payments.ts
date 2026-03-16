import axios from 'axios';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export const PaymentService = {
  /**
   * Initializes a transaction for advertiser deposits
   */
  async initializeTransaction(email: string, amount: number, metadata: any) {
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email,
      amount: amount * 100, // Paystack uses kobo
      metadata,
      callback_url: `${process.env.APP_URL}/api/payments/callback`
    }, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  },

  /**
   * Verifies a transaction status
   */
  async verifyTransaction(reference: string) {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`
      }
    });
    return response.data;
  },

  /**
   * Processes a transfer (withdrawal) to a driver's bank account
   */
  async processWithdrawal(amount: number, recipientCode: string, reason: string) {
    const response = await axios.post('https://api.paystack.co/transfer', {
      source: 'balance',
      amount: amount * 100,
      recipient: recipientCode,
      reason
    }, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`
      }
    });
    return response.data;
  }
};

import { BaseService } from '../../../services/baseService.js';
import { PaymentRepository } from '../repositories/paymentRepository.js';
import Appointment from '../../appointments/models/appointmentModel.js';

/**
 * Payment Service
 * Contains business logic for payment operations
 */
export class PaymentService extends BaseService {
  constructor() {
    super(new PaymentRepository());
  }

  /**
   * Get payment history
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async getPaymentHistory(filters = {}, pagination = {}) {
    const { userId, role, status } = filters;

    let query = {};

    if (role === 'patient') {
      query.patientId = userId;
    } else if (role === 'doctor') {
      query.doctorId = userId;
    }

    if (status) {
      query.status = status;
    }

    const options = {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      sort: pagination.sort || '-createdAt',
      populate: [
        { path: 'patientId', select: 'name email' },
        { path: 'doctorId', select: 'name email' },
        { path: 'appointmentId' }
      ]
    };

    return this.repository.findAll(query, options);
  }

  /**
   * Get payment by ID
   * @param {String} id - Payment ID
   * @returns {Promise<Object>}
   */
  async getPaymentById(id) {
    return this.getById(id, {
      populate: [
        { path: 'patientId', select: 'name email phone' },
        { path: 'doctorId', select: 'name email' },
        { path: 'appointmentId' }
      ]
    });
  }

  /**
   * Create payment intent (Stripe)
   * @param {String} appointmentId - Appointment ID
   * @param {Number} amount - Payment amount
   * @returns {Promise<Object>}
   */
  async createPaymentIntent(appointmentId, amount) {
    // Get appointment details
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId', 'consultationFee');

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Create payment record
    const payment = await this.create({
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      amount: amount || appointment.doctorId.consultationFee || 0,
      currency: 'NPR',
      paymentMethod: 'stripe',
      status: 'pending'
    });

    // TODO: Integrate with Stripe API to create payment intent
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({...});

    return {
      payment,
      clientSecret: 'mock_client_secret_' + payment._id // Replace with actual Stripe client secret
    };
  }

  /**
   * Confirm payment
   * @param {String} paymentIntentId - Payment Intent ID
   * @param {String} paymentMethodId - Payment Method ID
   * @returns {Promise<Object>}
   */
  async confirmPayment(paymentIntentId, paymentMethodId) {
    // Find payment by payment intent ID
    const payment = await this.repository.findByPaymentIntentId(paymentIntentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // TODO: Integrate with Stripe API to confirm payment
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {...});

    // Update payment status
    return this.repository.updateStatus(payment._id, 'completed', {
      transactionId: paymentIntentId,
      receiptUrl: 'mock_receipt_url' // Replace with actual receipt URL
    });
  }

  /**
   * Handle eSewa callback
   * @param {Object} callbackData - eSewa callback data
   * @returns {Promise<Object>}
   */
  async handleEsewaCallback(callbackData) {
    // TODO: Verify eSewa signature and process callback
    // This would typically verify the transaction and update payment status

    const payment = await this.repository.findByTransactionId(callbackData.transactionId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update payment status based on callback
    return this.repository.updateStatus(payment._id, 'completed', {
      esewaTransactionId: callbackData.transactionId,
      receiptUrl: callbackData.receiptUrl
    });
  }

  /**
   * Refund payment
   * @param {String} paymentId - Payment ID
   * @param {Number} refundAmount - Refund amount (optional, defaults to full amount)
   * @param {String} reason - Refund reason
   * @returns {Promise<Object>}
   */
  async refundPayment(paymentId, refundAmount, reason) {
    const payment = await this.getById(paymentId);

    if (payment.status !== 'completed') {
      throw new Error('Only completed payments can be refunded');
    }

    const amount = refundAmount || payment.amount;

    if (amount > payment.amount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    // TODO: Integrate with payment gateway API for refund
    // For Stripe: stripe.refunds.create({...})
    // For eSewa: eSewa API refund call

    return this.repository.refund(paymentId, amount, reason);
  }
}

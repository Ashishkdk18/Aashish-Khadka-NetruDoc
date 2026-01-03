import { PaymentService } from '../services/paymentService.js';
import { successResponse, errorResponse, RESPONSE_MESSAGES } from '../../../utils/response.js';

const paymentService = new PaymentService();

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;

    const result = await paymentService.createPaymentIntent(appointmentId, amount);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.PAYMENT_INTENT_CREATED, result));
  } catch (error) {
    console.error(error);
    if (error.message === 'Appointment not found') {
      return res.status(404).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to create payment intent'));
  }
};

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    const payment = await paymentService.confirmPayment(paymentIntentId, paymentMethodId);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.PAYMENT_CONFIRMED, { payment }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Payment not found') {
      return res.status(404).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to confirm payment'));
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res) => {
  try {
    const filters = {
      userId: req.user._id,
      role: req.user.role,
      status: req.query.status
    };

    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sort: req.query.sort || '-createdAt'
    };

    const result = await paymentService.getPaymentHistory(filters, pagination);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.PAYMENT_HISTORY_FETCHED, result));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorResponse('Failed to fetch payment history'));
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.PAYMENT_FETCHED, { payment }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Payment not found'));
    }
    res.status(500).json(errorResponse('Failed to fetch payment'));
  }
};

// @desc    Refund payment
// @route   POST /api/payments/:id/refund
// @access  Private (Admin/Doctor)
export const refundPayment = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const payment = await paymentService.refundPayment(req.params.id, amount, reason);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.PAYMENT_REFUNDED, { payment }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Payment not found'));
    }
    if (error.message.includes('can be refunded') || error.message.includes('cannot exceed')) {
      return res.status(400).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to refund payment'));
  }
};

// @desc    Handle eSewa callback
// @route   POST /api/payments/esewa/callback
// @access  Public (eSewa webhook)
export const handleEsewaCallback = async (req, res) => {
  try {
    const payment = await paymentService.handleEsewaCallback(req.body);

    res.status(200).json(successResponse('eSewa callback handled successfully', { payment }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Payment not found') {
      return res.status(404).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to handle eSewa callback'));
  }
};
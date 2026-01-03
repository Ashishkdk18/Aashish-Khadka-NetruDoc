import express from 'express';
import { protect } from '../../middleware/auth.js';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPayment,
  refundPayment,
  handleEsewaCallback
} from './controllers/paymentController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmPayment);
router.get('/history', getPaymentHistory);
router.get('/:id', getPayment);
router.post('/:id/refund', refundPayment);

// eSewa callback (public route for payment gateway)
router.post('/esewa/callback', handleEsewaCallback);

export default router;

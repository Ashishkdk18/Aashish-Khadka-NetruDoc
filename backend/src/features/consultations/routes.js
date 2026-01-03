import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getConsultations,
  getConsultation,
  startConsultation,
  endConsultation,
  updateConsultationNotes,
  uploadConsultationMedia
} from './controllers/consultationController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.get('/', getConsultations);
router.get('/:id', getConsultation);
router.post('/:appointmentId/start', authorize('doctor'), startConsultation);
router.put('/:id/end', authorize('doctor'), endConsultation);
router.put('/:id/notes', authorize('doctor'), updateConsultationNotes);
router.post('/:id/media', authorize('doctor'), uploadConsultationMedia);

export default router;

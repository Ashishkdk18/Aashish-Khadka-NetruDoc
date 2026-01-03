import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getDoctors,
  getPatients,
  activateUser,
  deactivateUser
} from './controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.get('/doctors', getDoctors);
router.get('/patients', authorize('admin'), getPatients);

// Routes accessible by all authenticated users
router.get('/:id', getUser);

// Admin only routes for user management
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.put('/:id/activate', authorize('admin'), activateUser);
router.put('/:id/deactivate', authorize('admin'), deactivateUser);

export default router;

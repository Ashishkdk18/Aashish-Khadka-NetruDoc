import { AppointmentService } from '../services/appointmentService.js';
import { successResponse, errorResponse, RESPONSE_MESSAGES } from '../../../utils/response.js';

const appointmentService = new AppointmentService();

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    const filters = {
      userId: req.user._id,
      role: req.user.role,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sort: req.query.sort || '-date'
    };

    const result = await appointmentService.getAppointments(filters, pagination);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.APPOINTMENTS_FETCHED, result));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorResponse('Failed to fetch appointments'));
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.APPOINTMENT_FETCHED, { appointment }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Appointment not found'));
    }
    res.status(500).json(errorResponse('Failed to fetch appointment'));
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      patientId: req.user.role === 'patient' ? req.user._id : req.body.patientId
    };

    const appointment = await appointmentService.createAppointment(appointmentData);

    res.status(201).json(successResponse(RESPONSE_MESSAGES.APPOINTMENT_CREATED, { appointment }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Time slot is already booked') {
      return res.status(400).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to create appointment'));
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.APPOINTMENT_UPDATED, { appointment }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Appointment not found'));
    }
    if (error.message === 'Time slot is already booked') {
      return res.status(400).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to update appointment'));
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin only)
export const deleteAppointment = async (req, res) => {
  try {
    await appointmentService.delete(req.params.id);

    res.status(200).json(successResponse('Appointment deleted successfully'));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Appointment not found'));
    }
    res.status(500).json(errorResponse('Failed to delete appointment'));
  }
};

// @desc    Get available slots
// @route   GET /api/appointments/available-slots/:doctorId
// @access  Private
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const date = req.query.date ? new Date(req.query.date) : new Date();

    const slots = await appointmentService.getAvailableSlots(doctorId, date);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.SLOTS_FETCHED, { slots }));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorResponse('Failed to fetch available slots'));
  }
};

// @desc    Confirm appointment
// @route   PUT /api/appointments/:id/confirm
// @access  Private (Doctor only)
export const confirmAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.confirmAppointment(req.params.id);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.APPOINTMENT_CONFIRMED, { appointment }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Appointment not found'));
    }
    if (error.message === 'Only pending appointments can be confirmed') {
      return res.status(400).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to confirm appointment'));
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.cancelAppointment(
      req.params.id,
      req.user._id,
      req.body.reason
    );

    res.status(200).json(successResponse(RESPONSE_MESSAGES.APPOINTMENT_CANCELLED, { appointment }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Appointment not found'));
    }
    if (error.message.includes('already cancelled') || error.message.includes('Cannot cancel')) {
      return res.status(400).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to cancel appointment'));
  }
};
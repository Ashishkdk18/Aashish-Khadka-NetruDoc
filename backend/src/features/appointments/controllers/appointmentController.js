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
    // Validate pre-consultation form
    if (!req.body.preConsultationForm) {
      return res.status(400).json(errorResponse('Pre-consultation form is required'));
    }

    const { preConsultationForm } = req.body;

    // Validate symptoms (at least one required)
    if (!preConsultationForm.symptoms || !Array.isArray(preConsultationForm.symptoms) || preConsultationForm.symptoms.length === 0) {
      return res.status(400).json(errorResponse('At least one symptom must be specified'));
    }

    // Validate array fields are actually arrays
    const arrayFields = ['symptoms', 'currentMedications', 'allergies'];
    for (const field of arrayFields) {
      if (preConsultationForm[field] && !Array.isArray(preConsultationForm[field])) {
        return res.status(400).json(errorResponse(`${field} must be an array`));
      }
    }

    // Validate string fields
    if (preConsultationForm.medicalHistory && typeof preConsultationForm.medicalHistory !== 'string') {
      return res.status(400).json(errorResponse('Medical history must be a string'));
    }

    if (preConsultationForm.additionalNotes && typeof preConsultationForm.additionalNotes !== 'string') {
      return res.status(400).json(errorResponse('Additional notes must be a string'));
    }

    // Validate string length limits
    if (preConsultationForm.medicalHistory && preConsultationForm.medicalHistory.length > 2000) {
      return res.status(400).json(errorResponse('Medical history cannot exceed 2000 characters'));
    }

    if (preConsultationForm.additionalNotes && preConsultationForm.additionalNotes.length > 1000) {
      return res.status(400).json(errorResponse('Additional notes cannot exceed 1000 characters'));
    }

    const appointmentData = {
      ...req.body,
      patientId: req.user.role === 'patient' ? req.user._id : req.body.patientId
    };

    const appointment = await appointmentService.createAppointment(appointmentData);

    res.status(201).json(successResponse(RESPONSE_MESSAGES.APPOINTMENT_CREATED, { appointment }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Time slot is already booked' || error.message === 'Doctor is not available at the requested time') {
      return res.status(400).json(errorResponse(error.message));
    }
    if (error.message === 'Doctor not found') {
      return res.status(404).json(errorResponse(error.message));
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

// @desc    Request reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
export const requestReschedule = async (req, res) => {
  try {
    const { newDate, newTime, reason } = req.body;

    if (!newDate || !newTime || !reason) {
      return res.status(400).json(errorResponse('New date, time, and reason are required'));
    }

    const appointment = await appointmentService.rescheduleAppointment(
      req.params.id,
      new Date(newDate),
      newTime,
      req.user._id,
      reason
    );

    res.status(200).json(successResponse('Reschedule request submitted successfully', { appointment }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Appointment not found'));
    }
    if (error.message.includes('already has') || error.message.includes('Cannot reschedule') ||
        error.message.includes('not available') || error.message.includes('already booked')) {
      return res.status(400).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to request reschedule'));
  }
};

// @desc    Approve or reject reschedule request
// @route   PUT /api/appointments/:id/handle-reschedule
// @access  Private (Doctor/Admin only)
export const handleRescheduleRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json(errorResponse('Action must be "approve" or "reject"'));
    }

    const appointment = await appointmentService.handleRescheduleRequest(
      req.params.id,
      action,
      req.user._id
    );

    const message = action === 'approve' ? 'Reschedule approved' : 'Reschedule rejected';
    res.status(200).json(successResponse(message, { appointment }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Appointment not found'));
    }
    if (error.message.includes('No pending') || error.message.includes('Invalid action')) {
      return res.status(400).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to handle reschedule request'));
  }
};

// @desc    Get doctor's schedule
// @route   GET /api/appointments/doctor/schedule
// @access  Private (Doctor only)
export const getDoctorSchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json(errorResponse('Start date and end date are required'));
    }

    const appointments = await appointmentService.getDoctorSchedule(
      req.user._id,
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json(successResponse('Doctor schedule fetched successfully', { appointments }));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorResponse('Failed to fetch doctor schedule'));
  }
};
import { BaseService } from '../../../services/baseService.js';
import { AppointmentRepository } from '../repositories/appointmentRepository.js';
import User from '../../users/models/userModel.js';

/**
 * Appointment Service
 * Contains business logic for appointment operations
 */
export class AppointmentService extends BaseService {
  constructor() {
    super(new AppointmentRepository());
  }

  /**
   * Get appointments with filters
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async getAppointments(filters = {}, pagination = {}) {
    const { userId, role, status, startDate, endDate } = filters;

    let query = {};

    // Filter by user role
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
      sort: pagination.sort || '-date',
      populate: [
        { path: 'patientId', select: 'name email phone' },
        { path: 'doctorId', select: 'name email specialization consultationFee' }
      ]
    };

    // Date range filter
    if (startDate && endDate) {
      return this.repository.findByDateRange(
        new Date(startDate),
        new Date(endDate),
        options
      );
    }

    return this.repository.findAll(query, options);
  }

  /**
   * Get appointment by ID
   * @param {String} id - Appointment ID
   * @returns {Promise<Object>}
   */
  async getAppointmentById(id) {
    return this.getById(id, {
      populate: [
        { path: 'patientId', select: 'name email phone address' },
        { path: 'doctorId', select: 'name email specialization consultationFee hospital' },
        { path: 'consultationId' },
        { path: 'prescriptionId' }
      ]
    });
  }

  /**
   * Create appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>}
   */
  async createAppointment(appointmentData) {
    // Validate doctor availability for the requested time
    const isAvailable = await this.validateDoctorAvailability(
      appointmentData.doctorId,
      appointmentData.date,
      appointmentData.time
    );

    if (!isAvailable) {
      throw new Error('Doctor is not available at the requested time');
    }

    // Check for conflicts (double booking)
    const conflict = await this.repository.findOne({
      doctorId: appointmentData.doctorId,
      date: appointmentData.date,
      time: appointmentData.time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflict) {
      throw new Error('Time slot is already booked');
    }

    return this.create(appointmentData);
  }

  /**
   * Update appointment
   * @param {String} id - Appointment ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>}
   */
  async updateAppointment(id, updateData) {
    // If date/time is being updated, validate availability and check for conflicts
    if (updateData.date || updateData.time) {
      const appointment = await this.getById(id);
      const checkDate = updateData.date || appointment.date;
      const checkTime = updateData.time || appointment.time;

      // Validate doctor availability
      const isAvailable = await this.validateDoctorAvailability(
        appointment.doctorId,
        checkDate,
        checkTime
      );

      if (!isAvailable) {
        throw new Error('Doctor is not available at the requested time');
      }

      // Check for conflicts (double booking)
      const conflict = await this.repository.findOne({
        doctorId: appointment.doctorId,
        date: checkDate,
        time: checkTime,
        status: { $in: ['pending', 'confirmed'] },
        _id: { $ne: id }
      });

      if (conflict) {
        throw new Error('Time slot is already booked');
      }
    }

    return this.update(id, updateData);
  }

  /**
   * Get available slots for a doctor
   * @param {String} doctorId - Doctor ID
   * @param {Date} date - Date to check
   * @returns {Promise<Array>}
   */
  async getAvailableSlots(doctorId, date) {
    // Get doctor to check availability schedule
    const doctor = await User.findById(doctorId).select('availability');

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Get day of week (lowercase)
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = daysOfWeek[date.getDay()];

    // Check if doctor is available on this day
    const dayAvailability = doctor.availability?.[dayOfWeek];

    if (!dayAvailability || !dayAvailability.available) {
      return []; // Doctor not available on this day
    }

    // Get booked slots
    const bookedSlots = await this.repository.getBookedSlots(doctorId, date);

    // Generate available slots based on doctor's working hours
    const availableSlots = this.generateTimeSlots(dayAvailability.start, dayAvailability.end);

    // Filter out booked slots
    return availableSlots.filter(slot => !bookedSlots.includes(slot));
  }

  /**
   * Generate time slots between start and end time
   * @param {String} startTime - Start time (HH:MM format)
   * @param {String} endTime - End time (HH:MM format)
   * @returns {Array} - Array of time slots in HH:MM format
   */
  generateTimeSlots(startTime, endTime) {
    const slots = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Generate 30-minute slots
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }

    return slots;
  }

  /**
   * Validate doctor availability for a specific date and time
   * @param {String} doctorId - Doctor ID
   * @param {Date} date - Date to check
   * @param {String} time - Time to check (HH:MM format)
   * @returns {Promise<Boolean>} - True if doctor is available at this time
   */
  async validateDoctorAvailability(doctorId, date, time) {
    try {
      // Get doctor to check availability schedule
      const doctor = await User.findById(doctorId).select('availability');

      if (!doctor) {
        return false;
      }

      // Get day of week (lowercase)
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = daysOfWeek[date.getDay()];

      // Check if doctor is available on this day
      const dayAvailability = doctor.availability?.[dayOfWeek];

      if (!dayAvailability || !dayAvailability.available) {
        return false; // Doctor not available on this day
      }

      // Check if the time falls within doctor's working hours
      const [timeHour, timeMinute] = time.split(':').map(Number);
      const [startHour, startMinute] = dayAvailability.start.split(':').map(Number);
      const [endHour, endMinute] = dayAvailability.end.split(':').map(Number);

      const timeMinutes = timeHour * 60 + timeMinute;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    } catch (error) {
      console.error('Error validating doctor availability:', error);
      return false;
    }
  }

  /**
   * Request reschedule for an appointment
   * @param {String} appointmentId - Appointment ID
   * @param {Date} newDate - New appointment date
   * @param {String} newTime - New appointment time
   * @param {String} requestedBy - User ID requesting reschedule
   * @param {String} reason - Reason for reschedule
   * @returns {Promise<Object>}
   */
  async rescheduleAppointment(appointmentId, newDate, newTime, requestedBy, reason) {
    const appointment = await this.getById(appointmentId);

    // Only pending or confirmed appointments can be rescheduled
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      throw new Error('Cannot reschedule appointment with current status');
    }

    // Check if already has a pending reschedule request
    if (appointment.rescheduleStatus === 'pending') {
      throw new Error('Appointment already has a pending reschedule request');
    }

    // Validate doctor availability for new time
    const isAvailable = await this.validateDoctorAvailability(
      appointment.doctorId,
      newDate,
      newTime
    );

    if (!isAvailable) {
      throw new Error('Doctor is not available at the requested new time');
    }

    // Check for conflicts at new time
    const conflict = await this.repository.findOne({
      doctorId: appointment.doctorId,
      date: newDate,
      time: newTime,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: appointmentId }
    });

    if (conflict) {
      throw new Error('New time slot is already booked');
    }

    // Update appointment with reschedule request
    return this.updateById(appointmentId, {
      rescheduleRequestedAt: new Date(),
      rescheduleRequestedBy: requestedBy,
      rescheduleReason: reason,
      rescheduleStatus: 'pending',
      rescheduleNewDate: newDate,
      rescheduleNewTime: newTime
    });
  }

  /**
   * Approve or reject reschedule request
   * @param {String} appointmentId - Appointment ID
   * @param {String} action - 'approve' or 'reject'
   * @param {String} approvedBy - User ID approving/rejecting
   * @returns {Promise<Object>}
   */
  async handleRescheduleRequest(appointmentId, action, approvedBy) {
    const appointment = await this.getById(appointmentId);

    if (appointment.rescheduleStatus !== 'pending') {
      throw new Error('No pending reschedule request found');
    }

    if (action === 'approve') {
      // Update appointment with new date/time and mark as approved
      return this.updateById(appointmentId, {
        date: appointment.rescheduleNewDate,
        time: appointment.rescheduleNewTime,
        rescheduleStatus: 'approved',
        rescheduleApprovedAt: new Date(),
        rescheduleApprovedBy: approvedBy
      });
    } else if (action === 'reject') {
      // Mark reschedule as rejected
      return this.updateById(appointmentId, {
        rescheduleStatus: 'rejected'
      });
    } else {
      throw new Error('Invalid action. Must be "approve" or "reject"');
    }
  }

  /**
   * Get doctor's schedule for a date range
   * @param {String} doctorId - Doctor ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>}
   */
  async getDoctorSchedule(doctorId, startDate, endDate) {
    return this.repository.findByDoctorAndDateRange(doctorId, startDate, endDate, {
      populate: [
        { path: 'patientId', select: 'name email phone' }
      ]
    });
  }

  /**
   * Confirm appointment
   * @param {String} appointmentId - Appointment ID
   * @returns {Promise<Object>}
   */
  async confirmAppointment(appointmentId) {
    const appointment = await this.getById(appointmentId);

    if (appointment.status !== 'pending') {
      throw new Error('Only pending appointments can be confirmed');
    }

    return this.repository.confirm(appointmentId);
  }

  /**
   * Cancel appointment
   * @param {String} appointmentId - Appointment ID
   * @param {String} userId - User ID who cancelled
   * @param {String} reason - Cancellation reason
   * @returns {Promise<Object>}
   */
  async cancelAppointment(appointmentId, userId, reason) {
    const appointment = await this.getById(appointmentId);

    if (appointment.status === 'cancelled') {
      throw new Error('Appointment is already cancelled');
    }

    if (appointment.status === 'completed') {
      throw new Error('Cannot cancel completed appointment');
    }

    return this.repository.cancel(appointmentId, userId, reason);
  }
}

import { BaseService } from '../../../services/baseService.js';
import { AppointmentRepository } from '../repositories/appointmentRepository.js';

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
    // Check for conflicts
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
    // If date/time is being updated, check for conflicts
    if (updateData.date || updateData.time) {
      const appointment = await this.getById(id);
      const checkDate = updateData.date || appointment.date;
      const checkTime = updateData.time || appointment.time;

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
    // Get booked slots
    const bookedSlots = await this.repository.getBookedSlots(doctorId, date);

    // Default available slots (can be customized based on doctor's availability)
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    // Filter out booked slots
    return allSlots.filter(slot => !bookedSlots.includes(slot));
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

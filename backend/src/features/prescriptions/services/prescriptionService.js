import { BaseService } from '../../../services/baseService.js';
import { PrescriptionRepository } from '../repositories/prescriptionRepository.js';

/**
 * Prescription Service
 * Contains business logic for prescription operations
 */
export class PrescriptionService extends BaseService {
  constructor() {
    super(new PrescriptionRepository());
  }

  /**
   * Get prescriptions with filters
   * @param {Object} filters - Filter criteria
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>}
   */
  async getPrescriptions(filters = {}, pagination = {}) {
    const { userId, role, patientId, doctorId } = filters;

    let query = { isActive: true };

    if (role === 'patient') {
      query.patientId = userId;
    } else if (role === 'doctor') {
      query.doctorId = userId;
    }

    if (patientId) {
      query.patientId = patientId;
    }

    if (doctorId) {
      query.doctorId = doctorId;
    }

    const options = {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      sort: pagination.sort || '-createdAt',
      populate: [
        { path: 'patientId', select: 'name email phone' },
        { path: 'doctorId', select: 'name email specialization' },
        { path: 'appointmentId' },
        { path: 'consultationId' }
      ]
    };

    return this.repository.findAll(query, options);
  }

  /**
   * Get prescription by ID
   * @param {String} id - Prescription ID
   * @returns {Promise<Object>}
   */
  async getPrescriptionById(id) {
    return this.getById(id, {
      populate: [
        { path: 'patientId', select: 'name email phone address dateOfBirth' },
        { path: 'doctorId', select: 'name email specialization licenseNumber' },
        { path: 'appointmentId' },
        { path: 'consultationId' }
      ]
    });
  }

  /**
   * Create prescription
   * @param {Object} prescriptionData - Prescription data
   * @returns {Promise<Object>}
   */
  async createPrescription(prescriptionData) {
    // Validate medications
    if (!prescriptionData.medications || prescriptionData.medications.length === 0) {
      throw new Error('At least one medication is required');
    }

    // Validate diagnoses
    if (!prescriptionData.diagnoses || prescriptionData.diagnoses.length === 0) {
      throw new Error('At least one diagnosis is required');
    }

    return this.create(prescriptionData);
  }

  /**
   * Update prescription
   * @param {String} id - Prescription ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>}
   */
  async updatePrescription(id, updateData) {
    return this.update(id, updateData);
  }

  /**
   * Delete prescription (soft delete)
   * @param {String} id - Prescription ID
   * @returns {Promise<Object>}
   */
  async deletePrescription(id) {
    return this.repository.deactivate(id);
  }

  /**
   * Get prescriptions by patient
   * @param {String} patientId - Patient ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>}
   */
  async getPrescriptionsByPatient(patientId, options = {}) {
    return this.repository.findByPatient(patientId, options);
  }

  /**
   * Get prescriptions by doctor
   * @param {String} doctorId - Doctor ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>}
   */
  async getPrescriptionsByDoctor(doctorId, options = {}) {
    return this.repository.findByDoctor(doctorId, options);
  }
}

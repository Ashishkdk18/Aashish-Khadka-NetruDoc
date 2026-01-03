import { ConsultationService } from '../services/consultationService.js';
import { successResponse, errorResponse, RESPONSE_MESSAGES } from '../../../utils/response.js';

const consultationService = new ConsultationService();

// @desc    Get consultations
// @route   GET /api/consultations
// @access  Private
export const getConsultations = async (req, res) => {
  try {
    const filters = {
      userId: req.user._id,
      role: req.user.role,
      status: req.query.status
    };

    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sort: req.query.sort || '-startTime'
    };

    const result = await consultationService.getConsultations(filters, pagination);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.CONSULTATIONS_FETCHED, result));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorResponse('Failed to fetch consultations'));
  }
};

// @desc    Get consultation by ID
// @route   GET /api/consultations/:id
// @access  Private
export const getConsultation = async (req, res) => {
  try {
    const consultation = await consultationService.getConsultationById(req.params.id);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.CONSULTATION_FETCHED, { consultation }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Consultation not found'));
    }
    res.status(500).json(errorResponse('Failed to fetch consultation'));
  }
};

// @desc    Start consultation
// @route   POST /api/consultations/:appointmentId/start
// @access  Private (Doctor only)
export const startConsultation = async (req, res) => {
  try {
    const consultation = await consultationService.startConsultation(req.params.appointmentId);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.CONSULTATION_STARTED, { consultation }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Appointment not found') {
      return res.status(404).json(errorResponse(error.message));
    }
    if (error.message.includes('must be confirmed') || error.message.includes('already active')) {
      return res.status(400).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to start consultation'));
  }
};

// @desc    End consultation
// @route   PUT /api/consultations/:id/end
// @access  Private (Doctor only)
export const endConsultation = async (req, res) => {
  try {
    const consultation = await consultationService.endConsultation(req.params.id, req.body);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.CONSULTATION_ENDED, { consultation }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Consultation not found'));
    }
    if (error.message === 'Only active consultations can be ended') {
      return res.status(400).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to end consultation'));
  }
};

// @desc    Update consultation notes
// @route   PUT /api/consultations/:id/notes
// @access  Private (Doctor only)
export const updateConsultationNotes = async (req, res) => {
  try {
    const consultation = await consultationService.updateNotes(req.params.id, req.body.notes);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.CONSULTATION_NOTES_UPDATED, { consultation }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Consultation not found'));
    }
    res.status(500).json(errorResponse('Failed to update consultation notes'));
  }
};

// @desc    Upload consultation media
// @route   POST /api/consultations/:id/media
// @access  Private (Doctor only)
export const uploadConsultationMedia = async (req, res) => {
  try {
    const mediaData = {
      url: req.body.url || req.file?.path,
      type: req.body.type || 'image',
      caption: req.body.caption
    };

    const consultation = await consultationService.uploadMedia(req.params.id, mediaData);

    res.status(200).json(successResponse('Consultation media uploaded successfully', { consultation }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('Consultation not found'));
    }
    if (error.message === 'Cannot add media to completed consultation') {
      return res.status(400).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to upload consultation media'));
  }
};
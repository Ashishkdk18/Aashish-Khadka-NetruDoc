import { UserService } from '../services/userService.js';
import { successResponse, errorResponse, paginatedSuccessResponse, RESPONSE_MESSAGES } from '../../../utils/response.js';

const userService = new UserService();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
export const getUsers = async (req, res) => {
  try {
    const filters = {};
    if (req.query.search) filters.search = req.query.search;
    if (req.query.role) filters.role = req.query.role;
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';

    const result = await userService.getUsers(filters, {
      page: req.query.page || 1,
      limit: req.query.limit || 10
    });

    res.status(200).json(paginatedSuccessResponse(
      RESPONSE_MESSAGES.USERS_FETCHED,
      result.data || [],
      result.pagination || {}
    ));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorResponse('Failed to fetch users'));
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.USER_FETCHED, { user }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('User not found'));
    }
    res.status(500).json(errorResponse('Failed to fetch user'));
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.USER_UPDATED, { user }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('User not found'));
    }
    if (error.message === 'User with this email already exists') {
      return res.status(400).json(errorResponse(error.message));
    }
    res.status(500).json(errorResponse('Failed to update user'));
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);

    res.status(200).json(successResponse(RESPONSE_MESSAGES.USER_DELETED));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('User not found'));
    }
    res.status(500).json(errorResponse('Failed to delete user'));
  }
};

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    const result = await userService.getDoctors({
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      specialization: req.query.specialization,
      search: req.query.search
    });

    res.status(200).json(paginatedSuccessResponse(
      RESPONSE_MESSAGES.DOCTORS_FETCHED,
      result.data || [],
      result.pagination || {}
    ));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorResponse('Failed to fetch doctors'));
  }
};

// @desc    Get all patients
// @route   GET /api/users/patients
// @access  Private (Admin only)
export const getPatients = async (req, res) => {
  try {
    const result = await userService.getPatients({
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      search: req.query.search
    });

    res.status(200).json(paginatedSuccessResponse(
      RESPONSE_MESSAGES.PATIENTS_FETCHED,
      result.data || [],
      result.pagination || {}
    ));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorResponse('Failed to fetch patients'));
  }
};

// @desc    Activate user account (US8)
// @route   PUT /api/users/:id/activate
// @access  Private (Admin only)
export const activateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, { isActive: true });

    res.status(200).json(successResponse('User account activated successfully', { user }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('User not found'));
    }
    res.status(500).json(errorResponse('Failed to activate user account'));
  }
};

// @desc    Deactivate user account (US8)
// @route   PUT /api/users/:id/deactivate
// @access  Private (Admin only)
export const deactivateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, { isActive: false });

    res.status(200).json(successResponse('User account deactivated successfully', { user }));
  } catch (error) {
    console.error(error);
    if (error.message === 'Resource not found') {
      return res.status(404).json(errorResponse('User not found'));
    }
    res.status(500).json(errorResponse('Failed to deactivate user account'));
  }
};
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRepository } from '../repositories/authRepository.js';
import { UserService } from '../../users/services/userService.js';
import User from '../../users/models/userModel.js';

/**
 * Auth Service
 * Contains business logic for authentication operations
 */
export class AuthService {
  constructor() {
    this.authRepository = new AuthRepository();
    this.userService = new UserService();
  }

  /**
   * Generate JWT Token
   * @param {String} userId - User ID
   * @returns {String}
   */
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'netrudoc_jwt_secret_key_2025',
      {
        expiresIn: process.env.JWT_EXPIRE || '7d',
      }
    );
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>}
   */
  async register(userData) {
    const { name, email, password, role, phone, address } = userData;

    // Check if user exists
    const userExists = await this.authRepository.emailExists(email);
    if (userExists) {
      throw new Error('User already exists');
    }

    // Prepare user data based on role
    // Note: Password will be hashed by the User model's pre('save') hook
    const userPayload = {
      name,
      email,
      password, // Pass plain password - will be hashed by pre-save hook
      role: role || 'patient',
      phone,
      address
    };

    // Add patient-specific fields (US1)
    if (role === 'patient') {
      if (userData.dateOfBirth) userPayload.dateOfBirth = userData.dateOfBirth;
      if (userData.gender) userPayload.gender = userData.gender;
      if (userData.emergencyContact) userPayload.emergencyContact = userData.emergencyContact;
      if (userData.medicalHistory) userPayload.medicalHistory = userData.medicalHistory;
    }

    // Add doctor-specific fields (US2)
    if (role === 'doctor') {
      if (!userData.licenseNumber) {
        throw new Error('License number is required for doctor registration');
      }
      if (!userData.specialization) {
        throw new Error('Specialization is required for doctor registration');
      }
      
      userPayload.licenseNumber = userData.licenseNumber;
      userPayload.specialization = userData.specialization;
      userPayload.qualifications = userData.qualifications || [];
      userPayload.experience = userData.experience || 0;
      userPayload.hospital = userData.hospital;
      userPayload.consultationFee = userData.consultationFee || 0;
      userPayload.availability = userData.availability;
      userPayload.qualificationDocuments = userData.qualificationDocuments || [];
      
      // Doctor needs admin verification
      userPayload.isVerified = false;
    }

    // Create user
    const user = await this.userService.createUser(userPayload);

    // Generate token
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        ...(role === 'doctor' && {
          specialization: user.specialization,
          licenseNumber: user.licenseNumber,
          isVerified: user.isVerified
        })
      }
    };
  }

  /**
   * Login user
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    // Find user with password
    const user = await this.authRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.authRepository.updateLastLogin(user._id);

    // Generate token
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    };
  }

  /**
   * Get current user
   * @param {String} userId - User ID
   * @returns {Promise<Object>}
   */
  async getMe(userId) {
    return this.userService.getUserById(userId);
  }

  /**
   * Update user profile
   * @param {String} userId - User ID
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, profileData) {
    const user = await this.userService.getUserById(userId);
    
    const fieldsToUpdate = {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      address: profileData.address
    };

    // Add patient-specific fields (US6)
    if (user.role === 'patient') {
      if (profileData.dateOfBirth !== undefined) fieldsToUpdate.dateOfBirth = profileData.dateOfBirth;
      if (profileData.gender !== undefined) fieldsToUpdate.gender = profileData.gender;
      if (profileData.emergencyContact !== undefined) fieldsToUpdate.emergencyContact = profileData.emergencyContact;
      if (profileData.medicalHistory !== undefined) fieldsToUpdate.medicalHistory = profileData.medicalHistory;
    }

    // Add doctor-specific fields (US6 - clinic address, etc.)
    if (user.role === 'doctor') {
      if (profileData.specialization !== undefined) fieldsToUpdate.specialization = profileData.specialization;
      if (profileData.licenseNumber !== undefined) fieldsToUpdate.licenseNumber = profileData.licenseNumber;
      if (profileData.qualifications !== undefined) fieldsToUpdate.qualifications = profileData.qualifications;
      if (profileData.experience !== undefined) fieldsToUpdate.experience = profileData.experience;
      if (profileData.hospital !== undefined) fieldsToUpdate.hospital = profileData.hospital;
      if (profileData.consultationFee !== undefined) fieldsToUpdate.consultationFee = profileData.consultationFee;
      if (profileData.availability !== undefined) fieldsToUpdate.availability = profileData.availability;
      if (profileData.qualificationDocuments !== undefined) fieldsToUpdate.qualificationDocuments = profileData.qualificationDocuments;
    }

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    return this.userService.updateUser(userId, fieldsToUpdate);
  }

  /**
   * Change password
   * @param {String} userId - User ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.authRepository.findById(userId, { select: '+password' });
    if (!user) {
      throw new Error('User not found');
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Set new password - will be hashed by pre-save hook
    user.password = newPassword;
    await user.save();

    return user;
  }

  /**
   * Forgot password (US7)
   * @param {String} email - User email
   * @returns {Promise<String>} Reset token (for testing, remove in production)
   */
  async forgotPassword(email) {
    const user = await this.authRepository.findByEmailWithPassword(email);
    if (!user) {
      // Don't reveal if user exists for security
      return null;
    }

    // Generate reset token using the model method
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    // await this.sendPasswordResetEmail(user.email, resetUrl);

    // For development/testing: return token (remove in production)
    return resetToken;
  }

  /**
   * Reset password (US7)
   * @param {String} token - Reset token
   * @param {String} newPassword - New password
   * @returns {Promise<void>}
   */
  async resetPassword(token, newPassword) {
    // Hash token to compare with stored token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Set new password and clear reset token - password will be hashed by pre-save hook
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
  }
}

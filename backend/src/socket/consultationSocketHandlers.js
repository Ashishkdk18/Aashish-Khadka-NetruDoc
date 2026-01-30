/**
 * Consultation-related Socket.IO handlers (WebRTC signaling).
 * Keeps signaling logic separate from application bootstrapping.
 *
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
import mongoose from 'mongoose';
import Appointment from '../features/appointments/models/appointmentModel.js';

const getConsultationRoomName = (appointmentId) => `consultation:appointment:${appointmentId}`;

export const registerConsultationHandlers = (io, socket) => {
  /**
   * Join a consultation room scoped by appointmentId.
   * Authorization: only appointment doctor/patient may join.
   */
  socket.on('consultation:join', async ({ appointmentId }) => {
    try {
      const userId = socket.data?.userId;
      if (!userId) {
        return socket.emit('consultation:error', {
          appointmentId,
          message: 'User not authenticated in socket context',
        });
      }

      if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
        return socket.emit('consultation:error', {
          appointmentId,
          message: 'Invalid appointmentId',
        });
      }

      const appointment = await Appointment.findById(appointmentId).select('doctorId patientId status');
      if (!appointment) {
        return socket.emit('consultation:error', {
          appointmentId,
          message: 'Appointment not found',
        });
      }

      const isMember =
        appointment.doctorId?.toString?.() === userId.toString() ||
        appointment.patientId?.toString?.() === userId.toString();

      if (!isMember) {
        return socket.emit('consultation:error', {
          appointmentId,
          message: 'User is not authorized to join this consultation',
        });
      }

      const roomName = getConsultationRoomName(appointmentId);
      socket.join(roomName);

      socket.emit('consultation:joined', { appointmentId, roomName });
    } catch (error) {
      console.error('Error in consultation:join:', error);
      socket.emit('consultation:error', {
        appointmentId,
        message: error.message || 'Failed to join consultation room',
      });
    }
  });

  socket.on('consultation:leave', ({ appointmentId }) => {
    if (!appointmentId) return;
    const roomName = getConsultationRoomName(appointmentId);
    socket.leave(roomName);
    socket.emit('consultation:left', { appointmentId, roomName });
  });

  /**
   * WebRTC signaling (room-based).
   * Payloads are forwarded to the other participant(s) in the appointment room.
   */
  socket.on('consultation:offer', ({ appointmentId, offer }) => {
    if (!appointmentId || !offer) return;
    const userId = socket.data?.userId;
    const roomName = getConsultationRoomName(appointmentId);
    socket.to(roomName).emit('consultation:offer', { appointmentId, offer, fromUserId: userId });
  });

  socket.on('consultation:answer', ({ appointmentId, answer }) => {
    if (!appointmentId || !answer) return;
    const userId = socket.data?.userId;
    const roomName = getConsultationRoomName(appointmentId);
    socket.to(roomName).emit('consultation:answer', { appointmentId, answer, fromUserId: userId });
  });

  socket.on('consultation:iceCandidate', ({ appointmentId, candidate }) => {
    if (!appointmentId || !candidate) return;
    const userId = socket.data?.userId;
    const roomName = getConsultationRoomName(appointmentId);
    socket.to(roomName).emit('consultation:iceCandidate', { appointmentId, candidate, fromUserId: userId });
  });

  /**
   * Backward-compatible legacy event names (optional).
   * These map the old target-based events to the new appointment room flow.
   */
  socket.on('videoOffer', (data) => {
    if (!data || !data.appointmentId || !data.offer) return;
    socket.emit('consultation:offer', { appointmentId: data.appointmentId, offer: data.offer });
  });

  socket.on('videoAnswer', (data) => {
    if (!data || !data.appointmentId || !data.answer) return;
    socket.emit('consultation:answer', { appointmentId: data.appointmentId, answer: data.answer });
  });

  socket.on('iceCandidate', (data) => {
    if (!data || !data.appointmentId || !data.candidate) return;
    socket.emit('consultation:iceCandidate', { appointmentId: data.appointmentId, candidate: data.candidate });
  });
};


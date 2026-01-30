import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Stack,
  Typography,
  TextField,
  Paper,
  Collapse,
  CircularProgress,
  Chip,
} from '@mui/material'
import {
  Call as CallIcon,
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Notes as NotesIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useSocket, useSocketEvent } from '../../../hooks/useSocket'
import { WebRtcClient } from '../webrtcClient'
import consultationApi from '../api/consultationApi'
import { updateNotes, setCurrentConsultation } from '../consultationSlice'
import { AppDispatch, RootState } from '../../../store/index'
import CreatePrescriptionForm from '../../prescriptions/components/CreatePrescriptionForm'

const ConsultationPage: React.FC = () => {
  const { appointmentId } = useParams()
  const { socket, emit } = useSocket()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentConsultation, updatingNotes } = useSelector((state: RootState) => state.consultations)

  const [inCall, setInCall] = useState(false)
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [notesPanelOpen, setNotesPanelOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const webrtcRef = useRef<WebRtcClient | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isDoctor = user?.role === 'doctor'

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const { iceServers } = await consultationApi.getIceConfig()
        if (cancelled) return

        webrtcRef.current = new WebRtcClient({
          iceServers,
          onLocalStream: (stream) => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream
            }
          },
          onRemoteStream: (stream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream
            }
          },
          onConnectionStateChange: (state) => {
            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
              setInCall(false)
            }
          },
        })
      } catch (e) {
        // Fall back to STUN-only defaults inside WebRtcClient
        if (cancelled) return
        webrtcRef.current = new WebRtcClient({
          onLocalStream: (stream) => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream
            }
          },
          onRemoteStream: (stream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream
            }
          },
          onConnectionStateChange: (state) => {
            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
              setInCall(false)
            }
          },
        })
      }
    })()

    return () => {
      cancelled = true
      webrtcRef.current?.stop()
    }
  }, [])

  // We use appointmentId as the consultation room key (server maps it to a room name).
  const currentAppointmentId = appointmentId

  // Load consultation data
  useEffect(() => {
    if (!currentAppointmentId) return
    const loadConsultation = async () => {
      try {
        const { consultation } = await consultationApi.getByAppointmentId(currentAppointmentId)
        if (consultation) {
          const id = consultation._id || consultation.id || null
          setConsultationId(id)
          setNotes(consultation.notes || '')
          dispatch(setCurrentConsultation(consultation))
        }
      } catch (error) {
        console.error('Failed to load consultation:', error)
      }
    }
    loadConsultation()
  }, [currentAppointmentId, dispatch])

  // Sync notes when currentConsultation changes
  useEffect(() => {
    if (currentConsultation) {
      setNotes(currentConsultation.notes || '')
      const id = currentConsultation._id || currentConsultation.id || null
      if (id) setConsultationId(id)
    }
  }, [currentConsultation])

  // Auto-save notes with debounce
  const handleNotesChange = useCallback((newNotes: string) => {
    setNotes(newNotes)
    setSaveStatus('saving')

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for auto-save (3 seconds)
    saveTimeoutRef.current = setTimeout(async () => {
      if (consultationId && isDoctor) {
        try {
          await dispatch(updateNotes({ consultationId, notes: newNotes })).unwrap()
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        } catch (error) {
          console.error('Failed to save notes:', error)
          setSaveStatus('idle')
        }
      }
    }, 3000)
  }, [consultationId, isDoctor, dispatch])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!currentAppointmentId) return
    emit('consultation:join', { appointmentId: currentAppointmentId })

    return () => {
      emit('consultation:leave', { appointmentId: currentAppointmentId })
    }
  }, [emit, currentAppointmentId])

  useEffect(() => {
    if (!webrtcRef.current) return
    // Wire ICE candidate callback to Socket.IO
    webrtcRef.current.onIceCandidate = (candidate) => {
      if (!currentAppointmentId) return
      emit('consultation:iceCandidate', { appointmentId: currentAppointmentId, candidate })
    }
  }, [emit, currentAppointmentId])

  const handleStartCall = async () => {
    if (!webrtcRef.current) return
    try {
      console.log('Starting WebRTC call...')
      const offer = await webrtcRef.current.createOffer()
      console.log('WebRTC offer created:', offer)
      if (!currentAppointmentId) return
      emit('consultation:offer', { appointmentId: currentAppointmentId, offer })
      setInCall(true)
      console.log('Call started successfully')
    } catch (error: any) {
      console.error('Failed to start call:', error)
      alert(`Failed to start call: ${error.message}`)
    }
  }

  const handleEndCall = async () => {
    await webrtcRef.current?.stop()
    setInCall(false)
  }

  useSocketEvent<{ appointmentId: string; offer: RTCSessionDescriptionInit }>('consultation:offer', async (payload) => {
    if (!webrtcRef.current || !payload?.offer) return
    if (currentAppointmentId && payload?.appointmentId && payload.appointmentId !== currentAppointmentId) return
    try {
      const answer = await webrtcRef.current.handleRemoteOffer(payload.offer)
      if (!currentAppointmentId) return
      emit('consultation:answer', { appointmentId: currentAppointmentId, answer })
      setInCall(true)
    } catch (error) {
      console.error('Failed to handle remote offer', error)
    }
  })

  useSocketEvent<{ appointmentId: string; answer: RTCSessionDescriptionInit }>('consultation:answer', async (payload) => {
    if (!webrtcRef.current || !payload?.answer) return
    if (currentAppointmentId && payload?.appointmentId && payload.appointmentId !== currentAppointmentId) return
    try {
      await webrtcRef.current.handleRemoteAnswer(payload.answer)
    } catch (error) {
      console.error('Failed to handle remote answer', error)
    }
  })

  useSocketEvent<{ appointmentId: string; candidate: RTCIceCandidateInit }>('consultation:iceCandidate', async (payload) => {
    if (!webrtcRef.current || !payload?.candidate) return
    if (currentAppointmentId && payload?.appointmentId && payload.appointmentId !== currentAppointmentId) return
    try {
      await webrtcRef.current.addIceCandidate(payload.candidate)
    } catch (error) {
      console.error('Failed to add ICE candidate', error)
    }
  })

  const toggleMic = () => {
    const localStream = webrtcRef.current?.getLocalStream()
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setMicEnabled((prev) => !prev)
    }
  }

  const toggleCamera = () => {
    const localStream = webrtcRef.current?.getLocalStream()
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setCameraEnabled((prev) => !prev)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Video Consultation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Secure video consultation using WebRTC. Both participants should be on this page for a call
        to connect.
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              position: 'relative',
              backgroundColor: 'black',
              borderRadius: 2,
              overflow: 'hidden',
              minHeight: 320,
            }}
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                width: 160,
                height: 120,
                borderRadius: 1,
                overflow: 'hidden',
                border: (theme) => `2px solid ${theme.palette.background.paper}`,
                backgroundColor: 'black',
              }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h6" gutterBottom>
                  Call Controls
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Use the controls below to start, end, or adjust your call.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} justifyContent="center" sx={{ my: 2 }}>
                {!inCall ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CallIcon />}
                    onClick={handleStartCall}
                    disabled={!socket}
                  >
                    Start Call
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CallEndIcon />}
                    onClick={handleEndCall}
                  >
                    End Call
                  </Button>
                )}
              </Stack>

              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                <IconButton
                  color={micEnabled ? 'primary' : 'default'}
                  onClick={toggleMic}
                  disabled={!inCall}
                >
                  {micEnabled ? <MicIcon /> : <MicOffIcon />}
                </IconButton>
                <IconButton
                  color={cameraEnabled ? 'primary' : 'default'}
                  onClick={toggleCamera}
                  disabled={!inCall}
                >
                  {cameraEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                </IconButton>
              </Stack>
            </Box>

            {/* Notes Panel for Doctors */}
            {isDoctor && (
              <>
                <Paper sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setNotesPanelOpen(!notesPanelOpen)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NotesIcon />
                      <Typography variant="h6">Consultation Notes</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {saveStatus === 'saving' && <CircularProgress size={16} />}
                      {saveStatus === 'saved' && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Saved"
                          size="small"
                          color="success"
                          sx={{ height: 24 }}
                        />
                      )}
                      {notesPanelOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                  </Box>
                  <Collapse in={notesPanelOpen}>
                    <TextField
                      multiline
                      rows={10}
                      maxRows={20}
                      fullWidth
                      placeholder="Enter consultation notes here..."
                      value={notes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      disabled={updatingNotes}
                      inputProps={{ maxLength: 2000 }}
                      helperText={`${notes.length}/2000 characters`}
                      sx={{ mt: 1 }}
                    />
                  </Collapse>
                </Paper>

                {/* Create Prescription Button */}
                <Paper sx={{ p: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={() => setPrescriptionDialogOpen(true)}
                  >
                    Create Prescription
                  </Button>
                </Paper>
              </>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Create Prescription Dialog */}
      {isDoctor && currentConsultation && (
        <CreatePrescriptionForm
          open={prescriptionDialogOpen}
          onClose={() => setPrescriptionDialogOpen(false)}
          patientId={
            typeof currentConsultation.patientId === 'object'
              ? currentConsultation.patientId?._id || currentConsultation.patientId?.id
              : currentConsultation.patientId
          }
          appointmentId={currentAppointmentId || undefined}
          consultationId={consultationId || undefined}
          onSuccess={() => {
            setPrescriptionDialogOpen(false)
          }}
        />
      )}
    </Container>
  )
}

export default ConsultationPage

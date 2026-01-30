export interface WebRtcClientOptions {
  onRemoteStream?: (stream: MediaStream) => void
  onLocalStream?: (stream: MediaStream) => void
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
  iceServers?: RTCIceServer[]
}

export class WebRtcClient {
  private peer: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private options: WebRtcClientOptions

  constructor(options: WebRtcClientOptions = {}) {
    this.options = options
  }

  async init(): Promise<void> {
    if (this.peer) return

    const config: RTCConfiguration = {
      iceServers:
        this.options.iceServers && this.options.iceServers.length > 0
          ? this.options.iceServers
          : [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
    }

    this.peer = new RTCPeerConnection(config)

    this.peer.onicecandidate = (event) => {
      // ICE candidates are handled externally via socket signaling
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate)
      }
    }

    this.peer.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream()
        if (this.options.onRemoteStream) {
          this.options.onRemoteStream(this.remoteStream)
        }
      }
      this.remoteStream.addTrack(event.track)
    }

    this.peer.onconnectionstatechange = () => {
      if (this.options.onConnectionStateChange && this.peer) {
        this.options.onConnectionStateChange(this.peer.connectionState)
      }
    }
  }

  // Placeholder – will be wired from outside (e.g. via Socket.IO)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public onIceCandidate: (candidate: RTCIceCandidate) => void

  async startLocalMedia(): Promise<MediaStream> {
    if (!this.localStream) {
      // Check if we're in a secure context (HTTPS required for camera access)
      if (typeof window === 'undefined') {
        throw new Error('WebRTC is only available in browser environments')
      }

      if (!window.navigator) {
        throw new Error('Browser navigator not available')
      }

      // Check for getUserMedia support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera and microphone access. Please try a modern browser like Chrome, Firefox, or Safari.')
      }

      // Check for HTTPS requirement (most browsers require HTTPS for getUserMedia)
      // Allow localhost and local network IPs for development
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname.startsWith('127.') || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.hostname.startsWith('172.') || window.location.hostname.startsWith('169.254.')
      if (window.location.protocol !== 'https:' && !isLocalhost) {
        throw new Error('Camera and microphone access requires HTTPS. Please access this page over a secure connection or use localhost.')
      }

      try {
        console.log('Requesting camera/microphone access...')
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        console.log('Camera/microphone access granted')
      } catch (error: any) {
        console.error('getUserMedia error:', error)
        // Provide user-friendly error messages for common issues
        if (error.name === 'NotAllowedError') {
          throw new Error('Camera and microphone access denied. Please allow access in your browser and try again.')
        } else if (error.name === 'NotFoundError') {
          throw new Error('No camera or microphone found. Please connect a camera and microphone.')
        } else if (error.name === 'NotReadableError') {
          throw new Error('Camera or microphone is already in use by another application.')
        } else if (error.name === 'NotSupportedError') {
          throw new Error('Your browser does not support camera and microphone access.')
        } else {
          throw new Error(`Failed to access camera/microphone: ${error.message || error.name}`)
        }
      }

      if (this.options.onLocalStream) {
        this.options.onLocalStream(this.localStream)
      }
    }

    if (this.peer && this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peer?.addTrack(track, this.localStream as MediaStream)
      })
    }

    return this.localStream
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peer) {
      await this.init()
    }
    if (!this.peer) {
      throw new Error('Failed to initialize peer connection')
    }
    await this.startLocalMedia()
    const offer = await this.peer.createOffer()
    await this.peer.setLocalDescription(offer)
    return offer
  }

  async handleRemoteOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peer) {
      await this.init()
    }
    if (!this.peer) {
      throw new Error('Failed to initialize peer connection')
    }

    await this.startLocalMedia()
    await this.peer.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await this.peer.createAnswer()
    await this.peer.setLocalDescription(answer)
    return answer
  }

  async handleRemoteAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peer) {
      await this.init()
    }
    if (!this.peer) {
      throw new Error('Failed to initialize peer connection')
    }
    await this.peer.setRemoteDescription(new RTCSessionDescription(answer))
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peer) return
    await this.peer.addIceCandidate(new RTCIceCandidate(candidate))
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  async stop(): Promise<void> {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }
    if (this.peer) {
      this.peer.close()
      this.peer = null
    }
  }
}


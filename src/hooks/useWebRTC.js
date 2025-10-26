import { useState, useRef, useCallback } from 'react'
import { API_URL } from '@config'

/**
 * Fetch ICE server configuration from backend
 * TURN server credentials are configured via environment variables on the backend
 * This ensures secure credential management
 */
async function fetchIceConfig() {
  try {
    const protocol = window.location.protocol
    const host = window.location.hostname
    const apiUrl = API_URL
    
    // Determine backend URL
    let backendUrl

    if (apiUrl) {
      backendUrl = apiUrl
    } else if (host === 'localhost' || host === '127.0.0.1') {
      backendUrl = `${protocol}//${host}:8000`
    } 
    
    const response = await fetch(`${backendUrl}/api/ice-config`)
    if (!response.ok) {
      throw new Error('Failed to fetch ICE configuration')
    }
    
    const config = await response.json()
    return config
  } catch (error) {
    console.error('Error fetching ICE config:', error)
    
    // Fallback to STUN-only configuration for development
    return {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    }
  }
}

export function useWebRTC(roomId, userData) {
  const [participants, setParticipants] = useState([])
  const [streams, setStreams] = useState({})
  const [speakingUsers, setSpeakingUsers] = useState(new Set())
  
  const wsRef = useRef(null)
  const localStreamRef = useRef(null)
  const peerConnectionsRef = useRef({})
  const audioContextRef = useRef(null)
  const analyserNodesRef = useRef({})
  const iceConfigRef = useRef(null)

  // Get WebSocket URL based on environment
  const getWebSocketUrl = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.hostname
    const apiUrl = API_URL
    
    // In development, backend runs on port 8000
    // In production on Replit, use the same domain
    if (apiUrl) {
      return apiUrl
    }
    else if (host === 'localhost' || host === '127.0.0.1') {
      return `${protocol}//${host}:8000/ws/${roomId}/${userData.id}`
    }
    
    // For Replit production, backend should be accessible on same domain, port 8000
    return `${protocol}//${host}:8000/ws/${roomId}/${userData.id}`
  }

  // Initialize audio analysis for speaking detection
  const setupAudioAnalysis = useCallback((stream, userId) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }

    const audioContext = audioContextRef.current
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.8

    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)

    analyserNodesRef.current[userId] = analyser

    // Start monitoring audio levels
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const checkAudioLevel = () => {
      if (!analyserNodesRef.current[userId]) return

      analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / bufferLength

      // Threshold for speaking detection
      const isSpeaking = average > 15

      setSpeakingUsers(prev => {
        const newSet = new Set(prev)
        if (isSpeaking) {
          newSet.add(userId)
        } else {
          newSet.delete(userId)
        }
        return newSet
      })

      requestAnimationFrame(checkAudioLevel)
    }

    checkAudioLevel()
  }, [])

  // Create peer connection for a specific user
  const createPeerConnection = useCallback((userId) => {
    const peerConnection = new RTCPeerConnection(iceConfigRef.current)

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current)
      })
    }

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      
      setStreams(prev => ({
        ...prev,
        [userId]: remoteStream
      }))

      // Setup audio analysis for remote stream
      if (remoteStream.getAudioTracks().length > 0) {
        setupAudioAnalysis(remoteStream, userId)
      }
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'ice_candidate',
          target_user_id: userId,
          candidate: event.candidate
        }))
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}: ${peerConnection.connectionState}`)
      
      if (peerConnection.connectionState === 'failed') {
        // Attempt ICE restart
        peerConnection.restartIce()
      }
    }

    peerConnectionsRef.current[userId] = peerConnection
    return peerConnection
  }, [setupAudioAnalysis])

  // Connect to signaling server
  const connect = useCallback(async (localStream) => {
    localStreamRef.current = localStream

    // Fetch ICE configuration from backend
    if (!iceConfigRef.current) {
      iceConfigRef.current = await fetchIceConfig()
      console.log('ICE configuration loaded:', iceConfigRef.current)
    }

    // Setup audio analysis for local stream
    if (localStream.getAudioTracks().length > 0) {
      setupAudioAnalysis(localStream, userData.id)
    }

    const ws = new WebSocket(getWebSocketUrl())
    wsRef.current = ws

    ws.onopen = () => {
      console.log('Connected to signaling server')
      
      // Send join message
      ws.send(JSON.stringify({
        type: 'join',
        user_info: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url
        }
      }))
    }

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'room_state':
          // Initial room state
          setParticipants(data.participants)
          
          // Create peer connections for existing participants
          for (const participant of data.participants) {
            if (participant.user_id !== userData.id) {
              const pc = createPeerConnection(participant.user_id)
              
              // Create and send offer
              const offer = await pc.createOffer()
              await pc.setLocalDescription(offer)
              
              ws.send(JSON.stringify({
                type: 'offer',
                target_user_id: participant.user_id,
                offer: offer
              }))
            }
          }
          break

        case 'user_joined':
          if (data.user_id !== userData.id) {
            setParticipants(prev => {
              const exists = prev.some(p => p.user_id === data.user_id)
              if (exists) return prev
              return [...prev, { user_id: data.user_id, ...data.user_info }]
            })
          }
          break

        case 'user_left':
          setParticipants(prev => prev.filter(p => p.user_id !== data.user_id))
          
          // Clean up peer connection
          if (peerConnectionsRef.current[data.user_id]) {
            peerConnectionsRef.current[data.user_id].close()
            delete peerConnectionsRef.current[data.user_id]
          }
          
          // Clean up stream
          setStreams(prev => {
            const newStreams = { ...prev }
            delete newStreams[data.user_id]
            return newStreams
          })
          
          // Clean up audio analyser
          if (analyserNodesRef.current[data.user_id]) {
            delete analyserNodesRef.current[data.user_id]
          }
          break

        case 'offer':
          {
            const pc = createPeerConnection(data.from_user_id)
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
            
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            
            ws.send(JSON.stringify({
              type: 'answer',
              target_user_id: data.from_user_id,
              answer: answer
            }))
          }
          break

        case 'answer':
          {
            const pc = peerConnectionsRef.current[data.from_user_id]
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(data.answer))
            }
          }
          break

        case 'ice_candidate':
          {
            const pc = peerConnectionsRef.current[data.from_user_id]
            if (pc && data.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
            }
          }
          break

        case 'speaking':
          setSpeakingUsers(prev => {
            const newSet = new Set(prev)
            if (data.is_speaking) {
              newSet.add(data.user_id)
            } else {
              newSet.delete(data.user_id)
            }
            return newSet
          })
          break
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('Disconnected from signaling server')
    }
  }, [userData, roomId, createPeerConnection, setupAudioAnalysis])

  // Disconnect from room
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close())
    peerConnectionsRef.current = {}

    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserNodesRef.current = {}
  }, [])

  // Toggle microphone
  const toggleMicrophone = useCallback((enabled) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = enabled
      })
    }
  }, [])

  // Toggle camera
  const toggleCamera = useCallback((enabled) => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = enabled
      })
    }
  }, [])

  // Update stream (when adding/removing tracks)
  const updateStream = useCallback((newStream) => {
    localStreamRef.current = newStream

    // Update all peer connections with new tracks
    Object.values(peerConnectionsRef.current).forEach(pc => {
      const senders = pc.getSenders()
      
      // Remove old tracks
      senders.forEach(sender => pc.removeTrack(sender))
      
      // Add new tracks
      newStream.getTracks().forEach(track => {
        pc.addTrack(track, newStream)
      })
    })
  }, [])

  return {
    participants,
    streams,
    speakingUsers,
    connect,
    disconnect,
    toggleMicrophone,
    toggleCamera,
    updateStream
  }
}

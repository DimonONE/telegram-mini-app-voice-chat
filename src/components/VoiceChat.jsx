import { useState, useEffect, useRef } from 'react'
import ParticipantList from './ParticipantList'
import VideoGrid from './VideoGrid'
import ControlPanel from './ControlPanel'
import { useWebRTC } from '../hooks/useWebRTC'
import { API_URL } from '@config'


// Get backend URL
const getBackendUrl = () => {
  const protocol = window.location.protocol
  const host = window.location.hostname
  const apiUrl = API_URL
  
  if (apiUrl) {
    return apiUrl
  }
  return `${protocol}//${host}:8000`
}

function VoiceChat({ roomId, userData, onLeaveRoom }) {
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isCameraEnabled, setIsCameraEnabled] = useState(false)
  const [sendingNotification, setSendingNotification] = useState(false)
  const localStreamRef = useRef(null)

  const {
    participants,
    streams,
    speakingUsers,
    connect,
    disconnect,
    toggleMicrophone,
    toggleCamera,
    updateStream
  } = useWebRTC(roomId, userData)

  useEffect(() => {
    // Initialize local media stream and connect
    initializeMedia()
    
    return () => {
      // Cleanup on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
      disconnect()
    }
  }, [])

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      })
      
      localStreamRef.current = stream
      
      // Connect to room with initial stream
      connect(stream)
    } catch (error) {
      console.error('Error accessing media devices:', error)
      alert('Не удалось получить доступ к микрофону. Проверьте разрешения.')
    }
  }

  const handleToggleMic = async () => {
    const newState = !isMicEnabled
    setIsMicEnabled(newState)
    
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = newState
      }
    }
    
    toggleMicrophone(newState)
  }

  const handleToggleCamera = async () => {
    const newState = !isCameraEnabled
    setIsCameraEnabled(newState)

    try {
      if (newState) {
        // Add video track
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
        const videoTrack = videoStream.getVideoTracks()[0]
        
        if (localStreamRef.current) {
          localStreamRef.current.addTrack(videoTrack)
          updateStream(localStreamRef.current)
        }
      } else {
        // Remove video track
        if (localStreamRef.current) {
          const videoTracks = localStreamRef.current.getVideoTracks()
          videoTracks.forEach(track => {
            track.stop()
            localStreamRef.current.removeTrack(track)
          })
          updateStream(localStreamRef.current)
        }
      }
      
      toggleCamera(newState)
    } catch (error) {
      console.error('Error toggling camera:', error)
      setIsCameraEnabled(!newState)
    }
  }

  const handleLeave = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    disconnect()
    onLeaveRoom()
  }

  const handleSendParticipantsToTelegram = async () => {
    setSendingNotification(true)
    try {
      const backendUrl = getBackendUrl()
      const response = await fetch(`${backendUrl}/api/room/${roomId}/participants/notify?user_id=${userData.id}`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('✅ Список участников отправлен в Telegram!')
      } else {
        alert('⚠️ ' + (data.message || 'Ошибка отправки. Проверьте настройку бота.'))
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('❌ Ошибка отправки уведомления')
    } finally {
      setSendingNotification(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-tg-bg">
      {/* Header */}
      <div className="bg-tg-button text-tg-button-text px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Комната: {roomId}</h2>
          <p className="text-xs opacity-80">{participants.length} участник(ов)</p>
        </div>
        <button
          onClick={handleLeave}
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          Выйти
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Video Grid */}
        <VideoGrid 
          participants={participants}
          streams={streams}
          speakingUsers={speakingUsers}
          localStream={localStreamRef.current}
          currentUserId={userData.id}
        />

        {/* Participants List */}
        <ParticipantList 
          participants={participants}
          speakingUsers={speakingUsers}
          currentUserId={userData.id}
          onSendToTelegram={handleSendParticipantsToTelegram}
          sendingNotification={sendingNotification}
        />
      </div>

      {/* Control Panel */}
      <ControlPanel
        isMicEnabled={isMicEnabled}
        isCameraEnabled={isCameraEnabled}
        onToggleMic={handleToggleMic}
        onToggleCamera={handleToggleCamera}
        onLeave={handleLeave}
      />
    </div>
  )
}

export default VoiceChat

import { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import RoomJoin from './components/RoomJoin'
import VoiceChat from './components/VoiceChat'

function App() {
  const [roomId, setRoomId] = useState(null)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready()
    WebApp.expand()
    
    // Get Telegram user data
    const tgUser = WebApp.initDataUnsafe?.user
    
    if (tgUser) {
      setUserData({
        id: tgUser.id.toString(),
        first_name: tgUser.first_name,
        last_name: tgUser.last_name || '',
        username: tgUser.username || '',
        photo_url: tgUser.photo_url || `https://ui-avatars.com/api/?name=${tgUser.first_name}&background=random`
      })
    } else {
      // Fallback for development/testing outside Telegram
      const randomId = Math.random().toString(36).substring(7)
      setUserData({
        id: randomId,
        first_name: 'Test User',
        last_name: '',
        username: 'testuser',
        photo_url: `https://ui-avatars.com/api/?name=Test+User&background=random`
      })
    }
  }, [])

  const handleJoinRoom = (room) => {
    setRoomId(room)
  }

  const handleLeaveRoom = () => {
    setRoomId(null)
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tg-bg">
        <div className="text-tg-text">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tg-bg">
      {!roomId ? (
        <RoomJoin onJoinRoom={handleJoinRoom} userData={userData} />
      ) : (
        <VoiceChat 
          roomId={roomId} 
          userData={userData} 
          onLeaveRoom={handleLeaveRoom} 
        />
      )}
    </div>
  )
}

export default App

import { useEffect, useRef } from 'react'

function VideoGrid({ participants, streams, speakingUsers, localStream, currentUserId }) {
  const hasVideo = participants.some(p => {
    const stream = p.user_id === currentUserId ? localStream : streams[p.user_id]
    return stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled
  })

  if (!hasVideo) {
    return null
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {participants.map((participant) => {
          const stream = participant.user_id === currentUserId ? localStream : streams[participant.user_id]
          const hasVideoTrack = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled
          const isSpeaking = speakingUsers.has(participant.user_id)

          if (!hasVideoTrack) return null

          return (
            <VideoTile
              key={participant.user_id}
              participant={participant}
              stream={stream}
              isSpeaking={isSpeaking}
              isCurrentUser={participant.user_id === currentUserId}
            />
          )
        })}
      </div>
    </div>
  )
}

function VideoTile({ participant, stream, isSpeaking, isCurrentUser }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className={`relative video-container ${isSpeaking ? 'ring-4 ring-green-500' : ''}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isCurrentUser}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center space-x-2">
          <img
            src={participant.photo_url}
            alt={participant.first_name}
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {participant.first_name} {participant.last_name}
              {isCurrentUser && <span className="ml-1">(Вы)</span>}
            </p>
          </div>
          {isSpeaking && (
            <div className="bg-green-500 rounded-full p-1">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoGrid

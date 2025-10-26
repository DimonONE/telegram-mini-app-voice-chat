function ParticipantList({ participants, speakingUsers, currentUserId }) {
  return (
    <div className="bg-tg-secondary-bg border-t border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-tg-hint mb-3">УЧАСТНИКИ</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {participants.map((participant) => {
          const isSpeaking = speakingUsers.has(participant.user_id)
          const isCurrentUser = participant.user_id === currentUserId
          
          return (
            <div
              key={participant.user_id}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                isSpeaking ? 'bg-green-100 dark:bg-green-900' : 'bg-white dark:bg-gray-800'
              }`}
            >
              <div className="relative">
                <img
                  src={participant.photo_url}
                  alt={participant.first_name}
                  className={`w-10 h-10 rounded-full ${
                    isSpeaking ? 'ring-4 ring-green-500 speaking-indicator' : ''
                  }`}
                />
                {isSpeaking && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-tg-text truncate">
                  {participant.first_name} {participant.last_name}
                  {isCurrentUser && <span className="text-tg-hint ml-1">(Вы)</span>}
                </p>
                {participant.username && (
                  <p className="text-xs text-tg-hint truncate">@{participant.username}</p>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  В эфире
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ParticipantList

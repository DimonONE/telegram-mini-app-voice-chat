import { useState } from 'react'

function RoomJoin({ onJoinRoom, userData }) {
  const [roomInput, setRoomInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (roomInput.trim()) {
      onJoinRoom(roomInput.trim())
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={userData.photo_url} 
            alt={userData.first_name}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-tg-button"
          />
          <h1 className="text-2xl font-bold text-tg-text mb-2">
            Привет, {userData.first_name}!
          </h1>
          <p className="text-tg-hint">
            Введите ID комнаты для подключения
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="Например: room123"
              className="w-full px-4 py-3 rounded-lg bg-tg-secondary-bg text-tg-text border-2 border-transparent focus:border-tg-button outline-none transition-colors"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!roomInput.trim()}
            className="w-full bg-tg-button text-tg-button-text py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Войти в комнату
          </button>
        </form>

        <div className="mt-8 p-4 bg-tg-secondary-bg rounded-lg">
          <h3 className="font-semibold text-tg-text mb-2">💡 Подсказка</h3>
          <p className="text-sm text-tg-hint">
            Создайте свою комнату, используя любой уникальный ID. 
            Поделитесь этим ID с друзьями, чтобы они могли присоединиться к вам!
          </p>
        </div>
      </div>
    </div>
  )
}

export default RoomJoin

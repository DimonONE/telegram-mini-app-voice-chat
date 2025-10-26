function ControlPanel({ isMicEnabled, isCameraEnabled, onToggleMic, onToggleCamera, onLeave }) {
  return (
    <div className="bg-tg-secondary-bg border-t border-gray-200 p-4">
      <div className="flex justify-center space-x-4">
        {/* Microphone Button */}
        <button
          onClick={onToggleMic}
          className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all ${
            isMicEnabled
              ? 'bg-tg-button text-tg-button-text'
              : 'bg-red-500 text-white'
          }`}
          title={isMicEnabled ? 'Выключить микрофон' : 'Включить микрофон'}
        >
          {isMicEnabled ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          )}
          <span className="text-xs mt-1">Микрофон</span>
        </button>

        {/* Camera Button */}
        <button
          onClick={onToggleCamera}
          className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all ${
            isCameraEnabled
              ? 'bg-tg-button text-tg-button-text'
              : 'bg-gray-400 text-white'
          }`}
          title={isCameraEnabled ? 'Выключить камеру' : 'Включить камеру'}
        >
          {isCameraEnabled ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          )}
          <span className="text-xs mt-1">Камера</span>
        </button>
      </div>
    </div>
  )
}

export default ControlPanel

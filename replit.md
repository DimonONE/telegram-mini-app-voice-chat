# Telegram Mini App - Voice & Video Chat

## Overview

This is a fully functional Telegram Mini App with voice and video chat capabilities, designed to work stably even on weak internet connections (similar to Discord). The app uses WebRTC for peer-to-peer communication and includes a FastAPI signaling server.

## Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite build tool
- **Styling**: TailwindCSS with Telegram theme integration
- **WebRTC**: Browser native WebRTC APIs for audio/video
- **Telegram Integration**: @twa-dev/sdk for Telegram Web Apps API
- **Audio Analysis**: Web Audio API for speaking detection

### Backend (Python + FastAPI)
- **Framework**: FastAPI with WebSocket support
- **Server**: Uvicorn ASGI server
- **Signaling**: WebSocket-based signaling for WebRTC
- **Room Management**: In-memory room and participant tracking

### Key Technologies
- **WebRTC**: Peer-to-peer audio/video transmission
- **STUN/TURN**: NAT traversal for stable connections
- **WebSocket**: Real-time signaling between peers
- **Telegram Web Apps SDK**: Integration with Telegram platform

## Project Structure

```
.
├── main.py                      # FastAPI signaling server
├── requirements.txt             # Python dependencies
├── package.json                 # Node.js dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # TailwindCSS configuration
├── index.html                  # HTML entry point
└── src/
    ├── main.jsx                # React entry point
    ├── App.jsx                 # Main application component
    ├── index.css               # Global styles
    ├── components/
    │   ├── RoomJoin.jsx        # Room joining interface
    │   ├── VoiceChat.jsx       # Main chat component
    │   ├── ParticipantList.jsx # Participant list display
    │   ├── VideoGrid.jsx       # Video tiles grid
    │   └── ControlPanel.jsx    # Mic/camera controls
    └── hooks/
        └── useWebRTC.js        # WebRTC connection logic
```

## Features Implemented

### MVP Features
1. ✅ Telegram Mini App integration with Web Apps SDK
2. ✅ User authentication using Telegram data (name, avatar)
3. ✅ Room-based system with unique room IDs
4. ✅ WebRTC audio and video streaming
5. ✅ Real-time participant list with Telegram avatars
6. ✅ Microphone and camera toggle controls
7. ✅ Speaking indicator using Web Audio API
8. ✅ WebSocket signaling server
9. ✅ STUN/TURN configuration for weak internet
10. ✅ Telegram-style responsive UI with theme support
11. ✅ Automatic participant updates on join/leave

## How It Works

### WebRTC Flow
1. User joins a room with a unique room ID
2. Backend signaling server manages room state
3. Peers exchange offers, answers, and ICE candidates via WebSocket
4. Direct peer-to-peer connections established for media
5. TURN servers used as fallback for NAT traversal

### Speaking Detection
- Uses Web Audio API `AnalyserNode` to monitor audio levels
- Real-time frequency analysis to detect active speakers
- Visual indicators (pulse animation, green highlight) for speaking users

### Connection Stability
- Multiple STUN servers for peer discovery
- TURN servers for NAT/firewall traversal
- ICE candidate pool for faster connection
- Automatic ICE restart on connection failure

## Configuration

### TURN Server Configuration
The application now uses environment variables for secure TURN server credential management:

**Environment Variables** (optional but recommended for production):
- `TURN_URL`: TURN server URL (default: turn:global.relay.metered.ca:80)
- `TURN_USERNAME`: TURN server username
- `TURN_PASSWORD`: TURN server password

**How it works**:
1. Backend exposes `/api/ice-config` endpoint that returns ICE server configuration
2. Frontend fetches configuration on connection initialization
3. If TURN credentials are set, they're used; otherwise falls back to STUN-only
4. Credentials never exposed to client, only delivered via secure backend endpoint

**For production**:
1. Copy `.env.example` to `.env`
2. Set TURN credentials from providers like Metered, Twilio, or Xirsys
3. Restart backend server

This approach ensures:
- No hardcoded credentials in source code
- Secure credential management
- Easy configuration via environment variables
- Graceful fallback to STUN when TURN unavailable

### Environment
- Frontend: Port 5000 (Vite dev server)
- Backend: Port 8000 (FastAPI/Uvicorn)
- WebSocket: Same domain as backend on port 8000

## Recent Changes

- Initial project setup with React + Vite + TailwindCSS
- FastAPI WebSocket signaling server implementation
- WebRTC peer connection management with ICE servers
- Telegram Web Apps SDK integration
- Speaking detection with Web Audio API
- Responsive UI components with Telegram theming
- Comprehensive documentation and setup instructions

## Dependencies

### Python (requirements.txt)
- fastapi==0.109.0
- uvicorn[standard]==0.27.0
- websockets==12.0
- python-multipart==0.0.6

### Node.js (package.json)
- react ^18.2.0
- react-dom ^18.2.0
- @twa-dev/sdk ^7.0.0
- vite ^5.0.8
- tailwindcss ^3.4.0

## Telegram Bot Setup

To use this as a Telegram Mini App:
1. Create a bot via @BotFather
2. Use `/newapp` to register the Mini App
3. Set the Web App URL to your deployment URL
4. Users can launch the app from the bot's menu button

## User Preferences

No specific user preferences recorded yet.

## Notes

- All media is peer-to-peer, server only handles signaling
- Works inside Telegram and as standalone web app
- Requires HTTPS for production (WebRTC requirement)
- Microphone permission required for audio chat
- Camera permission optional for video chat

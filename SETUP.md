# Telegram Mini App Setup Guide

Пошаговое руководство по настройке и запуску Telegram Mini App с голосовым и видеочатом.

## 📋 Шаг 1: Установка зависимостей

### Backend (Python)
```bash
pip install -r requirements.txt
```

### Frontend (Node.js)
```bash
npm install
```

## 🔧 Шаг 2: Конфигурация TURN сервера (рекомендуется для production)

### Получение бесплатных TURN учётных данных

Выберите один из провайдеров:

#### Option 1: Metered OpenRelay (Рекомендуется)
1. Перейдите на https://www.metered.ca/tools/openrelay/
2. Скопируйте бесплатные учётные данные
3. Используйте их в `.env` файле

#### Option 2: Twilio
1. Зарегистрируйтесь на https://www.twilio.com/console
2. Перейдите в раздел STUN/TURN
3. Получите учётные данные (10 ГБ бесплатно)

#### Option 3: Xirsys
1. Зарегистрируйтесь на https://xirsys.com/
2. Создайте приложение
3. Получите TURN учётные данные

### Настройка .env файла

1. Скопируйте пример:
```bash
cp .env.example .env
```

2. Отредактируйте `.env` и добавьте ваши учётные данные:
```bash
TURN_URL=turn:global.relay.metered.ca:80
TURN_USERNAME=ваш-username-здесь
TURN_PASSWORD=ваш-password-здесь
```

3. **Важно**: Добавьте `.env` в `.gitignore` (уже добавлено)

## ▶️ Шаг 3: Запуск приложения

### Запуск Backend
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Backend будет доступен на: `http://localhost:8000`

Проверьте здоровье сервера:
```bash
curl http://localhost:8000/
```

Проверьте конфигурацию ICE:
```bash
curl http://localhost:8000/api/ice-config
```

### Запуск Frontend
```bash
npm run dev
```

Frontend будет доступен на: `http://localhost:5000`

## 📱 Шаг 4: Настройка Telegram Bot

### 1. Создание бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду: `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните полученный API токен

### 2. Настройка Mini App

1. В [@BotFather](https://t.me/BotFather) отправьте: `/newapp`
2. Выберите вашего бота
3. Заполните информацию:
   - **Title**: Voice Chat (или любое название)
   - **Description**: Голосовой и видеочат в Telegram
   - **Photo**: Загрузите иконку 512x512 px
   - **Web App URL**: Ваш публичный URL (см. Шаг 5)

### 3. Настройка кнопки меню (опционально)

Используйте Bot API для настройки кнопки меню:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{
    "menu_button": {
      "type": "web_app",
      "text": "Open Voice Chat",
      "web_app": {
        "url": "https://your-deployed-url.com"
      }
    }
  }'
```

## 🌐 Шаг 5: Развертывание на Replit

### Автоматическое развертывание

Если вы работаете на Replit:

1. Оба сервиса (Backend и Frontend) автоматически запустятся
2. Получите ваш Replit URL (например: `https://your-repl.repl.co`)
3. Используйте этот URL в настройках Telegram Bot
4. HTTPS автоматически включен на Replit

### Настройка переменных окружения на Replit

1. Откройте панель "Secrets" в Replit
2. Добавьте переменные:
   - `TURN_URL`
   - `TURN_USERNAME`
   - `TURN_PASSWORD`
3. Перезапустите сервер

## ✅ Шаг 6: Проверка

### Проверка Backend
```bash
# Health check
curl http://localhost:8000/

# ICE configuration
curl http://localhost:8000/api/ice-config

# Ожидаемый ответ (с TURN):
{
  "iceServers": [
    {"urls": "stun:stun.l.google.com:19302"},
    {"urls": "stun:stun1.l.google.com:19302"},
    {
      "urls": "turn:...",
      "username": "...",
      "credential": "..."
    }
  ],
  "iceCandidatePoolSize": 10
}
```

### Проверка Frontend
1. Откройте `http://localhost:5000` в браузере
2. Вы должны увидеть страницу входа в комнату
3. Проверьте консоль браузера на наличие ошибок

### Тестирование в Telegram
1. Откройте вашего бота в Telegram
2. Нажмите на кнопку меню или используйте команду
3. Mini App должно открыться внутри Telegram
4. Разрешите доступ к микрофону при запросе

## 🔍 Решение проблем

### Backend не запускается
- Проверьте, что все зависимости установлены: `pip list`
- Убедитесь, что порт 8000 свободен
- Проверьте логи на наличие ошибок

### Frontend не подключается к Backend
- Убедитесь, что Backend запущен на порту 8000
- Проверьте CORS настройки в `main.py`
- Откройте консоль браузера для просмотра ошибок

### WebRTC соединения не устанавливаются
- **Без TURN**: Работает только в локальной сети или простых NAT
- **С TURN**: Проверьте правильность учётных данных
- Проверьте `/api/ice-config` endpoint
- Убедитесь, что используется HTTPS (требуется для WebRTC)

### Нет доступа к микрофону/камере
- Убедитесь, что используется HTTPS (обязательно для WebRTC)
- Проверьте разрешения браузера
- В Chrome: chrome://settings/content/microphone
- В Firefox: about:preferences#privacy

### Telegram Mini App не открывается
- Убедитесь, что используется HTTPS URL
- Проверьте правильность URL в настройках бота
- Очистите кеш Telegram: Settings → Data and Storage → Clear Cache

## 📊 Мониторинг

### Проверка активных комнат и пользователей
```bash
curl http://localhost:8000/
```

Ответ:
```json
{
  "status": "running",
  "service": "Telegram Mini App Signaling Server",
  "active_rooms": 2,
  "active_users": 5
}
```

### Логирование
- Backend логи: выводятся в консоль Uvicorn
- Frontend логи: откройте Developer Tools в браузере (F12)
- WebRTC статистика: доступна через `chrome://webrtc-internals/`

## 🚀 Production Checklist

Перед развертыванием в production:

- [ ] Настроены TURN учётные данные
- [ ] Используется HTTPS
- [ ] Переменные окружения установлены правильно
- [ ] Backend доступен по публичному URL
- [ ] Telegram Bot настроен с правильным Web App URL
- [ ] Протестировано на разных устройствах
- [ ] Протестировано на слабом интернет-соединении
- [ ] Проверены разрешения микрофона/камеры
- [ ] Настроен мониторинг и логирование

## 💡 Советы

1. **Для разработки**: TURN сервер не обязателен, работает только STUN
2. **Для production**: TURN сервер критически важен для стабильности
3. **Тестирование**: Используйте два разных устройства/браузера для тестирования WebRTC
4. **Производительность**: WebRTC работает peer-to-peer, сервер только для signaling
5. **Безопасность**: Никогда не коммитьте `.env` файл в Git

## 📚 Дополнительные ресурсы

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [WebRTC Documentation](https://webrtc.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)

---

Если у вас возникли проблемы, проверьте логи и консоль браузера для получения подробной информации об ошибках.

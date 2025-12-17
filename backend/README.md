# AI Assistant Backend - Reminder System (MVP)

Backend сервер для системы напоминаний на базе GitHub Issues с интеграцией через Model Context Protocol (MCP).

## Возможности MVP

- ✅ **REST API** для управления напоминаниями
- ✅ **MCP Server** для интеграции с Claude
- ✅ **GitHub Issues** как backend-хранилище
- ✅ **TypeScript** с полной типизацией
- ✅ **Structured logging** с Pino

## Архитектура

```
┌─────────────┐
│   Claude    │
│   Desktop   │
└──────┬──────┘
       │ MCP Protocol (stdio)
       ↓
┌─────────────────┐
│  MCP Server     │
│  (stdio)        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────┐
│ ReminderService │ ───→ │ GitHubService│
└─────────────────┘      └──────┬───────┘
                                │
                                ↓
                         ┌─────────────┐
                         │   GitHub    │
                         │   Issues    │
                         └─────────────┘
```

## Требования

- Node.js >= 18
- GitHub Personal Access Token с доступом к Issues
- GitHub репозиторий для хранения напоминаний

## Установка

1. **Клонировать репозиторий и перейти в директорию backend:**

```bash
cd backend
```

2. **Установить зависимости:**

```bash
npm install
```

3. **Создать файл `.env` на основе `.env.example`:**

```bash
cp .env.example .env
```

4. **Настроить переменные окружения в `.env`:**

```env
# GitHub Configuration
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_OWNER=your-github-username
GITHUB_REPO=ai-assistant-reminders

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### Получение GitHub Token

1. Перейдите в Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Нажмите "Generate new token (classic)"
3. Выберите scopes: `repo` (полный доступ к репозиториям)
4. Скопируйте токен и сохраните его в `.env`

## Запуск

### Development режим (с hot reload):

```bash
npm run dev
```

### Production режим:

```bash
npm run build
npm start
```

## REST API Endpoints

### 1. Создать напоминание

```http
POST /api/reminders
Content-Type: application/json

{
  "title": "Встреча с командой",
  "description": "Обсудить план на следующий спринт",
  "dueDate": "2025-12-20T10:00:00Z",
  "priority": "high",
  "category": "work"
}
```

**Response (201):**
```json
{
  "issueNumber": 42,
  "title": "Встреча с командой",
  "description": "Обсудить план на следующий спринт",
  "dueDate": "2025-12-20T10:00:00.000Z",
  "priority": "high",
  "category": "work",
  "status": "active",
  "url": "https://github.com/user/repo/issues/42",
  "createdAt": "2025-12-18T08:00:00.000Z"
}
```

### 2. Получить список напоминаний

```http
GET /api/reminders?status=active&priority=high&sortBy=dueDate
```

**Query Parameters:**
- `status` - `active` | `completed` | `all` (default: `active`)
- `category` - фильтр по категории
- `priority` - `high` | `medium` | `low`
- `sortBy` - `dueDate` | `priority` | `created` (default: `dueDate`)
- `limit` - максимальное количество (default: 100)

**Response (200):**
```json
[
  {
    "issueNumber": 42,
    "title": "Встреча с командой",
    "dueDate": "2025-12-20T10:00:00.000Z",
    "priority": "high",
    "category": "work",
    "status": "active",
    "url": "https://github.com/user/repo/issues/42"
  }
]
```

### 3. Получить одно напоминание

```http
GET /api/reminders/:id
```

**Response (200):**
```json
{
  "issueNumber": 42,
  "title": "Встреча с командой",
  "description": "Обсудить план на следующий спринт",
  "dueDate": "2025-12-20T10:00:00.000Z",
  "priority": "high",
  "category": "work",
  "status": "active",
  "url": "https://github.com/user/repo/issues/42",
  "createdAt": "2025-12-18T08:00:00.000Z"
}
```

### 4. Завершить напоминание

```http
DELETE /api/reminders/:id
Content-Type: application/json

{
  "comment": "Встреча прошла успешно"
}
```

**Response (200):**
```json
{
  "message": "Reminder #42 completed successfully"
}
```

### 5. Health Check

```http
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-12-18T08:00:00.000Z",
  "service": "ai-assistant-backend",
  "version": "1.0.0"
}
```

## MCP Integration

### Настройка MCP для Claude Desktop

1. **Добавьте конфигурацию в `claude_desktop_config.json`:**

На macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "reminder": {
      "command": "node",
      "args": [
        "/путь/к/проекту/backend/dist/mcp/reminderMCP.js"
      ],
      "env": {
        "GITHUB_TOKEN": "your_github_token",
        "GITHUB_OWNER": "your-github-username",
        "GITHUB_REPO": "ai-assistant-reminders",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

2. **Соберите MCP сервер:**

```bash
npm run build
```

3. **Перезапустите Claude Desktop**

### MCP Tools

#### 1. `reminder_create`

Создаёт новое напоминание.

**Parameters:**
- `title` (required) - заголовок
- `description` (required) - описание
- `dueDate` (required) - дата в ISO 8601 формате
- `priority` - `high` | `medium` | `low`
- `category` - категория

**Пример использования через Claude:**

> "Напомни мне завтра в 10:00 про встречу с командой. Это важно, категория work."

#### 2. `reminder_list`

Получает список напоминаний.

**Parameters:**
- `status` - `active` | `completed` | `all`
- `category` - фильтр по категории
- `priority` - `high` | `medium` | `low`
- `sortBy` - `dueDate` | `priority` | `created`

**Пример использования через Claude:**

> "Покажи мои активные напоминания с высоким приоритетом"

#### 3. `reminder_complete`

Отмечает напоминание как выполненное.

**Parameters:**
- `issueNumber` (required) - номер Issue
- `comment` - комментарий при завершении

**Пример использования через Claude:**

> "Отметь напоминание #42 как выполненное"

## Структура проекта

```
backend/
├── src/
│   ├── mcp/
│   │   └── reminderMCP.ts      # MCP Server
│   ├── routes/
│   │   └── reminders.ts        # REST API routes
│   ├── services/
│   │   ├── githubService.ts    # GitHub API wrapper
│   │   └── reminderService.ts  # Business logic
│   ├── types/
│   │   └── reminder.ts         # TypeScript types
│   ├── utils/
│   │   ├── env.ts              # Environment validation
│   │   └── logger.ts           # Logging setup
│   └── server.ts               # Express server
├── dist/                        # Compiled JS (after build)
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Логирование

Проект использует [Pino](https://github.com/pinojs/pino) для структурированного логирования.

**Development режим:** Pretty-printed логи с цветами
**Production режим:** JSON логи для парсинга

**Уровни логирования:**
- `fatal` - критические ошибки
- `error` - ошибки
- `warn` - предупреждения
- `info` - информационные сообщения (по умолчанию)
- `debug` - отладочная информация
- `trace` - детальная трассировка

Установить уровень: `LOG_LEVEL=debug` в `.env`

## Отладка

### Проверка GitHub подключения

```bash
# В Node.js REPL или через скрипт
import { GitHubService } from './src/services/githubService.js';
const gh = new GitHubService();
const limit = await gh.checkRateLimit();
console.log(limit);
```

### Тестирование REST API

```bash
# Создать напоминание
curl -X POST http://localhost:3001/api/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test reminder",
    "description": "Testing the API",
    "dueDate": "2025-12-20T10:00:00Z",
    "priority": "medium"
  }'

# Получить список
curl http://localhost:3001/api/reminders?status=active
```

### Проверка MCP сервера

```bash
# Запустить MCP сервер напрямую
node dist/mcp/reminderMCP.js

# MCP сервер слушает stdin/stdout, поэтому не будет output
# Проверьте логи в console
```

## Известные ограничения MVP

- ❌ Нет WebSocket для real-time уведомлений
- ❌ Нет планировщика (cron) для периодических задач
- ❌ Нет функций snooze и recurring reminders
- ❌ Нет email уведомлений
- ❌ Нет frontend компонентов

Эти функции будут добавлены в следующих версиях.

## Troubleshooting

### "Invalid environment variables" ошибка

Убедитесь, что все required переменные установлены в `.env`:
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`

### GitHub API rate limit

GitHub API имеет лимит 5000 запросов/час для аутентифицированных пользователей.
Проверить текущий лимит: `GET /api/reminders` вернёт header `X-RateLimit-Remaining`.

### MCP сервер не подключается к Claude

1. Проверьте путь к `reminderMCP.js` в конфигурации
2. Убедитесь, что проект собран: `npm run build`
3. Проверьте переменные окружения в `claude_desktop_config.json`
4. Перезапустите Claude Desktop
5. Проверьте логи Claude Desktop

## Лицензия

MIT

## Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь, что GitHub Token валиден
3. Проверьте GitHub Issues в вашем репозитории
4. Откройте Issue в проекте

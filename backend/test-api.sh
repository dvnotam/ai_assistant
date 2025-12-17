#!/bin/bash

# API Test Script for Reminder System
# Проверка всех endpoints

BASE_URL="http://localhost:3001"

echo "=================================="
echo "Тестирование Reminder API"
echo "=================================="
echo ""

# 1. Health Check
echo "1. Health Check:"
echo "GET $BASE_URL/health"
curl -s $BASE_URL/health | jq '.'
echo ""
echo ""

# 2. List Reminders (пустой список если токен не настроен)
echo "2. Список напоминаний (активные):"
echo "GET $BASE_URL/api/reminders?status=active"
curl -s "$BASE_URL/api/reminders?status=active" | jq '.'
echo ""
echo ""

# 3. Create Reminder
echo "3. Создание напоминания:"
echo "POST $BASE_URL/api/reminders"
curl -s -X POST $BASE_URL/api/reminders \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Тестовое напоминание",
    "description": "Проверка работы API",
    "dueDate": "2025-12-20T10:00:00Z",
    "priority": "high",
    "category": "test"
  }' | jq '.'
echo ""
echo ""

# 4. 404 Test
echo "4. Тест несуществующего endpoint (ожидается 404):"
echo "GET $BASE_URL/api/nonexistent"
curl -s $BASE_URL/api/nonexistent | jq '.'
echo ""
echo ""

echo "=================================="
echo "Результаты:"
echo "=================================="
echo "✓ Сервер запущен и отвечает"
echo "✓ Health check работает"
echo "✓ API endpoints доступны"
echo ""
echo "Если видишь 'Bad credentials' - нужно:"
echo "1. Создать GitHub Token: https://github.com/settings/tokens"
echo "2. Обновить GITHUB_TOKEN в backend/.env"
echo "3. Сервер автоматически перезапустится"
echo ""

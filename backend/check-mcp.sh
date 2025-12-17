#!/bin/bash

echo "=========================================="
echo "Проверка MCP системы напоминаний"
echo "=========================================="
echo ""

# 1. Check Claude process
echo "1. Claude Desktop процесс:"
if pgrep -x "Claude" > /dev/null; then
    echo "   ✓ Claude запущен"
else
    echo "   ✗ Claude не запущен"
fi
echo ""

# 2. Check MCP server process
echo "2. MCP Server процесс:"
if pgrep -f "reminderMCP.js" > /dev/null; then
    echo "   ✓ MCP сервер запущен"
    ps aux | grep reminderMCP.js | grep -v grep | awk '{print "   PID:", $2}'
else
    echo "   ✗ MCP сервер не запущен"
fi
echo ""

# 3. Check MCP config
echo "3. MCP Конфигурация:"
if [ -f ~/Library/Application\ Support/Claude/claude_desktop_config.json ]; then
    echo "   ✓ Конфиг файл существует"
    echo "   Содержимое:"
    cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq '.mcpServers.reminder.command' 2>/dev/null | sed 's/^/   /'
else
    echo "   ✗ Конфиг файл не найден"
fi
echo ""

# 4. Check MCP logs
echo "4. MCP Логи (последние ошибки):"
if [ -f ~/Library/Logs/Claude/mcp-server-reminder.log ]; then
    ERRORS=$(tail -50 ~/Library/Logs/Claude/mcp-server-reminder.log | grep -i error | wc -l | tr -d ' ')
    if [ "$ERRORS" -eq "0" ]; then
        echo "   ✓ Нет ошибок в логах"
    else
        echo "   ⚠️  Найдено ошибок: $ERRORS"
        tail -20 ~/Library/Logs/Claude/mcp-server-reminder.log | grep -i error | tail -3 | sed 's/^/   /'
    fi
else
    echo "   ✗ Лог файл не найден"
fi
echo ""

# 5. Test API
echo "5. REST API (http://localhost:3001):"
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✓ API отвечает"
    curl -s http://localhost:3001/health | jq '.status' | sed 's/^/   Status: /'
else
    echo "   ✗ API не отвечает"
fi
echo ""

echo "=========================================="
echo "Готово!"
echo ""
echo "Если все ✓ - попробуй открыть новый чат в Claude Desktop"
echo "Используй Cmd+N или кнопку 'New Chat'"
echo "=========================================="

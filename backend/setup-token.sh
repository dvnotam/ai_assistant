#!/bin/bash

# Helper script to update GitHub token in .env

echo "=========================================="
echo "Настройка GitHub Token"
echo "=========================================="
echo ""
echo "Браузер должен открыться на странице создания токена."
echo ""
echo "Шаги на странице GitHub:"
echo "1. Note: 'AI Assistant Reminders' (уже заполнено)"
echo "2. Expiration: выбери срок действия (рекомендую 90 days)"
echo "3. Scopes: убедись что выбран 'repo' ✓"
echo "4. Нажми 'Generate token' внизу страницы"
echo "5. ВАЖНО: Скопируй токен (начинается с ghp_...)"
echo "   Он показывается только один раз!"
echo ""
echo "=========================================="
echo ""

# Prompt for token
read -p "Вставь сюда скопированный токен: " GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Токен не введен. Отмена."
    exit 1
fi

# Validate token format
if [[ ! $GITHUB_TOKEN == ghp_* ]]; then
    echo "⚠️  Предупреждение: Токен обычно начинается с 'ghp_'"
    read -p "Продолжить? (y/n): " confirm
    if [[ ! $confirm == "y" ]]; then
        exit 1
    fi
fi

# Update .env file
if [ -f ".env" ]; then
    # Backup
    cp .env .env.backup
    echo "✓ Backup создан: .env.backup"

    # Update token
    if grep -q "GITHUB_TOKEN=" .env; then
        # Replace existing
        sed -i '' "s|GITHUB_TOKEN=.*|GITHUB_TOKEN=$GITHUB_TOKEN|" .env
        echo "✓ Токен обновлен в .env"
    else
        # Add new
        echo "GITHUB_TOKEN=$GITHUB_TOKEN" >> .env
        echo "✓ Токен добавлен в .env"
    fi
else
    echo "❌ Файл .env не найден!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ GitHub Token настроен!"
echo "=========================================="
echo ""
echo "Сервер должен автоматически перезапуститься."
echo "Проверь работу командой:"
echo "  ./test-api.sh"
echo ""

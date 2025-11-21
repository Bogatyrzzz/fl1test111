#!/bin/bash

echo "🚀 Настройка GitHub с Personal Access Token..."

# Проверяем, есть ли уже токен
if [ -n "$GITHUB_TOKEN" ]; then
    echo "✅ Найден токен в переменной окружения GITHUB_TOKEN"
    echo "🔄 Использую существующий токен..."
else
    echo "❌ Токен не найден"
    echo "📝 Пожалуйста, установите токен:"
    echo "   export GITHUB_TOKEN='your_personal_access_token_here'"
    echo "   Затем запустите скрипт снова"
    echo ""
    echo "🔗 Как получить Personal Access Token:"
    echo "   1. Зайдите в GitHub"
    echo "   2. Нажмите Settings > Developer settings"
    echo "   3. Нажмите 'Personal access tokens' > 'Tokens (classic)'"
    echo "   4. Нажмите 'Generate new token'"
    echo "   5. Выберите 'repo' права"
    echo "   6. Установите срок действия"
    echo "   7. Скопируйте токен и вставьте в команду выше"
    exit 1
fi

# Настраиваем remote с токеном
echo "🔧 Настройка remote с токеном..."
git remote set-url origin https://$GITHUB_TOKEN@github.com/Bogatyrzzz/fl1test111.git

echo "✅ Готово к запушу на GitHub!"
echo ""
echo "📊 Текущая конфигурация:"
git remote -v
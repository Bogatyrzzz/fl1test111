#!/bin/bash

echo "🚀 Настройка Git для GitHub..."
echo ""
echo "📝 Варианты аутентификации:"
echo "1. SSH ключ (рекомендуется)"
echo "2. Personal Access Token (рекомендуется)"
echo ""
echo "🔑 Для SSH ключа:"
echo "   ssh-keygen -t rsa -b 4096 -C 'your-email@example.com'"
echo "   Затем добавьте ключ в GitHub Settings > SSH and GPG keys"
echo ""
echo "🔑 Для Personal Access Token:"
echo "   1. Зайдите в GitHub Settings > Developer settings > Personal access tokens"
echo "   2. Создайте token с правами 'repo'"
echo "   3. Используйте: git remote set-url origin https://YOUR_TOKEN@github.com/Bogatyrzzz/fl1test111.git"
echo ""
echo "📌 Текущая конфигурация:"
git remote -v
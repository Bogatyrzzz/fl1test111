#!/bin/bash

echo "🚀 Запуш в GitHub с базовой аутентификацией..."

# Используем базовую аутентификацию
git config --global credential.helper store
git config --global user.name "Deploy Bot"
git config --global user.email "deploy@bot.com"

echo "🔧 Настройка credential helper..."
git config --global credential.helper

echo "✅ Попытка запуша..."
git push origin master

if [ $? -eq 0 ]; then
    echo "🎉 Запуш успешен!"
else
    echo "❌ Ошибка при запуше"
    echo "Проверьте права доступа к репозиторию"
fi
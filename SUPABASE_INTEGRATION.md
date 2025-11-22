# 🚀 Supabase Integration Guide

## 📋 Обзор

Проект **FL1 Self-Service** полностью готов для интеграции с Supabase. Все необходимые компоненты созданы и настроены.

---

## ✅ Что уже сделано

### 1. Установлены пакеты
```bash
npm install @supabase/supabase-js @supabase/postgrest-js dotenv
```

### 2. Созданы файлы
- `src/lib/supabase.ts` - Supabase клиент
- `src/lib/db-supabase.ts` - Обертка для совместимости с существующим кодом
- `supabase-setup.sql` - SQL скрипт для создания таблиц
- `.env` - Environment variables

### 3. Настроена совместимость
- Полная обратная совместимость с существующим кодом
- Те же самые интерфейсы и методы
- Плавное переключение между SQLite и Supabase

---

## 🔧 Оставшиеся шаги

### Шаг 1: Получить правильный Service Role Key

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект `qebniuerwopbgyuwdkzh`
3. Перейдите в Settings → API
4. Скопируйте `service_role` ключ
5. Замените `placeholder` в `.env` файле:

```env
SUPABASE_SERVICE_ROLE_KEY=ваш_настоящий_ключ
```

### Шаг 2: Создать таблицы в Supabase

1. В Supabase Dashboard перейдите в **SQL Editor**
2. Выполните следующий SQL код:

```sql
-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  password VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(255),
  verification_code_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы расчетов
CREATE TABLE IF NOT EXISTS calculations (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  input_data TEXT,
  result_data TEXT,
  status VARCHAR(255) DEFAULT 'completed',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_type ON calculations(type);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at);
```

### Шаг 3: Переключиться на Supabase

В файле `src/lib/db.ts`:

1. Закомментируйте SQLite код
2. Раскомментируйте Supabase:

```typescript
// Закомментировать это:
// import { PrismaClient } from '@prisma/client'
// ... весь SQLite код

// Раскомментировать это:
export { db } from './db-supabase'
```

### Шаг 4: Перезапустить приложение

```bash
npm run dev
```

---

## 🎯 Преимущества Supabase

### ✅ Масштабируемость
- PostgreSQL база данных
- Автоматическое масштабирование
- Глобальное распределение

### ✅ Real-time возможности
- Автоматические обновления данных
- WebSocket подключения
- Live subscriptions

### ✅ Безопасность
- Row Level Security (RLS)
- Автоматические API ключи
- Защита от SQL инъекций

### ✅ Удобство
- Визуальный dashboard
- Built-in аутентификация
- File storage
- Edge functions

---

## 🔄 Возврат на SQLite (если нужно)

Если возникнут проблемы, всегда можно вернуться на SQLite:

```typescript
// В src/lib/db.ts:
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

---

## 📞 Поддержка

Если возникнут вопросы:

1. **Supabase Docs**: https://supabase.com/docs
2. **Project Issues**: Проверьте логи в `dev.log`
3. **Environment Variables**: Убедитесь что все ключи правильные

---

## 🎉 Готово!

После выполнения этих шагов ваш проект будет использовать мощную и масштабируемую Supabase базу данных с сохранением всей текущей функциональности!
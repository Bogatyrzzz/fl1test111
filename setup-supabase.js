import { supabaseAdmin } from '../src/lib/supabase'

async function setupSupabaseTables() {
  console.log('🚀 Начинаю настройку таблиц Supabase...')

  try {
    // Создаем таблицу пользователей
    console.log('📝 Создание таблицы users...')
    const { error: usersError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `
    })

    if (usersError) {
      console.error('❌ Ошибка создания таблицы users:', usersError)
    } else {
      console.log('✅ Таблица users создана успешно')
    }

    // Создаем таблицу расчетов
    console.log('📝 Создание таблицы calculations...')
    const { error: calcError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
        CREATE INDEX IF NOT EXISTS idx_calculations_type ON calculations(type);
        CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at);
      `
    })

    if (calcError) {
      console.error('❌ Ошибка создания таблицы calculations:', calcError)
    } else {
      console.log('✅ Таблица calculations создана успешно')
    }

    // Проверяем, что таблицы созданы
    console.log('🔍 Проверка таблиц...')
    const { data: usersData, error: usersCheckError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)

    const { data: calcData, error: calcCheckError } = await supabaseAdmin
      .from('calculations')
      .select('count')
      .limit(1)

    if (usersCheckError) {
      console.error('❌ Таблица users недоступна:', usersCheckError)
    } else {
      console.log('✅ Таблица users доступна')
    }

    if (calcCheckError) {
      console.error('❌ Таблица calculations недоступна:', calcCheckError)
    } else {
      console.log('✅ Таблица calculations доступна')
    }

    console.log('🎉 Настройка Supabase завершена!')

  } catch (error) {
    console.error('❌ Критическая ошибка при настройке:', error)
  }
}

// Запускаем настройку
setupSupabaseTables()
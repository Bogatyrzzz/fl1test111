import { supabaseAdmin } from './src/lib/supabase.js'

async function testSupabaseConnection() {
  console.log('🔍 Тест подключения к Supabase...')
  
  try {
    // Тестируем простое подключение
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Ошибка подключения:', error)
      
      // Если таблицы не существует, пробуем ее создать
      if (error.code === 'PGRST116') {
        console.log('📝 Таблица не найдена, создаем базовую структуру...')
        
        // Создаем таблицу users через REST API
        const { error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            id: 'test-id',
            email: 'test@fl1capital.com',
            full_name: 'Test User',
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (createError && !createError.message.includes('already exists')) {
          console.error('❌ Ошибка создания таблицы:', createError)
        } else {
          console.log('✅ Таблица users готова к работе')
        }
      }
    } else {
      console.log('✅ Подключение к Supabase успешно!')
      console.log('📊 Данные:', data)
    }
    
    // Тестируем таблицу calculations
    const { data: calcData, error: calcError } = await supabaseAdmin
      .from('calculations')
      .select('count')
      .limit(1)
    
    if (calcError) {
      console.error('❌ Ошибка подключения к calculations:', calcError)
      
      if (calcError.code === 'PGRST116') {
        console.log('📝 Создаем таблицу calculations...')
        
        const { error: createCalcError } = await supabaseAdmin
          .from('calculations')
          .insert({
            id: 'test-calc-id',
            user_id: 'test-id',
            type: 'ipo',
            title: 'Test Calculation',
            status: 'completed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (createCalcError && !createCalcError.message.includes('already exists')) {
          console.error('❌ Ошибка создания таблицы calculations:', createCalcError)
        } else {
          console.log('✅ Таблица calculations готова к работе')
        }
      }
    } else {
      console.log('✅ Таблица calculations доступна')
      console.log('📊 Данные:', calcData)
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
  }
}

testSupabaseConnection()
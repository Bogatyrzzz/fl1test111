import { db } from './src/lib/db.ts'

async function viewDatabase() {
  try {
    console.log('📊 Подключение к базе данных...')
    
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerified: true,
        verificationCode: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const calculations = await db.calculation.findMany({
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('\n' + '='.repeat(60))
    console.log('📊 БАЗА ДАННЫХ PRISMA')
    console.log('='.repeat(60))
    
    console.log('\n📈 СТАТИСТИКА:')
    console.log(`• Всего пользователей: ${users.length}`)
    console.log(`• Подтвержденные: ${users.filter(u => u.emailVerified).length}`)
    console.log(`• Ожидают подтверждения: ${users.filter(u => !u.emailVerified).length}`)
    console.log(`• Всего расчетов: ${calculations.length}`)
    
    console.log('\n👥 ПОЛЬЗОВАТЕЛИ:')
    console.log('─'.repeat(50))
    
    users.forEach((user, index) => {
      const status = user.emailVerified ? '✅ Подтвержден' : '⏳ Ожидает'
      console.log(`${index + 1}. ${user.email || 'N/A'}`)
      console.log(`   Имя: ${user.fullName || 'N/A'}`)
      console.log(`   Статус: ${status}`)
      console.log(`   Код верификации: ${user.verificationCode || 'N/A'}`)
      console.log(`   Создан: ${new Date(user.createdAt).toLocaleString('ru-RU')}`)
      console.log(`   Обновлен: ${new Date(user.updatedAt).toLocaleString('ru-RU')}`)
      console.log('')
    })
    
    console.log('🧮 РАСЧЕТЫ:')
    console.log('─'.repeat(50))
    
    calculations.forEach((calc, index) => {
      const status = calc.status === 'completed' ? '✅ Завершен' : calc.status === 'pending' ? '⏳ В процессе' : '❌ Ошибка'
      console.log(`${index + 1}. ${calc.type.toUpperCase()} - "${calc.title}"`)
      console.log(`   Пользователь: ${calc.user.email} (${calc.user.fullName})`)
      console.log(`   Статус: ${status}`)
      console.log(`   Создан: ${new Date(calc.createdAt).toLocaleString('ru-RU')}`)
      console.log('')
    })
    
    console.log('='.repeat(60))
    console.log('\n✨ Просмотр базы данных завершен!')
    
  } catch (error) {
    console.error('❌ Ошибка при подключении к базе данных:', error)
  } finally {
    await db.$disconnect()
  }
}

viewDatabase()
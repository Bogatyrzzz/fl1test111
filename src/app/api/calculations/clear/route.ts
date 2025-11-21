import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Добавим CORS заголовки
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers })
    }
    
    let userId
    
    // Пробуем получить userId из тела запроса
    try {
      const body = await request.json()
      userId = body.userId
    } catch {
      userId = null
    }

    // Если нет в теле, пробуем получить по email из заголовка
    if (!userId) {
      const email = request.headers.get('x-user-email')
      if (email) {
        const user = await db.user.findUnique({
          where: { email }
        })
        if (user) {
          userId = user.id
        }
      }
    }

      // Если все еще нет userId, возвращаем успех (нечего удалять)
    if (!userId) {
      return NextResponse.json({
        success: true,
        message: 'История расчетов успешно очищена'
      }, { headers })
    }

    // Удаляем все расчеты пользователя
    await db.calculation.deleteMany({
      where: {
        userId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'История расчетов успешно очищена'
    }, { headers })

  } catch (error) {
    console.error('Clear calculation history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const calculationType = searchParams.get('type') || 'ipo'

    // Если userId не предоставлен, попробуем получить по email из заголовка
    let finalUserId = userId
    if (!finalUserId) {
      const email = request.headers.get('x-user-email')
      if (email) {
        const user = await db.user.findUnique({
          where: { email }
        })
        if (user) {
          finalUserId = user.id
        }
      }
    }

    // Если все еще нет userId, вернем пустой результат
    if (!finalUserId) {
      return NextResponse.json({
        success: true,
        calculations: []
      }, { headers })
    }

    const calculations = await db.calculation.findMany({
      where: {
        userId: finalUserId,
        type: calculationType
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20, // Последние 20 расчетов
      select: {
        id: true,
        title: true,
        inputData: true,
        resultData: true,
        status: true,
        errorMessage: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      calculations: calculations.map(calc => ({
        id: calc.id,
        title: calc.title,
        inputData: JSON.parse(calc.inputData),
        resultData: JSON.parse(calc.resultData),
        status: calc.status,
        errorMessage: calc.errorMessage,
        createdAt: calc.createdAt
      }))
    }, { headers })

  } catch (error) {
    console.error('Get calculation history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    )
  }
}
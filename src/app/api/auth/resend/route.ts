import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

// Используем статический код верификации для тестирования
function getVerificationCode() {
  return "123456"
}

export async function POST(request: NextRequest) {
  // Добавим CORS заголовки
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  try {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers })
    }
    
    console.log('🔄 Resend verification code request received')
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email обязателен' },
        { status: 400, headers }
      )
    }

    // Находим пользователя
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404, headers }
      )
    }

    // Генерируем новый код
    const verificationCode = getVerificationCode()
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 минут

    // Обновляем код в базе
    await db.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpires,
        updatedAt: new Date()
      }
    })

    console.log('🔢 Verification code for testing:', verificationCode)

    return NextResponse.json({
      success: true,
      message: 'Новый код отправлен на вашу почту',
      verificationCode, // Только для демонстрации!
    }, { headers })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
    
    console.log('🔍 Email verification request received')
    const { email, verificationCode } = await request.json()
    
    if (!email || !verificationCode) {
      return NextResponse.json(
        { error: 'Email и код верификации обязательны' },
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

    // Проверяем код и срок действия
    if (user.verificationCode !== verificationCode) {
      return NextResponse.json(
        { error: 'Неверный код верификации' },
        { status: 400, headers }
      )
    }

    if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
      return NextResponse.json(
        { error: 'Срок действия кода истек' },
        { status: 400, headers }
      )
    }

    // Подтверждаем email
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: undefined,
        verificationCodeExpires: undefined
      }
    })

    console.log('✅ Email verified successfully for:', email)

    return NextResponse.json({
      success: true,
      message: 'Email успешно подтвержден! Теперь вы можете войти.'
    }, { headers })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers }
    )
  }
}
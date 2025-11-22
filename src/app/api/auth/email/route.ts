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
    
    console.log('📧 Email auth request received')
    const { email, password, fullName, isLogin, verificationCode } = await request.json()
    
    console.log('📝 Auth data:', { email, isLogin, hasPassword: !!password, hasFullName: !!fullName, hasVerificationCode: !!verificationCode })

    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400, headers }
      )
    }

    // Валидация домена - разрешаем поддомены
    const emailRegex = /^[a-zA-Z0-9._%+-]+@fl1capital\.com$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Почта должна быть на домене @fl1capital.com' },
        { status: 400, headers }
      )
    }

    if (!isLogin && !fullName) {
      return NextResponse.json(
        { error: 'Имя обязательно для регистрации' },
        { status: 400, headers }
      )
    }

    if (isLogin) {
      // Вход
      let user = await db.user.findUnique({
        where: { email }
      })

      if (!user) {
        console.log('❌ User not found')
        return NextResponse.json(
          { error: 'Пользователь не найден' },
          { status: 404, headers }
        )
      }

      // Проверяем верифицирован ли email
      if (!user.emailVerified) {
        console.log('❌ Email not verified')
        return NextResponse.json(
          { error: 'Email не подтвержден. Пожалуйста, проверьте вашу почту.' },
          { status: 403, headers }
        )
      }

      // Проверяем пароль
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
      if (user.password !== hashedPassword) {
        return NextResponse.json(
          { error: 'Неверный пароль' },
          { status: 401, headers }
        )
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        }
      }, { headers })

    } else {
      // Регистрация
      const existingUser = await db.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Пользователь с такой почтой уже существует' },
          { status: 409, headers }
        )
      }

      // Создаем пользователя с кодом верификации
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
      const verificationCode = getVerificationCode()
      const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 минут

      const user = await db.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          emailVerified: false,
          verificationCode,
          verificationCodeExpires
        }
      })

      console.log('🔢 Verification code for testing:', verificationCode)

      // В реальном приложении здесь была бы отправка email
      // Для демонстрации возвращаем код в ответе
      return NextResponse.json({
        success: true,
        message: 'Код подтверждения отправлен на вашу почту',
        verificationCode, // Только для демонстрации!
        userId: user.id,
        requiresVerification: true
      }, { headers })
    }

  } catch (error) {
    console.error('Email auth error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers }
    )
  }
}
'use client'

import React, { useState, useEffect } from 'react'
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'

interface EmailAuthProps {
  onAuth: (user: { id: string; email: string; fullName: string }) => void
  onError: (error: string) => void
}

export default function EmailAuth({ onAuth, onError }: EmailAuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [isResending, setIsResending] = useState(false)

  const handleResendCode = async () => {
    setIsResending(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingEmail,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      setSuccess(`${data.message} (Демо-код: 123456)`)
      console.log('🔢 Новый код верификации для demo:', data.verificationCode)
      
    } catch (error) {
      console.error('Resend error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ошибка отправки кода'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  const handleVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Введите 6-значный код')
      onError('Введите 6-значный код')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingEmail,
          verificationCode,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()

      setSuccess('Email успешно подтвержден! Теперь вы можете войти.')
      setShowVerification(false)
      setVerificationCode('')
      
      // Автоматически переключаемся на вход
      setTimeout(() => {
        setIsLogin(true)
        setEmail(pendingEmail)
        setSuccess('')
      }, 2000)
      
    } catch (error) {
      console.error('Verification error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ошибка верификации'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!email || !password) {
      setError('Заполните все поля')
      onError('Заполните все поля')
      return
    }

    const validateEmail = (email: string) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@fl1capital\.com$/
      return emailRegex.test(email)
    }

    if (!validateEmail(email)) {
      setError('Почта должна быть на домене @fl1capital.com')
      onError('Почта должна быть на домене @fl1capital.com')
      return
    }

    if (!isLogin && !fullName) {
      setError('Введите ваше имя для регистрации')
      onError('Введите ваше имя для регистрации')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          isLogin,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()

      if (data.requiresVerification) {
        // Показываем код верификации и переключаемся на экран верификации
        setSuccess(data.message)
        setPendingEmail(email)
        setShowVerification(true)
        
        // В реальном приложении здесь был бы console.log с кодом для демонстрации
        console.log('🔢 Код верификации для demo:', data.verificationCode)
        setSuccess(`${data.message} (Демо-код: 123456)`)
      } else {
        // Обычный вход
        setSuccess(isLogin ? 'Вход выполнен успешно!' : 'Регистрация выполнена успешно!')
        
        localStorage.setItem('userEmail', email)
        
        onAuth({
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
        })
      }
    } catch (error) {
      console.error('Full error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ошибка соединения с сервером'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '80px',
      padding: '20px 20px 20px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {showVerification ? (
        // Экран верификации
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '20px',
          padding: '40px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#1a1a1a',
          border: 'none',
          outline: 'none',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '70px',
              height: '70px',
              backgroundColor: '#CE9332',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 25px rgba(206, 147, 50, 0.25)'
            }}>
              <Mail style={{ color: 'white', fontSize: '28px' }} />
            </div>
            <h1 style={{ 
              color: '#1a1a1a',
              fontSize: '28px',
              fontWeight: '700',
              margin: '0',
              marginBottom: '12px',
              letterSpacing: '-0.5px'
            }}>
              Подтверждение Email
            </h1>
            <p style={{ 
              color: '#666666',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0',
              fontWeight: '400'
            }}>
              Введите 6-значный код, отправленный на {pendingEmail}
            </p>
            <p style={{ 
              color: '#CE9332',
              fontSize: '14px',
              lineHeight: '1.4',
              margin: '8px 0 0 0',
              fontWeight: '600',
              textAlign: 'center',
              backgroundColor: 'rgba(206, 147, 50, 0.1)',
              padding: '8px 12px',
              borderRadius: '8px'
            }}>
              Демо-код: 123456
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div style={{
              marginBottom: '24px',
              padding: '16px 20px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              textAlign: 'center'
            }}>
              <CheckCircle style={{ color: '#22c55e', marginRight: '8px' }} />
              <span style={{ color: '#16a34a', fontSize: '15px', fontWeight: '500' }}>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: '24px',
              padding: '16px 20px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              textAlign: 'start'
            }}>
              <AlertCircle style={{ color: '#dc2626', marginRight: '8px', marginTop: '2px' }} />
              <span style={{ color: '#dc2626', fontSize: '15px', fontWeight: '500' }}>{error}</span>
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleVerification} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Verification Code Field */}
            <div>
              <label style={{ 
                display: 'block',
                color: '#1a1a1a',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Код подтверждения
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '18px',
                    border: '2px solid #e5e5e5',
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: 'monospace',
                    letterSpacing: '4px',
                    textAlign: 'center',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fafafa'
                  }}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                    e.target.style.borderColor = '#CE9332'
                    e.target.style.backgroundColor = 'white'
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    e.target.style.borderColor = '#e5e5e5'
                    e.target.style.backgroundColor = '#fafafa'
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              style={{
                padding: '16px 24px',
                background: isLoading || verificationCode.length !== 6 
                  ? '#ccc' 
                  : 'linear-gradient(135deg, #CE9332, #d4a05a)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading || verificationCode.length !== 6 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isLoading || verificationCode.length !== 6 
                  ? 'none' 
                  : '0 8px 25px rgba(206, 147, 50, 0.25)'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!isLoading && verificationCode.length === 6) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #d4a05a, #CE9332)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(206, 147, 50, 0.35)'
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!isLoading && verificationCode.length === 6) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #CE9332, #d4a05a)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(206, 147, 50, 0.25)'
                }
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    borderTop: '2px solid #ffffff',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Проверяем код...
                </div>
              ) : (
                'Подтвердить Email'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button
              type="button"
              onClick={() => {
                setShowVerification(false)
                setVerificationCode('')
                setError('')
                setSuccess('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#666666',
                fontSize: '15px',
                cursor: 'pointer',
                padding: '12px 20px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                fontWeight: '400',
                marginBottom: '12px'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = 'rgba(206, 147, 50, 0.1)'
                e.currentTarget.style.color = '#CE9332'
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#666666'
              }}
            >
              ← Назад к входу
            </button>
            
            {/* Resend Code Button */}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              style={{
                background: 'none',
                border: '1px solid #e5e5e5',
                color: '#666666',
                fontSize: '14px',
                cursor: isResending ? 'not-allowed' : 'pointer',
                padding: '10px 16px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                fontWeight: '400'
              }}
              onMouseEnter={(e) => {
                if (!isResending) {
                  e.currentTarget.style.backgroundColor = 'rgba(206, 147, 50, 0.05)'
                  e.currentTarget.style.color = '#CE9332'
                  e.currentTarget.style.borderColor = '#CE9332'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#666666'
                e.currentTarget.style.borderColor = '#e5e5e5'
              }}
            >
              {isResending ? 'Отправляем...' : 'Отправить код повторно'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '20px',
          padding: '40px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#1a1a1a',
          border: 'none',
          outline: 'none',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '70px',
              height: '70px',
              backgroundColor: '#CE9332',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 25px rgba(206, 147, 50, 0.25)'
            }}>
              <Mail style={{ color: 'white', fontSize: '28px' }} />
            </div>
            <h1 style={{ 
              color: '#1a1a1a',
              fontSize: '32px',
              fontWeight: '700',
              margin: '0',
              marginBottom: '12px',
              letterSpacing: '-0.5px'
            }}>
              {isLogin ? 'Вход в систему' : 'Создание аккаунта'}
            </h1>
            <p style={{ 
              color: '#666666',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0',
              fontWeight: '400'
            }}>
              {isLogin 
                ? 'Авторизуйтесь для полного доступа к формулам расчетов' 
                : 'Создайте аккаунт для доступа к IPO расчетам'
              }
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div style={{
              marginBottom: '24px',
              padding: '16px 20px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              textAlign: 'center'
            }}>
              <CheckCircle style={{ color: '#22c55e', marginRight: '8px' }} />
              <span style={{ color: '#16a34a', fontSize: '15px', fontWeight: '500' }}>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: '24px',
              padding: '16px 20px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              textAlign: 'start'
            }}>
              <AlertCircle style={{ color: '#dc2626', marginRight: '8px', marginTop: '2px' }} />
              <span style={{ color: '#dc2626', fontSize: '15px', fontWeight: '500' }}>{error}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Full Name Field (only for registration) */}
            {!isLogin && (
              <div>
                <label style={{ 
                  display: 'block',
                  color: '#1a1a1a',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  Полное имя
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#666666',
                    fontSize: '18px'
                  }} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Введите ваше имя"
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      fontSize: '16px',
                      border: '2px solid #e5e5e5',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#CE9332'
                      e.target.style.backgroundColor = 'white'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e5e5'
                      e.target.style.backgroundColor = '#fafafa'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label style={{ 
                display: 'block',
                color: '#1a1a1a',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Email адрес
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666666',
                  fontSize: '18px'
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@fl1capital.com"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '16px',
                    border: '2px solid #e5e5e5',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fafafa'
                  }}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                    e.target.style.borderColor = '#CE9332'
                    e.target.style.backgroundColor = 'white'
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    e.target.style.borderColor = '#e5e5e5'
                    e.target.style.backgroundColor = '#fafafa'
                  }}
                />
              </div>
              <p style={{
                color: '#666666',
                fontSize: '12px',
                marginTop: '6px',
                marginLeft: '4px'
              }}>
                Только для домена @fl1capital.com
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ 
                display: 'block',
                color: '#1a1a1a',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Пароль
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666666',
                  fontSize: '18px'
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '16px',
                    border: '2px solid #e5e5e5',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fafafa'
                  }}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                    e.target.style.borderColor = '#CE9332'
                    e.target.style.backgroundColor = 'white'
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    e.target.style.borderColor = '#e5e5e5'
                    e.target.style.backgroundColor = '#fafafa'
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '16px 24px',
                background: isLoading 
                  ? '#ccc' 
                  : 'linear-gradient(135deg, #CE9332, #d4a05a)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isLoading 
                  ? 'none' 
                  : '0 8px 25px rgba(206, 147, 50, 0.25)'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #d4a05a, #CE9332)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(206, 147, 50, 0.35)'
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #CE9332, #d4a05a)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(206, 147, 50, 0.25)'
                }
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    borderTop: '2px solid #ffffff',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  {isLogin ? 'Входим...' : 'Регистрируем...'}
                </div>
              ) : (
                isLogin ? 'Войти в систему' : 'Создать аккаунт'
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setSuccess('')
                setFullName('')
                setPassword('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#666666',
                fontSize: '15px',
                cursor: 'pointer',
                padding: '12px 20px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                fontWeight: '400'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = 'rgba(206, 147, 50, 0.1)'
                e.currentTarget.style.color = '#CE9332'
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#666666'
              }}
            >
              {isLogin ? 'Нет аккаунта? Создать новый' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { NumberInput } from '@/components/ui/number-input'
import EmailAuth from '@/components/ui/email-auth'
import { CalculationHistory } from '@/components/ui/calculation-history'
import Dashboard from '@/components/ui/dashboard'
import { Calculator, TrendingUp, DollarSign } from 'lucide-react'

// Добавим проверку на клиентский рендеринг
const isClient = typeof window !== 'undefined'

// Определим базовый URL для API
const getApiUrl = () => {
  if (!isClient) {
    return 'http://localhost:3000' // Для серверного рендеринга
  }
  
  // Для клиентского рендеринга проверяем environment
  const isPreview = window.location.hostname.includes('.space.z.ai')
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isPreview) {
    // В preview среде используем текущий origin
    return window.location.origin
  }
  
  if (isDevelopment) {
    return 'http://localhost:3000'
  }
  
  // Для продакшена используем текущий origin
  return window.location.origin
}

interface User {
  id: string
  email?: string
  fullName?: string
}

interface IPOCalculationData {
  currentUnits: number
  purchasePrice: number
  currentPrice: number
  commissionRate: number
  targetAmount: number
}

interface IPOResult {
  unitsToSell: number
  grossProfit: number
  commissionAmount: number
  netProfit: number
  totalAmount: number
  remainingUnits: number
  remainingValue: number
  profitPercentage: number
  recommendations: string[]
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationResult, setCalculationResult] = useState<IPOResult | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [formData, setFormData] = useState<IPOCalculationData>({
    currentUnits: 0,
    purchasePrice: 1000,
    currentPrice: 0,
    commissionRate: 15,
    targetAmount: 0
  })

  const handleEmailAuth = (userData: { id: string; email: string; fullName: string }) => {
    setUser({
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName,
    })
  }

  const handleEmailError = (error: string) => {
    console.error('Email auth error:', error)
    alert('Ошибка авторизации: ' + error)
  }

  const handleLogout = () => {
    setUser(null)
    setCalculationResult(null)
    setShowHistory(false)
    setCurrentSection(null)
  }

  const handleSectionSelect = (section: string) => {
    setCurrentSection(section)
    setCalculationResult(null) // Сбрасываем результаты при смене раздела
  }

  const handleBackToDashboard = () => {
    setCurrentSection(null)
    setCalculationResult(null)
  }

  const handleInputChange = (field: keyof IPOCalculationData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCalculate = async () => {
    if (!user || formData.currentUnits <= 0 || formData.purchasePrice <= 0 || formData.currentPrice <= 0 || formData.targetAmount <= 0) {
      alert('Пожалуйста, заполните все обязательные поля корректными значениями')
      return
    }

    setIsCalculating(true)
    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/calculations/ipo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          calculationData: formData
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setCalculationResult(data.result)
      } else {
        console.error('Calculation failed:', data.error)
        alert('Ошибка при выполнении расчета')
      }
    } catch (error) {
      console.error('Calculation error:', error)
      alert('Ошибка при выполнении расчета')
    } finally {
      setIsCalculating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  // Показываем историю, если это необходимо
  if (showHistory && user) {
    return <CalculationHistory userId={user.id} onClose={() => setShowHistory(false)} />
  }

  // Если пользователь не авторизован, показываем форму авторизации
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 text-white p-4 flex items-center justify-center relative overflow-hidden">
        {/* Фоновые декоративные элементы */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-500/5 rounded-full blur-2xl"></div>
        </div>

        <div className="w-full max-w-md relative">
          <div className="text-center mb-8">
            <Logo />
            <h1 className="text-4xl font-bold text-white mt-6 mb-3 tracking-tight">FL1 self-service</h1>
            <p className="text-amber-100 text-lg leading-relaxed">
              Сервис для проведения рабочих расчетов
            </p>
          </div>
          <EmailAuth onAuth={handleEmailAuth} onError={handleEmailError} />
        </div>
      </div>
    )
  }

  // Показываем дашборд с выбором разделов, если не выбран конкретный раздел
  if (!currentSection) {
    return <Dashboard user={user} onSectionSelect={handleSectionSelect} onLogout={handleLogout} />
  }

  // Показываем калькулятор IPO, если выбран соответствующий раздел
  if (currentSection === 'ipo') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 text-white p-4" style={{ border: 'none', outline: 'none' }}>
        <div className="max-w-6xl mx-auto" style={{ border: 'none', outline: 'none' }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBackToDashboard}
                className="text-white hover:bg-amber-800 font-semibold bg-amber-600/10"
              >
                ← Назад к инструментам
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center text-white font-bold">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{user.fullName || 'Пользователь'}</p>
                  <p className="text-amber-100 text-sm">{user.email || ''}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowHistory(true)}
                variant="outline"
                className="text-white hover:bg-amber-800 font-semibold bg-amber-600/10"
              >
                История
              </Button>
            </div>
          </div>

        <div className="grid lg:grid-cols-2 gap-8" style={{ border: 'none', outline: 'none' }}>
          {/* Input Form */}
          <Card className="bg-white/10 backdrop-blur-md" style={{ border: 'none', outline: 'none' }}>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Расчет для IPO</CardTitle>
                  <CardDescription className="text-amber-100 text-base">
                    Точный расчет количества юнитов для продажи
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <NumberInput 
                    id="currentUnits"
                    label="Текущее количество юнитов"
                    value={formData.currentUnits}
                    onChange={(value) => handleInputChange('currentUnits', value)}
                    placeholder="0"
                    step={0.01}
                    min={0}
                  />

                  <NumberInput 
                    id="purchasePrice"
                    label="Цена покупки юнита"
                    value={formData.purchasePrice}
                    onChange={(value) => handleInputChange('purchasePrice', value)}
                    placeholder="1000"
                    step={0.01}
                    min={0}
                    prefix="$"
                  />

                  <NumberInput 
                    id="currentPrice"
                    label="Текущая цена юнита"
                    value={formData.currentPrice}
                    onChange={(value) => handleInputChange('currentPrice', value)}
                    placeholder="0"
                    step={0.01}
                    min={0}
                    prefix="$"
                  />
                </div>

                <div className="space-y-6">
                  <div className="group">
                    <label className="text-white font-medium text-sm mb-3 block">
                      Комиссия от прибыли: <span className="text-yellow-300 font-bold">{formData.commissionRate}%</span>
                    </label>
                    <div className="relative">
                      <input 
                        id="commissionRate"
                        type="range"
                        min="0"
                        max="20"
                        step="5"
                        value={formData.commissionRate}
                        onChange={(e) => handleInputChange('commissionRate', parseInt(e.target.value))}
                        className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-white/70 mt-2 font-medium">
                        <span>0%</span>
                        <span>5%</span>
                        <span>10%</span>
                        <span>15%</span>
                        <span>20%</span>
                      </div>
                    </div>
                  </div>

                  <NumberInput 
                    id="targetAmount"
                    label="Нужная сумма на выходе"
                    value={formData.targetAmount}
                    onChange={(value) => handleInputChange('targetAmount', value)}
                    placeholder="0"
                    step={0.01}
                    min={0}
                    prefix="$"
                  />

                  <div className="bg-gradient-to-r from-yellow-500/20 to-amber-600/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-white font-medium text-sm">Пример расчета</span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Инвестор купил 1000 юнитов по $1000. Текущая цена $1050. 
                      При комиссии 15% нужно продать ~952 юнитов для получения нужной суммы.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-6">
                <Button 
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-semibold h-14 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleCalculate}
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Выполняем расчет...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      <span>Выполнить расчет</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {calculationResult && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 backdrop-blur-md" style={{ border: 'none', outline: 'none', boxShadow: 'none' }}>
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-yellow-500 rounded-xl shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    Результаты расчета
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-yellow-500/30 to-amber-500/30 rounded-2xl p-6 shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/90 font-medium text-lg">🎯 Нужно продать юнитов</p>
                      <div className="px-3 py-1 bg-yellow-500 rounded-full">
                        <span className="text-white font-bold text-sm">ТОЧНЫЙ РАСЧЕТ</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">
                      {calculationResult.unitsToSell.toFixed(2)} юнитов
                    </p>
                    <p className="text-amber-100 text-sm">
                      Общая сумма: {formatCurrency(calculationResult.totalAmount)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-amber-100 text-sm mb-1">Чистая прибыль</p>
                      <p className="text-xl font-bold text-green-400">{formatCurrency(calculationResult.netProfit)}</p>
                      <p className="text-xs text-green-400">{formatPercentage(calculationResult.profitPercentage)}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-amber-100 text-sm mb-1">Комиссия</p>
                      <p className="text-xl font-bold text-red-400">{formatCurrency(calculationResult.commissionAmount)}</p>
                      <p className="text-xs text-red-400">{formData.commissionRate}% от прибыли</p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-amber-100 text-sm mb-2">Остаток после продажи</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-semibold text-white">{calculationResult.remainingUnits.toFixed(2)} юнитов</p>
                        <p className="text-sm text-amber-100">{formatCurrency(calculationResult.remainingValue)}</p>
                      </div>
                      <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-amber-400" />
                      </div>
                    </div>
                  </div>

                  {calculationResult.recommendations.length > 0 && (
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-white font-medium mb-3 flex items-center gap-2">
                        <span className="text-amber-400">💡</span>
                        Рекомендации
                      </p>
                      <div className="space-y-2">
                        {calculationResult.recommendations.map((rec, index) => (
                          <p key={index} className="text-amber-100 text-sm leading-relaxed">
                            {rec}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
    )
  }

  // Заглушка для других разделов (пока не реализованы)
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 text-white p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="text-white hover:bg-amber-800 font-semibold bg-amber-600/10"
          >
            ← Назад к инструментам
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center text-white font-bold">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user.fullName || 'Пользователь'}</p>
              <p className="text-xs text-amber-100">{user.email || ''}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Раздел в разработке</h2>
          <p className="text-xl text-amber-100 mb-8">
            Этот раздел еще находится в разработке. Используйте IPO калькулятор для точных расчетов.
          </p>
          <Button
            onClick={() => handleSectionSelect('ipo')}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-semibold"
          >
            Перейти к IPO калькулятору
          </Button>
        </div>
      </div>
    </div>
  )
}
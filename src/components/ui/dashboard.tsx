'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  PiggyBank,
  Lock,
  Clock,
  Star
} from 'lucide-react'

interface User {
  id: string
  email?: string
  fullName?: string
}

interface DashboardProps {
  user: User
  onSectionSelect: (section: string) => void
  onLogout: () => void
}

export default function Dashboard({ user, onSectionSelect, onLogout }: DashboardProps) {
  const sections = [
    {
      id: 'ipo',
      title: 'Расчет IPO',
      description: 'Точный расчет количества юнитов для продажи с учетом комиссии',
      icon: Calculator,
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20',
      borderColor: 'border-yellow-500/30',
      active: true,
      features: ['Учет комиссии', 'Точные расчеты', 'История операций']
    },
    {
      id: 'investment',
      title: 'Инвестиционный калькулятор',
      description: 'Расчет доходности инвестиционных портфелей',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20',
      borderColor: 'border-blue-500/30',
      active: false,
      badge: 'Скоро',
      features: ['Прогноз доходности', 'Анализ рисков', 'Рекомендации']
    },
    {
      id: 'risk',
      title: 'Оценка рисков',
      description: 'Анализ и управление инвестиционными рисками',
      icon: BarChart3,
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-gradient-to-br from-red-500/20 to-pink-600/20',
      borderColor: 'border-red-500/30',
      active: false,
      badge: 'Скоро',
      features: ['VaR расчеты', 'Стресс-тесты', 'Мониторинг']
    },
    {
      id: 'compound',
      title: 'Сложный процент',
      description: 'Калькулятор сложного процента и реинвестирования',
      icon: PiggyBank,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-500/20 to-emerald-600/20',
      borderColor: 'border-green-500/30',
      active: false,
      badge: 'Скоро',
      features: ['Капитализация', 'Долгосрочное планирование', 'Графики роста']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center text-white font-bold">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{user.fullName || 'Пользователь'}</p>
                <p className="text-xs text-amber-100">{user.email || ''}</p>
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={onLogout} 
              className="text-white hover:bg-amber-800 font-semibold bg-amber-600/10"
            >
              Выйти
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Выберите инструмент</h2>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            Профессиональные калькуляторы для точных финансовых расчетов и анализа инвестиций
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Card 
                key={section.id}
                className={`
                  ${section.bgColor} backdrop-blur-md border-2 ${section.borderColor} 
                  transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                  ${section.active ? 'cursor-pointer hover:border-yellow-400/50' : 'cursor-not-allowed opacity-75'}
                  relative overflow-hidden
                `}
                onClick={() => section.active && onSectionSelect(section.id)}
              >
                {/* Badge for inactive sections */}
                {!section.active && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-amber-500/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-semibold text-white">{section.badge}</span>
                    </div>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`
                      p-3 bg-gradient-to-br ${section.color} rounded-xl shadow-lg
                      ${section.active ? '' : 'grayscale'}
                    `}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        {section.title}
                        {section.active && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-amber-100 text-sm mt-1">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {section.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {section.active ? (
                          <Star className="w-3 h-3 text-yellow-400" />
                        ) : (
                          <Lock className="w-3 h-3 text-gray-400" />
                        )}
                        <span className={section.active ? 'text-white/90' : 'text-gray-400'}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  {section.active ? (
                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-semibold"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSectionSelect(section.id)
                      }}
                    >
                      Открыть калькулятор
                    </Button>
                  ) : (
                    <div className="w-full bg-gray-600/20 border border-gray-500/30 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-sm font-medium">
                        {section.badge}
                      </p>
                    </div>
                  )}
                </CardContent>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-xl" />
              </Card>
            )
          })}
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl p-8 backdrop-blur-sm border border-amber-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">IPO Калькулятор</h3>
              <p className="text-amber-100">Текущий активный инструмент</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">15%</div>
              <div className="text-sm text-amber-100">Стандартная комиссия</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">0.01</div>
              <div className="text-sm text-amber-100">Точность расчетов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">24/7</div>
              <div className="text-sm text-amber-100">Доступность</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
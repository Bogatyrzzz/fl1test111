'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { History, Trash2, Calendar, DollarSign, TrendingUp, AlertCircle, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react'

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

interface CalculationHistoryProps {
  userId: string
  onClose: () => void
}

interface HistoryItem {
  id: string
  title: string
  inputData: any
  resultData: any
  status: string
  errorMessage?: string
  createdAt: string
}

export function CalculationHistory({ userId, onClose }: CalculationHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isClient) return // Не выполняем на сервере
    
    console.log('CalculationHistory useEffect triggered, userId:', userId)
    if (!userId) {
      console.log('No userId provided, skipping history fetch')
      return
    }
    fetchHistory()
  }, [userId, isClient])

  const fetchHistory = async () => {
    console.log('fetchHistory called')
    setIsLoading(true)
    setError('')
    
    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/calculations/history?userId=${userId}&type=ipo`)
      console.log('Fetch URL:', `${apiUrl}/api/calculations/history?userId=${userId}&type=ipo`)
      const data = await response.json()
      console.log('Fetch response:', data)
      
      if (data.success) {
        console.log('Setting history:', data.calculations)
        setHistory(data.calculations)
      } else {
        console.log('Fetch error:', data.error)
        setError(data.error || 'Ошибка при загрузке истории')
      }
    } catch (err) {
      console.error('Error fetching history:', err)
      setError('Ошибка соединения с сервером')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    
    // Используем универсальный формат чтобы избежать hydration mismatch
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${day}.${month}.${year} ${hours}:${minutes}`
  }

  const formatCurrency = (amount: number) => {
    // Используем универсальный формат чтобы избежать hydration mismatch
    const formatted = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
    
    // Заменяем символ рубля на $ если появится
    return formatted.replace('₽', '$')
  }

  const clearHistory = async () => {
    if (!confirm('Вы уверены, что хотите удалить всю историю расчетов?')) {
      return
    }

    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/calculations/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      
      if (data.success) {
        setHistory([])
      } else {
        setError(data.error || 'Ошибка при очистке истории')
      }
    } catch (err) {
      console.error('Error clearing history:', err)
      setError('Ошибка соединения с сервером')
    }
  }

  const updateTitle = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) {
      return
    }
    
    try {
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/calculations/update-title`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title: newTitle.trim() })
      })

      const data = await response.json()
      
      if (data.success) {
        setHistory(prev => prev.map(item => 
          item.id === id ? { ...item, title: newTitle.trim() } : item
        ))
        setEditingId(null)
        setEditingTitle('')
      } else {
        setError(data.error || 'Ошибка при обновлении названия')
      }
    } catch (err) {
      console.error('Error updating title:', err)
      setError('Ошибка соединения с сервером')
    }
  }

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id)
    setEditingTitle(currentTitle)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const saveEditing = (id: string) => {
    updateTitle(id, editingTitle)
  }

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 text-white p-4 flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 text-white p-4 flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <History className="w-8 h-8 text-yellow-400" />
            История расчетов IPO
          </h2>
          <Button
            onClick={onClose}
            variant="outline"
            className="text-white hover:bg-amber-800 font-semibold bg-amber-600/10"
          >
            Закрыть
          </Button>
        </div>

        {error && (
          <Card className="mb-6 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {history.length === 0 && !isLoading && !error && (
          <Card className="text-center py-12">
            <CardContent>
              <History className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
              <CardTitle className="text-xl font-semibold text-white mb-2">
                История пуста
              </CardTitle>
              <CardDescription className="text-amber-100">
                Вы еще не выполнили ни одного расчета. Начните с новой страницы расчетов.
              </CardDescription>
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
          <div className="grid gap-3">
            {history.map((item) => {
              const isExpanded = expandedItems.has(item.id)
              const isEditing = editingId === item.id
              
              return (
                <Card key={item.id} className="bg-white/10 backdrop-blur-md overflow-hidden">
                  {/* Компактный заголовок */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Стрелочка для развертывания */}
                        <div className="text-yellow-400 transition-transform duration-200">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                        
                        {/* Основная информация */}
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveEditing(item.id)
                                  } else if (e.key === 'Escape') {
                                    cancelEditing()
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 bg-white/20 rounded px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="Введите название"
                                autoFocus
                              />
                              <Button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  saveEditing(item.id)
                                }}
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white p-2 h-8"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  cancelEditing()
                                }}
                                size="sm"
                                className="bg-red-500 hover:bg-red-600 text-white p-2 h-8"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg font-semibold text-white">
                                {item.title}
                              </CardTitle>
                              <Button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditing(item.id, item.title)
                                }}
                                size="sm"
                                variant="ghost"
                                className="text-white/70 hover:text-white hover:bg-white/10 p-2 h-8"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          
                          {/* Дата и статус */}
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-sm text-amber-100">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(item.createdAt)}</span>
                            </div>
                            <Badge 
                              variant={item.status === 'completed' ? 'default' : 'destructive'}
                              className={item.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}
                            >
                              {item.status === 'completed' ? 'Выполнено' : 'Ошибка'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Ключевые результаты в компактном виде */}
                      {item.status === 'completed' && item.resultData && !isExpanded && (
                        <div className="text-right">
                          <div className="text-sm text-amber-100">Продать юнитов</div>
                          <div className="text-lg font-bold text-white">
                            {typeof item.resultData.unitsToSell === 'number' 
                              ? item.resultData.unitsToSell.toFixed(2) 
                              : parseFloat(item.resultData.unitsToSell || 0).toFixed(2)
                            }
                          </div>
                          <div className="text-sm text-green-400">
                            {formatCurrency(item.resultData.totalAmount || 0)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Развернутая детальная информация */}
                  {isExpanded && (
                    <CardContent className="px-4 pb-4 pt-0 space-y-4">
                      {/* Входные данные */}
                      <div className="bg-black/20 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-yellow-400" />
                          Входные данные
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-white/70">Текущие юниты:</span>
                            <span className="text-white font-medium ml-2">
                              {typeof item.inputData.currentUnits === 'number' 
                                ? item.inputData.currentUnits.toFixed(2) 
                                : parseFloat(item.inputData.currentUnits || 0).toFixed(2)
                              }
                            </span>
                          </div>
                          <div>
                            <span className="text-white/70">Цена покупки:</span>
                            <span className="text-white font-medium ml-2">
                              {formatCurrency(item.inputData.purchasePrice || 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/70">Текущая цена:</span>
                            <span className="text-white font-medium ml-2">
                              {formatCurrency(item.inputData.currentPrice || 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/70">Комиссия:</span>
                            <span className="text-white font-medium ml-2">
                              {item.inputData.commissionRate || 0}%
                            </span>
                          </div>
                          <div>
                            <span className="text-white/70">Целевая сумма:</span>
                            <span className="text-white font-medium ml-2">
                              {formatCurrency(item.inputData.targetAmount || 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Результаты расчета */}
                      {item.status === 'completed' && item.resultData ? (
                        <div className="bg-green-500/20 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-yellow-300" />
                            Результаты расчета
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-white/90">Продать юнитов:</span>
                              <span className="text-white font-medium ml-2">
                                {typeof item.resultData.unitsToSell === 'number' 
                                ? item.resultData.unitsToSell.toFixed(2) 
                                : parseFloat(item.resultData.unitsToSell || 0).toFixed(2)
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-white/90">Общая сумма:</span>
                              <span className="text-white font-medium ml-2">
                                {formatCurrency(item.resultData.totalAmount || 0)}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/90">Чистая прибыль:</span>
                              <span className="text-white font-medium ml-2">
                                {formatCurrency(item.resultData.netProfit || 0)}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/90">Комиссия:</span>
                              <span className="text-white font-medium ml-2">
                                {formatCurrency(item.resultData.commissionAmount || 0)}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/90">Остаток юнитов:</span>
                              <span className="text-white font-medium ml-2">
                                {typeof item.resultData.remainingUnits === 'number' 
                                ? item.resultData.remainingUnits.toFixed(2) 
                                : parseFloat(item.resultData.remainingUnits || 0).toFixed(2)
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-white/90">Остаточная стоимость:</span>
                              <span className="text-white font-medium ml-2">
                                {formatCurrency(item.resultData.remainingValue || 0)}
                              </span>
                            </div>
                          </div>

                          {item.resultData.recommendations && item.resultData.recommendations.length > 0 && (
                            <div className="mt-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg p-3">
                              <p className="text-white font-medium mb-2 flex items-center gap-2">
                                <span className="text-amber-400">💡</span>
                                Рекомендации
                              </p>
                              <div className="space-y-1">
                                {item.resultData.recommendations.map((rec, index) => (
                                  <p key={index} className="text-amber-100 text-sm leading-relaxed">
                                    {rec}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        item.status === 'error' && item.errorMessage && (
                          <div className="bg-red-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-400">
                              <AlertCircle className="w-4 h-4" />
                              <span className="font-medium">Ошибка расчета</span>
                            </div>
                            <p className="text-red-100 text-sm mt-2">{item.errorMessage}</p>
                          </div>
                        )
                      )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              onClick={clearHistory}
              variant="outline"
              className="text-white hover:bg-red-800 font-semibold bg-red-600/10"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Очистить историю
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
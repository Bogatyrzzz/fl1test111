import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

function calculateIPO(data: IPOCalculationData): IPOResult {
  const { currentUnits, purchasePrice, currentPrice, commissionRate, targetAmount } = data
  
  // Calculate profit per unit
  const profitPerUnit = currentPrice - purchasePrice
  
  // Calculate commission per unit (only on profit)
  const commissionPerUnit = profitPerUnit * (commissionRate / 100)
  
  // Net amount received per unit after commission
  const netAmountPerUnit = currentPrice - commissionPerUnit
  
  // Calculate how many units to sell to get target amount
  let unitsToSell = targetAmount / netAmountPerUnit
  
  // Ensure we don't sell more than we have
  if (unitsToSell > currentUnits) {
    unitsToSell = currentUnits
  }
  
  // Calculate totals
  const totalAmount = unitsToSell * netAmountPerUnit
  const grossProfit = unitsToSell * profitPerUnit
  const commissionAmount = unitsToSell * commissionPerUnit
  const netProfit = grossProfit - commissionAmount
  
  // Calculate remaining units and their value
  const remainingUnits = currentUnits - unitsToSell
  const remainingValue = remainingUnits * currentPrice
  
  // Calculate profit percentage based on purchase cost of sold units
  const purchaseCostOfSoldUnits = unitsToSell * purchasePrice
  const profitPercentage = ((netProfit) / purchaseCostOfSoldUnits) * 100
  
  // Generate recommendations
  const recommendations: string[] = []
  
  if (Math.abs(totalAmount - targetAmount) <= 1) {
    recommendations.push('✅ Отлично! Расчет точный с погрешностью до $1')
  } else if (totalAmount < targetAmount) {
    recommendations.push(`⚠️ Недостаточно средств. Необходимо еще $${(targetAmount - totalAmount).toFixed(2)}`)
  } else {
    recommendations.push(`💰 Превышение цели на $${(totalAmount - targetAmount).toFixed(2)}`)
  }
  
  if (remainingUnits > 0) {
    recommendations.push(`📊 Осталось ${remainingUnits.toFixed(2)} юнитов стоимостью ${formatCurrency(remainingValue)}`)
  } else {
    recommendations.push('🔄 Все юниты будут проданы')
  }
  
  if (commissionRate > 10) {
    recommendations.push(`💸 Высокая комиссия (${commissionRate}%) значительно снижает прибыль`)
  }
  
  if (profitPerUnit <= 0) {
    recommendations.push('⚠️ Текущая цена не выше цены покупки - нет прибыли')
  } else {
    recommendations.push(`📈 Прибыль на юнит: ${formatCurrency(profitPerUnit)}`)
  }
  
  const remainingPercentage = (remainingUnits / currentUnits) * 100
  if (remainingPercentage > 50) {
    recommendations.push('🎯 Сохраняется значительная часть инвестиций')
  }
  
  return {
    unitsToSell,
    grossProfit,
    commissionAmount,
    netProfit,
    totalAmount,
    remainingUnits,
    remainingValue,
    profitPercentage,
    recommendations
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

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
    
    const { userId, calculationData } = await request.json()

    if (!userId || !calculationData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers }
      )
    }

    // Validate user exists
    let user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers }
      )
    }

    // Perform calculation
    const result = calculateIPO(calculationData as IPOCalculationData)

    // Save calculation to database
    // Get the count of user's previous calculations to create a sequential number
    const previousCalculationsCount = await db.calculation.count({
      where: {
        userId,
        type: 'ipo'
      }
    })

    const calculationNumber = previousCalculationsCount + 1

    const calculation = await db.calculation.create({
      data: {
        userId,
        type: 'ipo',
        title: `IPO расчет #${calculationNumber}`,
        inputData: JSON.stringify(calculationData),
        resultData: JSON.stringify(result),
        status: 'completed'
      }
    })

    return NextResponse.json({
      success: true,
      calculationId: calculation.id,
      result
    }, { headers })

  } catch (error) {
    console.error('IPO calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    )
  }
}

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

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400, headers }
      )
    }

    const calculations = await db.calculation.findMany({
      where: {
        userId,
        type: 'ipo'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json({
      success: true,
      calculations: calculations.map(calc => ({
        id: calc.id,
        title: calc.title,
        createdAt: calc.createdAt,
        resultData: JSON.parse(calc.resultData)
      }))
    }, { headers })

  } catch (error) {
    console.error('Get IPO calculations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    )
  }
}
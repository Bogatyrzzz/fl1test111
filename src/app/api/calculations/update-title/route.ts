import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('Update title API called')
    
    const body = await request.json()
    console.log('Received data:', { body })

    const { id, title } = body

    if (!id || !title) {
      console.log('Missing id or title')
      return NextResponse.json(
        { error: 'ID and title are required' },
        { status: 400 }
      )
    }

    console.log('Updating calculation in database...')
    // Update calculation title
    const calculation = await db.calculation.update({
      where: { id },
      data: { 
        title
      }
    })

    console.log('Database update successful:', calculation)

    return NextResponse.json({
      success: true,
      calculation: {
        id: calculation.id,
        title: calculation.title
      }
    })

  } catch (error: any) {
    console.error('Update title error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error?.message || error.toString()) },
      { status: 500 }
    )
  }
}
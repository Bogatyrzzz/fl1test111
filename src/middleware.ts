import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Добавляем CORS заголовки для всех API запросов
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Разрешаем все источники для разработки
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200,
        headers: response.headers
      })
    }
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
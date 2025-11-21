import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeMap = {
    sm: { width: 120, height: 40 },
    md: { width: 180, height: 60 },
    lg: { width: 240, height: 80 }
  }

  const { width, height } = sizeMap[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">FL1</span>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-white font-bold text-xl">FRONTLINE</span>
        <span className="text-yellow-400 font-semibold text-sm tracking-wider">ONE</span>
      </div>
    </div>
  )
}
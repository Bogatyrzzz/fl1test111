'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface NumberInputProps {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  step?: number
  min?: number
  max?: number
  className?: string
  prefix?: string // Добавляем поддержку префикса
}

export function NumberInput({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  step = 0.01,
  min,
  max,
  className = "",
  prefix = "" // Добавляем префикс с пустым значением по умолчанию
}: NumberInputProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleIncrement = () => {
    const newValue = parseFloat((value + step).toFixed(10)) // Avoid floating point issues
    if (max !== undefined && newValue > max) return
    onChange(newValue)
  }

  const handleDecrement = () => {
    const newValue = parseFloat((value - step).toFixed(10)) // Avoid floating point issues
    if (min !== undefined && newValue < min) return
    onChange(newValue)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0
    if (min !== undefined && newValue < min) return
    if (max !== undefined && newValue > max) return
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleIncrement()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleDecrement()
    }
  }

  return (
    <div className="group">
      <Label htmlFor={id} className="text-white font-medium text-sm mb-2 block">
        {label}
      </Label>
      <div 
        className="number-input-wrapper relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 font-medium pointer-events-none z-10">
            {prefix}
          </div>
        )}
        <Input 
          id={id} 
          type="number"
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          className={`custom-number-input bg-white/10 text-white placeholder-white/50 focus:ring-yellow-400/20 h-12 text-lg rounded-xl transition-all duration-200 pr-12 ${prefix ? 'pl-8' : ''} ${className}`}
          value={value || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <div className="arrow-controls" style={{ opacity: isHovered ? 1 : 0 }}>
          <button 
            type="button"
            className="arrow-btn"
            onClick={handleIncrement}
            aria-label="Increase value"
            tabIndex={-1}
          >
            <ChevronUp />
          </button>
          <button 
            type="button"
            className="arrow-btn"
            onClick={handleDecrement}
            aria-label="Decrease value"
            tabIndex={-1}
          >
            <ChevronDown />
          </button>
        </div>
      </div>
    </div>
  )
}
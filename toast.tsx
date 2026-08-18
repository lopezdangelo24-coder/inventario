'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastTone = 'success' | 'info' | 'error'
export interface ToastState {
  id: number
  message: string
  tone: ToastTone
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((message: string, tone: ToastTone = 'info') => {
    if (timer.current) clearTimeout(timer.current)
    setToast({ id: Date.now(), message, tone })
    timer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  return { toast, show }
}

export function Toast({ toast }: { toast: ToastState | null }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (toast) setVisible(true)
  }, [toast])

  if (!toast) return null

  const config = {
    success: { icon: <CheckCircle2 className="size-5 text-gold-dark" />, ring: 'border-gold/50' },
    info: { icon: <Info className="size-5 text-foreground" />, ring: 'border-border' },
    error: { icon: <AlertCircle className="size-5 text-destructive" />, ring: 'border-destructive/40' },
  }[toast.tone]

  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-24 left-1/2 z-[60] flex w-[min(92vw,26rem)] -translate-x-1/2 items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-xl duration-200 animate-in fade-in slide-in-from-bottom-3 sm:bottom-6',
        config.ring,
        visible ? '' : 'opacity-0',
      )}
    >
      {config.icon}
      <p className="text-sm font-medium text-foreground text-pretty">{toast.message}</p>
    </div>
  )
}

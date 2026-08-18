'use client'

import { useEffect, useRef, useState } from 'react'
import { ScanLine, Keyboard } from 'lucide-react'
import { Modal } from './modal'
import { CameraScanner } from './camera-scanner'
import { cn } from '@/lib/utils'

type Mode = 'camera' | 'pistol'

/**
 * Modal de captura: cámara del iPhone o input autofocado para pistola USB/Bluetooth.
 * La pistola lectora escribe el código y envía "Enter" automáticamente.
 */
export function ScanModal({
  open,
  onClose,
  onCode,
}: {
  open: boolean
  onClose: () => void
  onCode: (code: string) => void
}) {
  const [mode, setMode] = useState<Mode>('pistol')
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setValue('')
      setMode('pistol')
    }
  }, [open])

  useEffect(() => {
    if (open && mode === 'pistol') {
      const t = setTimeout(() => inputRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
  }, [open, mode])

  function submit() {
    const code = value.trim()
    if (!code) return
    onCode(code)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Escanear código"
      description="Usa la cámara o dispara con la pistola lectora."
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <ModeButton
            active={mode === 'pistol'}
            onClick={() => setMode('pistol')}
            icon={<Keyboard className="size-4" />}
            label="Pistola / Manual"
          />
          <ModeButton
            active={mode === 'camera'}
            onClick={() => setMode('camera')}
            icon={<ScanLine className="size-4" />}
            label="Cámara"
          />
        </div>

        {mode === 'pistol' ? (
          <div className="flex flex-col gap-3">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  e.preventDefault()
                  submit()
                }
              }}
              inputMode="text"
              autoComplete="off"
              placeholder="Dispara la pistola o escribe SKU / código…"
              className="h-14 w-full rounded-xl border-2 border-gold bg-background px-4 text-center font-mono text-lg text-foreground outline-none ring-2 ring-gold/30 placeholder:text-sm placeholder:text-muted-foreground"
            />
            <p className="text-center text-xs text-muted-foreground">
              El campo está enfocado: la pistola USB/Bluetooth escribirá aquí y confirmará con Enter.
            </p>
            <button
              onClick={submit}
              disabled={!value.trim()}
              className="h-12 rounded-xl bg-gold-gradient font-display text-base font-bold text-gold-foreground shadow-sm transition-all hover:brightness-105 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
            >
              Buscar código
            </button>
          </div>
        ) : (
          <CameraScanner onDetected={onCode} />
        )}
      </div>
    </Modal>
  )
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all',
        active
          ? 'border-gold bg-gold/15 text-foreground'
          : 'border-border bg-background text-muted-foreground hover:bg-muted',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

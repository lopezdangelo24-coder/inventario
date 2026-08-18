'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, CameraOff } from 'lucide-react'

const REGION_ID = 'muscargo-qr-region'

/**
 * Escáner de cámara basado en html5-qrcode.
 * Lee QR y códigos de barras (EAN13, Code128, etc.) usando la cámara trasera.
 */
export function CameraScanner({ onDetected }: { onDetected: (code: string) => void }) {
  const [status, setStatus] = useState<'loading' | 'scanning' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const scannerRef = useRef<unknown>(null)
  const handledRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')
        if (cancelled) return
        const scanner = new Html5Qrcode(REGION_ID, {
          verbose: false,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.ITF,
          ],
        })
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 12, qrbox: { width: 250, height: 170 }, aspectRatio: 1.4 },
          (decodedText: string) => {
            if (handledRef.current) return
            handledRef.current = true
            onDetected(decodedText)
          },
          () => {},
        )
        if (!cancelled) setStatus('scanning')
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setErrorMsg(
          err instanceof Error
            ? 'No se pudo acceder a la cámara. Revisa los permisos o usa la pistola lectora.'
            : 'Cámara no disponible.',
        )
      }
    }

    start()

    return () => {
      cancelled = true
      const scanner = scannerRef.current as
        | { stop: () => Promise<void>; clear: () => void; getState?: () => number }
        | null
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {})
      }
    }
  }, [onDetected])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full overflow-hidden rounded-xl border border-border bg-primary/95">
        <div id={REGION_ID} className="[&_video]:!w-full [&_video]:!rounded-xl" />
        {status !== 'scanning' && (
          <div className="flex min-h-52 flex-col items-center justify-center gap-2 p-6 text-center text-primary-foreground">
            {status === 'loading' ? (
              <>
                <Loader2 className="size-6 animate-spin text-gold" />
                <p className="text-sm">Iniciando cámara…</p>
              </>
            ) : (
              <>
                <CameraOff className="size-6 text-gold" />
                <p className="text-sm text-pretty">{errorMsg}</p>
              </>
            )}
          </div>
        )}
        {status === 'scanning' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[170px] w-[250px] rounded-lg border-2 border-gold shadow-[0_0_0_9999px_oklch(0.16_0.01_260_/_0.35)]" />
          </div>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Apunta al código QR o de barras. La detección es automática.
      </p>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { ConfirmationDialog } from './ConfirmationDialog'

interface SensitiveValueDisplayProps {
  value: string
  label: string
  autoHideSeconds?: number
}

export function SensitiveValueDisplay({
  value,
  label,
  autoHideSeconds = 30,
}: SensitiveValueDisplayProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!isRevealed) return
    const timer = setTimeout(() => setIsRevealed(false), autoHideSeconds * 1000)
    return () => clearTimeout(timer)
  }, [isRevealed, autoHideSeconds])

  return (
    <div className="space-y-2">
      {isRevealed ? (
        <>
          <textarea
            readOnly
            value={value}
            rows={8}
            aria-label={label}
            className="w-full rounded border border-gray-300 bg-gray-50 p-2 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => setIsRevealed(false)}
            className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
          >
            Hide
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500">[HIDDEN - click Reveal to view]</p>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
          >
            Reveal
          </button>
        </>
      )}

      <ConfirmationDialog
        isOpen={showConfirm}
        title={`Reveal ${label}`}
        message={`This is a sensitive value. Are you sure you want to reveal it? It will be automatically hidden after ${autoHideSeconds} seconds.`}
        onConfirm={() => {
          setShowConfirm(false)
          setIsRevealed(true)
        }}
        onCancel={() => setShowConfirm(false)}
        isDangerous
        confirmLabel="Reveal"
      />
    </div>
  )
}

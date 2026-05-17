import { useState } from 'react'
import { ConfirmationDialog } from './ConfirmationDialog'

interface CopyButtonProps {
  value: string
  label?: string
  requireConfirmation?: boolean
  confirmationMessage?: string
}

export function CopyButton({
  value,
  label = 'Copy',
  requireConfirmation = false,
  confirmationMessage = 'Are you sure you want to copy this value to clipboard?',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const doCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClick = () => {
    if (requireConfirmation) {
      setShowConfirm(true)
    } else {
      doCopy()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
      >
        {copied ? 'Copied!' : label}
      </button>

      <ConfirmationDialog
        isOpen={showConfirm}
        title="Copy to Clipboard"
        message={confirmationMessage}
        onConfirm={() => {
          setShowConfirm(false)
          doCopy()
        }}
        onCancel={() => setShowConfirm(false)}
        isDangerous
        confirmLabel="Copy"
      />
    </>
  )
}

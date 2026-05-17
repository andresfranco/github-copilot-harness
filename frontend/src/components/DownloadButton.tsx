import { useState } from 'react'
import { ConfirmationDialog } from './ConfirmationDialog'

interface DownloadButtonProps {
  value: string
  filename: string
  mimeType?: string
  label?: string
  requireConfirmation?: boolean
  confirmationMessage?: string
}

export function DownloadButton({
  value,
  filename,
  mimeType = 'text/plain',
  label = 'Download',
  requireConfirmation = false,
  confirmationMessage = 'Are you sure you want to download this file?',
}: DownloadButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const doDownload = () => {
    const blob = new Blob([value], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClick = () => {
    if (requireConfirmation) {
      setShowConfirm(true)
    } else {
      doDownload()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
      >
        {label}
      </button>

      <ConfirmationDialog
        isOpen={showConfirm}
        title="Download File"
        message={confirmationMessage}
        onConfirm={() => {
          setShowConfirm(false)
          doDownload()
        }}
        onCancel={() => setShowConfirm(false)}
        isDangerous
        confirmLabel="Download"
      />
    </>
  )
}

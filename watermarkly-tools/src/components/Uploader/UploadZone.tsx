import { useState, useCallback, useRef, type DragEvent } from 'react'

interface UploadZoneProps {
  onFiles: (files: FileList) => void
  multiple?: boolean
  accept?: string
  title?: string
  subtitle?: string
}

export function UploadZone({
  onFiles,
  multiple = true,
  accept = 'image/*',
  title = 'Перетащите файлы сюда',
  subtitle = 'или нажмите для выбора',
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files)
    },
    [onFiles],
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragOver(false), [])

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
        ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
      <div className="text-gray-400 mb-2">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p className="text-gray-700 font-medium">{title}</p>
      <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
    </div>
  )
}

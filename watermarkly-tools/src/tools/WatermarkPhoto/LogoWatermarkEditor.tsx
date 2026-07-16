import type { LogoWatermark } from '../../types'
import { Slider } from '../../components/ui/Slider'
import { Button } from '../../components/ui/Button'
import { useRef } from 'react'

interface Props {
  logo: LogoWatermark | undefined
  onUpload: (file: File) => void
  onChange: (partial: Partial<LogoWatermark>) => void
  onRemove: () => void
}

export function LogoWatermarkEditor({ logo, onUpload, onChange, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
      />

      {!logo ? (
        <div className="text-center py-6">
          <Button onClick={() => inputRef.current?.click()}>
            Загрузить логотип
          </Button>
          <p className="text-xs text-gray-400 mt-2">PNG, JPG, WEBP</p>
        </div>
      ) : (
        <>
          <div className="relative inline-block mx-auto">
            <img src={logo.src} alt="logo" className="max-h-20 mx-auto rounded" />
            <button
              onClick={onRemove}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
            >
              ✕
            </button>
          </div>

          <Button variant="ghost" onClick={() => inputRef.current?.click()} className="w-full text-sm">
            Заменить логотип
          </Button>

          <Slider label="Масштаб" value={logo.scale} min={5} max={200} onChange={(scale) => onChange({ scale })} />
          <Slider label="Прозрачность" value={logo.opacity} min={0} max={100} onChange={(opacity) => onChange({ opacity })} />
          <Slider label="Поворот" value={logo.rotation} min={-180} max={180} onChange={(rotation) => onChange({ rotation })} />
        </>
      )}
    </div>
  )
}

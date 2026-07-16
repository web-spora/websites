import { useState, useCallback } from 'react'
import { UploadZone } from '../../components/Uploader/UploadZone'
import { useImageUpload } from '../../hooks/useImageUpload'
import { ImageGrid } from '../../components/Preview/ImageGrid'
import { Button } from '../../components/ui/Button'
import { loadImage, canvasToBlob } from '../../lib/canvas'
import { downloadAsZip } from '../../lib/export'

const FORMATS = [
  { value: 'jpeg', mime: 'image/jpeg', ext: 'jpg' },
  { value: 'png', mime: 'image/png', ext: 'png' },
  { value: 'webp', mime: 'image/webp', ext: 'webp' },
]

export function ConvertImage() {
  const { images, addFiles, removeImage, clearAll } = useImageUpload()
  const [target, setTarget] = useState('jpeg')
  const [processing, setProcessing] = useState(false)

  const fmt = FORMATS.find((f) => f.value === target)!

  const handleExport = useCallback(async () => {
    if (images.length === 0) return
    setProcessing(true)

    const items = await Promise.all(
      images.map(async (img) => {
        const image = await loadImage(img.src)
        const c = document.createElement('canvas')
        c.width = image.naturalWidth
        c.height = image.naturalHeight
        const ctx = c.getContext('2d')
        if (!ctx) return null
        ctx.drawImage(image, 0, 0)
        const blob = await canvasToBlob(c, fmt.mime, 0.92)
        return { name: img.name.replace(/\.[^/.]+$/, '') + '.' + fmt.ext, blob }
      }),
    )

    const valid = items.filter(Boolean) as { name: string; blob: Blob }[]
    await downloadAsZip(valid, 'converted_images.zip')
    setProcessing(false)
  }, [images, fmt])

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Конвертация форматов</h1>
        <p className="text-gray-500">Конвертируйте изображения в JPG, PNG, WEBP.</p>
      </div>
      <UploadZone onFiles={addFiles} />
      {images.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ImageGrid images={images} onRemove={removeImage} onClearAll={clearAll} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Целевой формат</h3>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.value.toUpperCase()}</option>
              ))}
            </select>
            <Button className="w-full" onClick={handleExport} disabled={processing}>
              {processing ? 'Обработка...' : 'Скачать'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

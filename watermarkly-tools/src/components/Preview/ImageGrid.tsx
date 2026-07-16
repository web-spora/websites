import type { ImageFile } from '../../types'
import { formatFileSize } from '../../lib/utils'

interface ImageGridProps {
  images: ImageFile[]
  onRemove: (id: string) => void
  onClearAll: () => void
  selectedId?: string
  onSelect?: (id: string) => void
}

export function ImageGrid({ images, onRemove, onClearAll, selectedId, onSelect }: ImageGridProps) {
  if (images.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          Загружено: {images.length} {images.length === 1 ? 'файл' : 'файлов'}
        </p>
        <button onClick={onClearAll} className="text-sm text-red-600 hover:text-red-700">
          Удалить все
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => onSelect?.(img.id)}
            className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer
              ${selectedId === img.id ? 'border-blue-500' : 'border-transparent'}`}
          >
            <img src={img.src} alt={img.name} className="w-full h-28 object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(img.id) }}
              className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
            >
              ✕
            </button>
            <div className="p-1.5">
              <p className="text-xs text-gray-700 truncate">{img.name}</p>
              <p className="text-xs text-gray-400">{img.width}×{img.height} · {formatFileSize(img.file.size)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

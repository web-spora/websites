import type { ExportSettings } from '../../types'
import { Slider } from '../ui/Slider'
import { Button } from '../ui/Button'

interface ExportPanelProps {
  settings: ExportSettings
  onChange: (settings: ExportSettings) => void
  onExport: () => void
  disabled?: boolean
}

const formats = [
  { value: 'original' as const, label: 'Исходный формат' },
  { value: 'jpeg' as const, label: 'JPEG' },
  { value: 'png' as const, label: 'PNG' },
  { value: 'webp' as const, label: 'WEBP' },
]

export function ExportPanel({ settings, onChange, onExport, disabled }: ExportPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Настройки экспорта</h3>

      <div>
        <label className="text-sm text-gray-700 mb-1 block">Формат</label>
        <select
          value={settings.format}
          onChange={(e) => onChange({ ...settings, format: e.target.value as ExportSettings['format'] })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {formats.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <Slider
        label="Качество"
        value={settings.quality}
        min={1}
        max={100}
        unit="%"
        onChange={(quality) => onChange({ ...settings, quality })}
      />

      <Button onClick={onExport} disabled={disabled} className="w-full">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Скачать все
      </Button>
    </div>
  )
}

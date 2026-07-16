import type { WatermarkPosition, TileSettings } from '../../types'
import { Toggle } from '../../components/ui/Toggle'
import { Button } from '../../components/ui/Button'
import { Slider } from '../../components/ui/Slider'

interface Props {
  position: WatermarkPosition
  autoScale: boolean
  onAutoScaleChange: (val: boolean) => void
  onChange: (partial: Partial<WatermarkPosition>) => void
}

const POSITIONS = [
  { value: 'top-left' as const, label: 'Верхний левый' },
  { value: 'top-right' as const, label: 'Верхний правый' },
  { value: 'center' as const, label: 'Центр' },
  { value: 'bottom-left' as const, label: 'Нижний левый' },
  { value: 'bottom-right' as const, label: 'Нижний правый' },
  { value: 'tile' as const, label: 'Сетка (tile)' },
]

export function PositionEditor({ position, autoScale, onAutoScaleChange, onChange }: Props) {
  const updateTile = (partial: Partial<TileSettings>) => {
    onChange({ tile: { ...position.tile!, ...partial } })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Позиция</h3>

      <Toggle label="Автопозиция" checked={position.auto} onChange={(auto) => onChange({ auto })} />
      <Toggle label="Автомасштаб" checked={autoScale} onChange={onAutoScaleChange} />

      {position.auto && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {POSITIONS.map((p) => (
              <Button
                key={p.value}
                variant={position.position === p.value ? 'primary' : 'secondary'}
                onClick={() => onChange({ position: p.value })}
                size="sm"
              >
                {p.label}
              </Button>
            ))}
          </div>

          {position.position === 'tile' && position.tile && (
            <div className="border-t border-gray-200 pt-3 space-y-3">
              <p className="text-sm font-medium text-gray-700">Настройки сетки</p>
              <Slider label="Колонок" value={position.tile.columns} min={1} max={10} unit="" onChange={(columns) => updateTile({ columns })} />
              <Slider label="Строк" value={position.tile.rows} min={1} max={10} unit="" onChange={(rows) => updateTile({ rows })} />
              <Slider label="Расст. по X" value={position.tile.spacingX} min={0} max={200} unit="px" onChange={(spacingX) => updateTile({ spacingX })} />
              <Slider label="Расст. по Y" value={position.tile.spacingY} min={0} max={200} unit="px" onChange={(spacingY) => updateTile({ spacingY })} />
              <Toggle label="Диагональное смещение" checked={position.tile.diagonal} onChange={(diagonal) => updateTile({ diagonal })} />
              {position.tile.diagonal && (
                <Slider label="Смещение" value={position.tile.diagonalOffset} min={10} max={100} unit="%" onChange={(diagonalOffset) => updateTile({ diagonalOffset })} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

import type { TextWatermark } from '../../types'
import { Slider } from '../../components/ui/Slider'
import { ColorPicker } from '../../components/ui/ColorPicker'
import { Toggle } from '../../components/ui/Toggle'

interface Props {
  text: TextWatermark
  onChange: (partial: Partial<TextWatermark>) => void
}

const FONTS = [
  'Arial', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 'Georgia',
  'Garamond', 'Courier New', 'Bradley Hand', 'Brush Script MT',
  'Impact', 'Comic Sans MS',
]

export function TextWatermarkEditor({ text, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-700 mb-1 block">Текст</label>
        <input
          type="text"
          value={text.text}
          onChange={(e) => onChange({ text: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Введите текст водяного знака"
        />
      </div>

      <div>
        <label className="text-sm text-gray-700 mb-1 block">Шрифт</label>
        <select
          value={text.font}
          onChange={(e) => onChange({ font: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <Toggle label="Жирный" checked={text.bold} onChange={(bold) => onChange({ bold })} />
        <Toggle label="Курсив" checked={text.italic} onChange={(italic) => onChange({ italic })} />
      </div>

      <Slider label="Размер" value={text.fontSize} min={1} max={20} step={0.5} onChange={(fontSize) => onChange({ fontSize })} />
      <Slider label="Прозрачность" value={text.opacity} min={0} max={100} onChange={(opacity) => onChange({ opacity })} />
      <Slider label="Поворот" value={text.rotation} min={-180} max={180} onChange={(rotation) => onChange({ rotation })} />

      <ColorPicker label="Цвет" value={text.color} onChange={(color) => onChange({ color })} />

      <Toggle label="Тень" checked={text.shadow} onChange={(shadow) => onChange({ shadow })} />
      {text.shadow && (
        <>
          <ColorPicker label="Цвет тени" value={text.shadowColor} onChange={(shadowColor) => onChange({ shadowColor })} />
          <Slider label="Размытие тени" value={text.shadowBlur} min={0} max={20} onChange={(shadowBlur) => onChange({ shadowBlur })} />
        </>
      )}

      <Toggle label="Фон" checked={text.background} onChange={(background) => onChange({ background })} />
      {text.background && (
        <>
          <ColorPicker label="Цвет фона" value={text.bgColor} onChange={(bgColor) => onChange({ bgColor })} />
          <Slider label="Отступ фона" value={text.bgPadding} min={0} max={20} onChange={(bgPadding) => onChange({ bgPadding })} />
        </>
      )}
    </div>
  )
}

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-9 h-9 p-0.5 border border-gray-300 rounded cursor-pointer"
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { loadTemplates, deleteTemplate, type WatermarkTemplate } from '../../lib/templates'

interface Props {
  onLoad: (template: WatermarkTemplate) => void
  onSave: (name: string) => void
}

export function TemplateManager({ onLoad, onSave }: Props) {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<WatermarkTemplate[]>([])

  useEffect(() => {
    if (open) setTemplates(loadTemplates())
  }, [open])

  const handleDelete = (id: string) => {
    deleteTemplate(id)
    setTemplates(loadTemplates())
  }

  return (
    <div className="relative">
      <Button variant="ghost" onClick={() => setOpen(!open)} className="w-full text-sm" size="sm">
        {open ? 'Скрыть шаблоны' : 'Шаблоны водяных знаков'}
      </Button>

      {open && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              id="template-name"
              placeholder="Название шаблона"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            />
            <Button
              size="sm"
              onClick={() => {
                const input = document.getElementById('template-name') as HTMLInputElement
                if (input.value.trim()) {
                  onSave(input.value.trim())
                  input.value = ''
                  setTemplates(loadTemplates())
                }
              }}
            >
              Сохранить
            </Button>
          </div>

          {templates.length === 0 ? (
            <p className="text-xs text-gray-400 text-center">Нет сохранённых шаблонов</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-white rounded px-2 py-1.5">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onLoad(t)}>
                      Загрузить
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)}>
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

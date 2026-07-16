import type { TextWatermark, WatermarkPosition } from '../types'

export interface WatermarkTemplate {
  id: string
  name: string
  text: TextWatermark
  logo?: string
  position: WatermarkPosition
  autoScale: boolean
  createdAt: number
}

const STORAGE_KEY = 'watermarkly_templates'

export function saveTemplate(template: Omit<WatermarkTemplate, 'id' | 'createdAt'>): void {
  const templates = loadTemplates()
  const id = Date.now().toString(36)
  templates.unshift({
    ...template,
    id,
    createdAt: Date.now(),
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.slice(0, 20)))
}

export function loadTemplates(): WatermarkTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function deleteTemplate(id: string): void {
  const templates = loadTemplates().filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

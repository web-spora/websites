import { useState, useCallback } from 'react'
import type { TextWatermark, LogoWatermark, WatermarkPosition, WatermarkConfig, ExportSettings } from '../types'

const DEFAULT_TEXT: TextWatermark = {
  text: '© Ваше имя',
  font: 'Arial',
  fontSize: 5,
  color: '#ffffff',
  opacity: 70,
  rotation: 0,
  shadow: true,
  shadowColor: '#000000',
  shadowBlur: 4,
  background: false,
  bgColor: '#000000',
  bgPadding: 4,
  bold: false,
  italic: false,
}

const DEFAULT_POSITION: WatermarkPosition = {
  x: 0.95,
  y: 0.95,
  auto: true,
  position: 'bottom-right',
  tile: { columns: 3, rows: 3, spacingX: 20, spacingY: 20, diagonal: false, diagonalOffset: 0 },
}

const DEFAULT_EXPORT: ExportSettings = {
  format: 'original',
  quality: 92,
  keepMetadata: false,
}

export function useWatermarkConfig() {
  const [text, setText] = useState<TextWatermark>(DEFAULT_TEXT)
  const [logo, setLogo] = useState<LogoWatermark | undefined>()
  const [position, setPosition] = useState<WatermarkPosition>(DEFAULT_POSITION)
  const [autoScale, setAutoScale] = useState(true)
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT)
  const [activeTab, setActiveTab] = useState<'text' | 'logo'>('text')

  const config: WatermarkConfig = { text, logo, position, autoScale }

  const updateText = useCallback((partial: Partial<TextWatermark>) => {
    setText((prev) => ({ ...prev, ...partial }))
  }, [])

  const updateLogo = useCallback(async (file: File) => {
    const src = URL.createObjectURL(file)
    const img = new Image()
    await new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.src = src
    })
    setLogo({ src, file, width: img.naturalWidth, height: img.naturalHeight, scale: 50, opacity: 70, rotation: 0 })
  }, [])

  const updateLogoConfig = useCallback((partial: Partial<LogoWatermark>) => {
    setLogo((prev) => (prev ? { ...prev, ...partial } : undefined))
  }, [])

  const removeLogo = useCallback(() => {
    if (logo) URL.revokeObjectURL(logo.src)
    setLogo(undefined)
  }, [logo])

  const updatePosition = useCallback((partial: Partial<WatermarkPosition>) => {
    setPosition((prev) => ({ ...prev, ...partial }))
  }, [])

  const resetConfig = useCallback(() => {
    setText(DEFAULT_TEXT)
    if (logo) URL.revokeObjectURL(logo.src)
    setLogo(undefined)
    setPosition(DEFAULT_POSITION)
    setAutoScale(true)
  }, [logo])

  return {
    text, logo, position, autoScale, config, exportSettings, activeTab,
    setAutoScale, setExportSettings, setActiveTab,
    updateText, updateLogo, updateLogoConfig, removeLogo, updatePosition, resetConfig,
  }
}

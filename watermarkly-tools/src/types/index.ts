export interface ImageFile {
  id: string
  file: File
  name: string
  src: string
  width: number
  height: number
}

export interface TextWatermark {
  text: string
  font: string
  fontSize: number
  color: string
  opacity: number
  rotation: number
  shadow: boolean
  shadowColor: string
  shadowBlur: number
  background: boolean
  bgColor: string
  bgPadding: number
  bold: boolean
  italic: boolean
}

export interface LogoWatermark {
  src: string
  file: File
  width: number
  height: number
  scale: number
  opacity: number
  rotation: number
}

export interface TileSettings {
  columns: number
  rows: number
  spacingX: number
  spacingY: number
  diagonal: boolean
  diagonalOffset: number
}

export interface WatermarkPosition {
  x: number
  y: number
  auto: boolean
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'tile'
  tile?: TileSettings
}

export interface WatermarkConfig {
  text?: TextWatermark
  logo?: LogoWatermark
  position: WatermarkPosition
  autoScale: boolean
}

export interface ExportSettings {
  format: 'original' | 'jpeg' | 'png' | 'webp'
  quality: number
  resize?: {
    width: number
    height: number
    maintainAspectRatio: boolean
  }
  rename?: string
  keepMetadata: boolean
}

export type ToolId =
  | 'watermark-photo'
  | 'watermark-pdf'
  | 'watermark-video'
  | 'add-text'
  | 'convert'

export interface ToolInfo {
  id: ToolId
  title: string
  description: string
  icon: string
  route: string
}

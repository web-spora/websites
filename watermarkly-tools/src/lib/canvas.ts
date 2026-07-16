import type { TextWatermark, LogoWatermark, WatermarkPosition } from '../types'

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function applyTextWatermark(
  ctx: CanvasRenderingContext2D,
  text: TextWatermark,
  imgWidth: number,
  imgHeight: number,
  position: WatermarkPosition,
) {
  ctx.save()

  const fontSize = Math.max(12, (text.fontSize / 100) * Math.min(imgWidth, imgHeight))
  ctx.font = `${text.italic ? 'italic ' : ''}${text.bold ? 'bold ' : ''}${fontSize}px "${text.font}"`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'

  const metrics = ctx.measureText(text.text)
  const textWidth = metrics.width
  const textHeight = fontSize

  const drawOne = (x: number, y: number) => {
    ctx.save()
    ctx.globalAlpha = text.opacity / 100
    ctx.translate(x, y)
    ctx.rotate((text.rotation * Math.PI) / 180)

    if (text.shadow) {
      ctx.shadowColor = text.shadowColor
      ctx.shadowBlur = text.shadowBlur
    }

    if (text.background) {
      const pad = text.bgPadding
      ctx.fillStyle = text.bgColor
      ctx.fillRect(-textWidth / 2 - pad, -textHeight / 2 - pad, textWidth + pad * 2, textHeight + pad * 2)
    }

    ctx.fillStyle = text.color
    ctx.fillText(text.text, 0, 0)

    if (text.shadow) {
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    }
    ctx.restore()
  }

  if (position.auto && position.position === 'tile') {
    const tile = position.tile || { columns: 3, rows: 3, spacingX: 20, spacingY: 20, diagonal: false, diagonalOffset: 0 }
    const cellW = (imgWidth + tile.spacingX) / tile.columns
    const cellH = (imgHeight + tile.spacingY) / tile.rows
    const startX = cellW / 2
    const startY = cellH / 2

    for (let row = 0; row < tile.rows; row++) {
      for (let col = 0; col < tile.columns; col++) {
        let x = startX + col * cellW
        let y = startY + row * cellH
        if (tile.diagonal) {
          const offset = (row % 2 === 0 ? 0 : tile.diagonalOffset) * cellW / 100
          x += offset
        }
        drawOne(x, y)
      }
    }
  } else {
    ctx.globalAlpha = text.opacity / 100
    const { x, y } = calcPosition(position, imgWidth, imgHeight, textWidth, textHeight)
    drawOne(x, y)
  }

  ctx.restore()
}

export function applyLogoWatermark(
  ctx: CanvasRenderingContext2D,
  logo: LogoWatermark,
  img: HTMLImageElement,
  imgWidth: number,
  imgHeight: number,
  position: WatermarkPosition,
) {
  const scale = logo.scale / 100
  const logoW = img.naturalWidth * scale
  const logoH = img.naturalHeight * scale

  const drawOne = (x: number, y: number) => {
    ctx.save()
    ctx.globalAlpha = logo.opacity / 100
    ctx.translate(x, y)
    ctx.rotate((logo.rotation * Math.PI) / 180)
    ctx.drawImage(img, -logoW / 2, -logoH / 2, logoW, logoH)
    ctx.restore()
  }

  if (position.auto && position.position === 'tile') {
    const tile = position.tile || { columns: 3, rows: 3, spacingX: 20, spacingY: 20, diagonal: false, diagonalOffset: 0 }
    const cellW = (imgWidth + tile.spacingX) / tile.columns
    const cellH = (imgHeight + tile.spacingY) / tile.rows
    const startX = cellW / 2
    const startY = cellH / 2

    for (let row = 0; row < tile.rows; row++) {
      for (let col = 0; col < tile.columns; col++) {
        let x = startX + col * cellW
        let y = startY + row * cellH
        if (tile.diagonal) {
          const offset = (row % 2 === 0 ? 0 : tile.diagonalOffset) * cellW / 100
          x += offset
        }
        drawOne(x, y)
      }
    }
  } else {
    const { x, y } = calcPosition(position, imgWidth, imgHeight, logoW, logoH)
    drawOne(x, y)
  }
}

function calcPosition(
  position: WatermarkPosition,
  imgWidth: number,
  imgHeight: number,
  objWidth: number,
  objHeight: number,
): { x: number; y: number } {
  const margin = Math.min(imgWidth, imgHeight) * 0.05

  if (position.auto) {
    switch (position.position) {
      case 'top-left':
        return { x: margin + objWidth / 2, y: margin + objHeight / 2 }
      case 'top-right':
        return { x: imgWidth - margin - objWidth / 2, y: margin + objHeight / 2 }
      case 'bottom-left':
        return { x: margin + objWidth / 2, y: imgHeight - margin - objHeight / 2 }
      case 'bottom-right':
        return { x: imgWidth - margin - objWidth / 2, y: imgHeight - margin - objHeight / 2 }
      case 'center':
        return { x: imgWidth / 2, y: imgHeight / 2 }
    }
  }

  return { x: position.x * imgWidth, y: position.y * imgHeight }
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else resolve(new Blob([]))
      },
      format,
      quality,
    )
  })
}

export function autoWatermarkColor(brightness: number): string {
  return brightness > 128 ? '#000000' : '#ffffff'
}

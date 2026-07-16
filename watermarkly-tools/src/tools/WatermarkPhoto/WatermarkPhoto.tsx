import { useRef, useCallback, useState, useEffect } from 'react'
import { useImageUpload } from '../../hooks/useImageUpload'
import { useWatermarkConfig } from '../../hooks/useWatermarkConfig'
import { UploadZone } from '../../components/Uploader/UploadZone'
import { ImageGrid } from '../../components/Preview/ImageGrid'
import { ExportPanel } from '../../components/ExportPanel/ExportPanel'
import { TextWatermarkEditor } from './TextWatermarkEditor'
import { LogoWatermarkEditor } from './LogoWatermarkEditor'
import { PositionEditor } from './PositionEditor'
import { Button } from '../../components/ui/Button'
import { applyTextWatermark, applyLogoWatermark, loadImage, canvasToBlob } from '../../lib/canvas'
import { downloadAsZip } from '../../lib/export'
import { saveTemplate, type WatermarkTemplate } from '../../lib/templates'
import { TemplateManager } from './TemplateManager'

export function WatermarkPhoto() {
  const { images, addFiles, removeImage, clearAll } = useImageUpload()
  const {
    text, logo, position, autoScale, exportSettings, activeTab, setActiveTab,
    updateText, updateLogo, updateLogoConfig, removeLogo, updatePosition, setAutoScale, setExportSettings,
  } = useWatermarkConfig()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [processing, setProcessing] = useState(false)

  const selectedImage = images.find((i) => i.id === selectedId) || images[0]

  const renderPreview = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !selectedImage) return

    const image = await loadImage(selectedImage.src)
    const maxW = 800
    const scale = Math.min(1, maxW / image.naturalWidth)
    canvas.width = image.naturalWidth * scale
    canvas.height = image.naturalHeight * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    if (text?.text) {
      applyTextWatermark(ctx, text, canvas.width, canvas.height, position)
    }
    if (logo?.src) {
      const logoImg = await loadImage(logo.src)
      applyLogoWatermark(ctx, logo, logoImg, canvas.width, canvas.height, position)
    }
  }, [selectedImage, text, logo, position])

  useEffect(() => {
    renderPreview()
  }, [renderPreview])

  const renderWatermarked = useCallback(async (imgSrc: string) => {
    const c = document.createElement('canvas')
    const image = await loadImage(imgSrc)
    c.width = image.naturalWidth
    c.height = image.naturalHeight
    const ctx = c.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(image, 0, 0)
    if (text?.text) applyTextWatermark(ctx, text, c.width, c.height, position)
    if (logo?.src) {
      const logoImg = await loadImage(logo.src)
      applyLogoWatermark(ctx, logo, logoImg, c.width, c.height, position)
    }
    return c
  }, [text, logo, position])

  const handleExport = useCallback(async () => {
    if (images.length === 0) return
    setProcessing(true)

    const formatMap: Record<string, string> = {
      original: 'image/png',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    }
    const ext = exportSettings.format === 'original' ? 'png' : exportSettings.format
    const mimeType = formatMap[exportSettings.format] || 'image/png'
    const quality = exportSettings.quality / 100

    const items = await Promise.all(
      images.map(async (img) => {
        const canvas = await renderWatermarked(img.src)
        if (!canvas) return null
        const blob = await canvasToBlob(canvas, mimeType, quality)
        const name = img.name.replace(/\.[^/.]+$/, '') + '_watermarked.' + ext
        return { name, blob }
      }),
    )

    const valid = items.filter(Boolean) as { name: string; blob: Blob }[]
    await downloadAsZip(valid, 'watermarked_images.zip')
    setProcessing(false)
  }, [images, renderWatermarked, exportSettings])

  const handleSaveTemplate = useCallback((name: string) => {
    saveTemplate({ name, text: text!, logo: undefined, position, autoScale })
  }, [text, position, autoScale])

  const handleLoadTemplate = useCallback((t: WatermarkTemplate) => {
    updateText(t.text)
    updatePosition(t.position)
    setAutoScale(t.autoScale)
  }, [updateText, updatePosition, setAutoScale])

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Водяной знак на фото</h1>
        <p className="text-gray-500">Добавьте текст или логотип на изображения. Пакетная обработка, без регистрации.</p>
      </div>

      <UploadZone onFiles={addFiles} />

      {images.length > 0 && (
        <>
          <ImageGrid
            images={images}
            onRemove={removeImage}
            onClearAll={clearAll}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-2 flex items-center justify-center">
                <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={activeTab === 'text' ? 'primary' : 'secondary'}
                    onClick={() => setActiveTab('text')}
                    className="flex-1"
                    size="sm"
                  >
                    Текст
                  </Button>
                  <Button
                    variant={activeTab === 'logo' ? 'primary' : 'secondary'}
                    onClick={() => setActiveTab('logo')}
                    className="flex-1"
                    size="sm"
                  >
                    Логотип
                  </Button>
                </div>

                {activeTab === 'text' && (
                  <TextWatermarkEditor text={text} onChange={updateText} />
                )}
                {activeTab === 'logo' && (
                  <LogoWatermarkEditor
                    logo={logo}
                    onUpload={updateLogo}
                    onChange={updateLogoConfig}
                    onRemove={removeLogo}
                  />
                )}
              </div>

              <TemplateManager onLoad={handleLoadTemplate} onSave={handleSaveTemplate} />

              <PositionEditor
                position={position}
                autoScale={autoScale}
                onAutoScaleChange={setAutoScale}
                onChange={updatePosition}
              />

              <ExportPanel
                settings={exportSettings}
                onChange={setExportSettings}
                onExport={handleExport}
                disabled={images.length === 0 || processing}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

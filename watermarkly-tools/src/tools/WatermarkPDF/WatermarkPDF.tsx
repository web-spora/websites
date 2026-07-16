import { useState, useCallback, useRef, useEffect } from 'react'
import { UploadZone } from '../../components/Uploader/UploadZone'
import { Button } from '../../components/ui/Button'
import { Slider } from '../../components/ui/Slider'
import { ColorPicker } from '../../components/ui/ColorPicker'
import { Toggle } from '../../components/ui/Toggle'
import { downloadAsZip } from '../../lib/export'
import { PDFDocument, rgb, StandardFonts, RotationTypes } from 'pdf-lib'

export function WatermarkPDF() {
  const [files, setFiles] = useState<File[]>([])
  const [text, setText] = useState('© Watermarkly Tools')
  const [opacity, setOpacity] = useState(30)
  const [color, setColor] = useState('#cccccc')
  const [fontSize, setFontSize] = useState(48)
  const [rotation, setRotation] = useState(-45)
  const [tileMode, setTileMode] = useState(false)
  const [columns, setColumns] = useState(3)
  const [rows, setRows] = useState(3)
  const [processing, setProcessing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const selectedFile = files[0] || null

  useEffect(() => {
    if (!selectedFile) return
    let cancelled = false

    const render = async () => {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs'

      const data = await selectedFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data }).promise
      if (cancelled) return
      const page = await pdf.getPage(1)
      if (cancelled) return

      const viewport = page.getViewport({ scale: 1.5 })
      const canvasEl = canvasRef.current
      if (!canvasEl) return
      canvasEl.width = viewport.width
      canvasEl.height = viewport.height
      await page.render({ canvas: canvasEl, viewport }).promise

      if (cancelled) return

      const ctx = canvasEl.getContext('2d')
      if (!ctx) return

      const hex = color.replace('#', '')
      const cr = parseInt(hex.substring(0, 2), 16)
      const cg = parseInt(hex.substring(2, 4), 16)
      const cb = parseInt(hex.substring(4, 6), 16)

      ctx.save()
      ctx.globalAlpha = opacity / 100
      ctx.font = `bold ${fontSize * 1.5}px Helvetica`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${opacity / 100})`

      if (tileMode) {
        const cellW = canvasEl.width / columns
        const cellH = canvasEl.height / rows
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < columns; col++) {
            ctx.save()
            ctx.translate(cellW * col + cellW / 2, cellH * row + cellH / 2)
            ctx.rotate((rotation * Math.PI) / 180)
            ctx.fillText(text, 0, 0)
            ctx.restore()
          }
        }
      } else {
        ctx.save()
        ctx.translate(canvasEl.width / 2, canvasEl.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.fillText(text, 0, 0)
        ctx.restore()
      }
      ctx.restore()
    }

    render()
    return () => { cancelled = true }
  }, [selectedFile, text, opacity, color, fontSize, rotation, tileMode, columns, rows])

  const handleExport = useCallback(async () => {
    if (files.length === 0) return
    setProcessing(true)

    const items = await Promise.all(
      files.map(async (file) => {
        const pdfBytes = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(pdfBytes)
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const pages = pdfDoc.getPages()

        const hex = color.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16) / 255
        const g = parseInt(hex.substring(2, 4), 16) / 255
        const b = parseInt(hex.substring(4, 6), 16) / 255

        for (const page of pages) {
          const { width, height } = page.getSize()

          if (tileMode) {
            const cellW = width / columns
            const cellH = height / rows
            for (let row = 0; row < rows; row++) {
              for (let col = 0; col < columns; col++) {
                page.drawText(text, {
                  x: cellW * col + cellW / 2,
                  y: height - (cellH * row + cellH / 2),
                  size: fontSize,
                  font,
                  color: rgb(r, g, b),
                  opacity: opacity / 100,
                  rotate: { angle: (rotation * Math.PI) / 180, type: RotationTypes.Degrees },
                })
              }
            }
          } else {
            page.drawText(text, {
              x: width / 2,
              y: height / 2,
              size: fontSize,
              font,
              color: rgb(r, g, b),
              opacity: opacity / 100,
              rotate: { angle: (rotation * Math.PI) / 180, type: RotationTypes.Degrees },
            })
          }
        }

        const modified = (await pdfDoc.save()).slice(0)
        const name = file.name.replace(/\.pdf$/i, '') + '_watermarked.pdf'
        return { name, blob: new Blob([modified], { type: 'application/pdf' }) }
      }),
    )

    const valid = items.filter(Boolean) as { name: string; blob: Blob }[]
    await downloadAsZip(valid, 'watermarked_pdfs.zip')
    setProcessing(false)
  }, [files, text, opacity, color, fontSize, rotation, tileMode, columns, rows])

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Водяной знак на PDF</h1>
        <p className="text-gray-500">Добавьте текстовый водяной знак на PDF-документы.</p>
      </div>

      <UploadZone
        onFiles={(fl) => setFiles((prev) => [...prev, ...Array.from(fl)])}
        accept=".pdf,application/pdf"
        title="Перетащите PDF-файлы сюда"
        subtitle="или нажмите для выбора"
      />

      {files.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-2">Загружено PDF: {files.length}</p>
              <ul className="space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="text-blue-500">📄</span> {f.name}
                    <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="ml-auto text-red-500 hover:text-red-700">✕</button>
                  </li>
                ))}
              </ul>
              <button onClick={() => setFiles([])} className="text-sm text-red-600 hover:text-red-700 mt-2">Очистить все</button>
            </div>

            {selectedFile && (
              <div className="bg-white rounded-xl border border-gray-200 p-2 flex items-center justify-center">
                <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg shadow-sm" />
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Настройки водяного знака</h3>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Текст</label>
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <Slider label="Размер шрифта" value={fontSize} min={12} max={120} unit="px" onChange={setFontSize} />
            <Slider label="Прозрачность" value={opacity} min={1} max={100} unit="%" onChange={setOpacity} />
            <Slider label="Поворот" value={rotation} min={-90} max={90} unit="°" onChange={setRotation} />
            <ColorPicker label="Цвет" value={color} onChange={setColor} />
            <Toggle label="Режим сетки (tile)" checked={tileMode} onChange={setTileMode} />
            {tileMode && (
              <div className="border-t border-gray-200 pt-2 space-y-2">
                <Slider label="Колонок" value={columns} min={1} max={8} unit="" onChange={setColumns} />
                <Slider label="Строк" value={rows} min={1} max={8} unit="" onChange={setRows} />
              </div>
            )}
            <Button className="w-full" onClick={handleExport} disabled={processing}>
              {processing ? 'Обработка...' : 'Скачать все'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

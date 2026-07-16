import { useState, useCallback, useRef } from 'react'
import { UploadZone } from '../../components/Uploader/UploadZone'
import { Button } from '../../components/ui/Button'
import { Slider } from '../../components/ui/Slider'
import { Toggle } from '../../components/ui/Toggle'
import { downloadAsZip } from '../../lib/export'

export function WatermarkVideo() {
  const [files, setFiles] = useState<File[]>([])
  const [text, setText] = useState('© Watermarkly Tools')
  const [tileMode, setTileMode] = useState(false)
  const [columns, setColumns] = useState(3)
  const [rows, setRows] = useState(3)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const ffRef = useRef<any>(null)

  const handleExport = useCallback(async () => {
    if (files.length === 0) return
    setProcessing(true)
    setMessage('Загрузка ffmpeg.wasm...')

    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util')

      const ff = new FFmpeg()
      ffRef.current = ff

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'
      await ff.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      const items: { name: string; blob: Blob }[] = []

      for (const file of files) {
        setMessage(`Обработка: ${file.name}`)
        const input = `input_${file.name}`
        const output = `output_${file.name}`

        await ff.writeFile(input, await fetchFile(file))

        let filter: string
        if (tileMode) {
          const filters: string[] = []
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
              filters.push(
                `drawtext=text='${text}':fontsize=24:fontcolor=white@0.5:x=${col > 0 ? `(w/2)+(${col}-${columns - 1})*w/${columns * 2}` : 'w/2 - w/' + (columns * 2)}:y=${row > 0 ? `(h/2)+(${row}-${rows - 1})*h/${rows * 2}` : 'h/2 - h/' + (rows * 2)}`,
              )
            }
          }
          filter = filters.join(',')
        } else {
          filter = `drawtext=text='${text}':fontsize=24:fontcolor=white@0.5:x=(w-text_w)/2:y=(h-text_h)/2`
        }

        await ff.exec(['-i', input, '-vf', filter, '-codec:a', 'copy', output])

        const data = await ff.readFile(output)
        const uint8 = data as Uint8Array
        items.push({
          name: file.name.replace(/\.[^/.]+$/, '') + '_watermarked.mp4',
          blob: new Blob([uint8.slice(0)], { type: 'video/mp4' }),
        })

        await ff.deleteFile(input)
        await ff.deleteFile(output)
      }

      await downloadAsZip(items, 'watermarked_videos.zip')
      setMessage('Готово!')
    } catch (e) {
      setMessage('Ошибка: ' + (e instanceof Error ? e.message : String(e)))
    }

    setProcessing(false)
  }, [files, text, tileMode, columns, rows])

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Водяной знак на видео</h1>
        <p className="text-gray-500">Добавьте текстовый водяной знак на видеофайлы.</p>
      </div>

      <UploadZone
        onFiles={(fl) => setFiles((prev) => [...prev, ...Array.from(fl)])}
        accept="video/*"
        title="Перетащите видеофайлы сюда"
        subtitle="или нажмите для выбора (MP4, AVI, MOV)"
      />

      {files.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-2">Загружено видео: {files.length}</p>
              <ul className="space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                    <span>🎬</span> {f.name}
                    <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="ml-auto text-red-500 hover:text-red-700">✕</button>
                  </li>
                ))}
              </ul>
              <button onClick={() => setFiles([])} className="text-sm text-red-600 hover:text-red-700 mt-2">Очистить все</button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Настройки</h3>
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Текст водяного знака</label>
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <Toggle label="Режим сетки (tile)" checked={tileMode} onChange={setTileMode} />
            {tileMode && (
              <div className="border-t border-gray-200 pt-2 space-y-2">
                <Slider label="Колонок" value={columns} min={1} max={5} unit="" onChange={setColumns} />
                <Slider label="Строк" value={rows} min={1} max={5} unit="" onChange={setRows} />
              </div>
            )}
            {message && <p className="text-sm text-gray-500">{message}</p>}
            <Button className="w-full" onClick={handleExport} disabled={processing}>
              {processing ? 'Обработка...' : 'Добавить водяной знак'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

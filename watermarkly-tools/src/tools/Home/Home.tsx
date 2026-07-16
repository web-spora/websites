import { Link } from 'react-router-dom'
import type { ToolInfo } from '../../types'

const tools: ToolInfo[] = [
  { id: 'watermark-photo', title: 'Водяной знак на фото', description: 'Добавьте текст или логотип на изображения. Пакетная обработка.', icon: '🖼️', route: '/watermark-photo' },
  { id: 'watermark-pdf', title: 'Водяной знак на PDF', description: 'Защитите PDF-документы водяными знаками.', icon: '📄', route: '/watermark-pdf' },
  { id: 'watermark-video', title: 'Водяной знак на видео', description: 'Добавьте водяной знак на видеофайлы.', icon: '🎬', route: '/watermark-video' },
  { id: 'add-text', title: 'Добавить текст на фото', description: 'Наложите текст на изображение.', icon: '✏️', route: '/add-text' },
  { id: 'convert', title: 'Конвертация форматов', description: 'Конвертируйте изображения в JPG, PNG, WEBP.', icon: '🔄', route: '/convert' },
]

export function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Инструменты для водяных знаков онлайн
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Бесплатные инструменты для нанесения водяных знаков на фото, PDF и видео.
          Вся обработка происходит в вашем браузере — ваши файлы остаются конфиденциальными.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            to={tool.route}
            className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">{tool.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{tool.title}</h3>
            <p className="text-sm text-gray-500">{tool.description}</p>
          </Link>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Почему стоит выбрать нас?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div>
            <div className="text-2xl mb-1">🔒</div>
            <h3 className="font-medium text-gray-900 text-sm">Конфиденциально</h3>
            <p className="text-xs text-gray-500">Обработка в браузере, файлы не отправляются на сервер</p>
          </div>
          <div>
            <div className="text-2xl mb-1">⚡</div>
            <h3 className="font-medium text-gray-900 text-sm">Бесплатно</h3>
            <p className="text-xs text-gray-500">Все инструменты бесплатны, без регистрации</p>
          </div>
          <div>
            <div className="text-2xl mb-1">📦</div>
            <h3 className="font-medium text-gray-900 text-sm">Пакетная обработка</h3>
            <p className="text-xs text-gray-500">Обрабатывайте множество файлов за один раз</p>
          </div>
        </div>
      </div>
    </div>
  )
}

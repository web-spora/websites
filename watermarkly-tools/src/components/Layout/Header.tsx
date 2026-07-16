import { Link } from 'react-router-dom'

const tools = [
  { label: 'Водяной знак на фото', route: '/watermark-photo' },
  { label: 'Водяной знак на PDF', route: '/watermark-pdf' },
  { label: 'Водяной знак на видео', route: '/watermark-video' },
  { label: 'Добавить текст', route: '/add-text' },
  { label: 'Конвертация', route: '/convert' },
]

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-xl font-bold text-blue-600 whitespace-nowrap">
            Watermarkly Tools
          </Link>
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {tools.map((t) => (
              <Link
                key={t.route}
                to={t.route}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors whitespace-nowrap"
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

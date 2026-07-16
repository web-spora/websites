export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-sm text-gray-500">
          <p className="mb-2">Все инструменты работают полностью в вашем браузере. Ваши файлы никуда не отправляются.</p>
          <p>&copy; {new Date().getFullYear()} Watermarkly Tools</p>
        </div>
      </div>
    </footer>
  )
}

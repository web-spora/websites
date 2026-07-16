import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Home } from './tools/Home/Home'
import { WatermarkPhoto } from './tools/WatermarkPhoto/WatermarkPhoto'
import { WatermarkPDF } from './tools/WatermarkPDF/WatermarkPDF'
import { WatermarkVideo } from './tools/WatermarkVideo/WatermarkVideo'
import { AddTextToPhoto } from './tools/AddTextToPhoto/AddTextToPhoto'
import { ConvertImage } from './tools/ConvertImage/ConvertImage'

export default function App() {
  return (
    <BrowserRouter basename="/watermarkly-tools">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="watermark-photo" element={<WatermarkPhoto />} />
          <Route path="watermark-pdf" element={<WatermarkPDF />} />
          <Route path="watermark-video" element={<WatermarkVideo />} />
          <Route path="add-text" element={<AddTextToPhoto />} />
          <Route path="convert" element={<ConvertImage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

import { useState, useCallback } from 'react'
import type { ImageFile } from '../types'
import { generateId } from '../lib/utils'

export function useImageUpload() {
  const [images, setImages] = useState<ImageFile[]>([])

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'))
    const newImages: ImageFile[] = []

    for (const file of fileArray) {
      const id = generateId()
      const src = URL.createObjectURL(file)
      const img = new Image()
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.src = src
      })
      newImages.push({ id, file, name: file.name, src, width: img.width, height: img.height })
    }

    setImages((prev) => [...prev, ...newImages])
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img) URL.revokeObjectURL(img.src)
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  const clearAll = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.src))
    setImages([])
  }, [images])

  return { images, addFiles, removeImage, clearAll }
}

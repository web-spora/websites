import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export async function downloadAsZip(
  blobs: { name: string; blob: Blob }[],
  zipName = 'images.zip',
) {
  if (blobs.length === 1) {
    saveAs(blobs[0].blob, blobs[0].name)
    return
  }

  const zip = new JSZip()
  for (const { name, blob } of blobs) {
    zip.file(name, blob)
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, zipName)
}

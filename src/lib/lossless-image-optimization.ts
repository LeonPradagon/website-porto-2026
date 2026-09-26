export async function optimizePngLosslessly(file: File): Promise<File> {
  if (file.type !== 'image/png') return file

  const { optimise } = await import('@jsquash/oxipng')
  const optimized = await optimise(await file.arrayBuffer(), {
    level: 3,
    optimiseAlpha: false,
  })

  if (optimized.byteLength >= file.size) return file
  return new File([optimized], file.name, { type: file.type, lastModified: file.lastModified })
}

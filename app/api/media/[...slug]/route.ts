import { NextResponse } from 'next/server'
import path from 'path'
import { readFile } from 'fs/promises'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    // Await params in Next.js 16
    const { slug } = await params

    // slug = ['lib-data', 'Wall posters', 'image.jpg']
    const [source, ...pathSegments] = slug

    if (source !== 'lib-data' || pathSegments.length < 2) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const categoryDir = decodeURIComponent(pathSegments[0])
    const filename = decodeURIComponent(pathSegments.slice(1).join('/'))

    // Security: prevent directory traversal
    if (categoryDir.includes('..') || filename.includes('..')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'lib', 'data', categoryDir, filename)
    const fileBuffer = await readFile(filePath)

    // Determine MIME type
    const ext = path.extname(filename).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.avif': 'image/avif',
    }

    const mimeType = mimeTypes[ext] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Media route error:', error)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}

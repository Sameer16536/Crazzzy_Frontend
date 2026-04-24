import { NextResponse } from 'next/server'
import path from 'path'
import { readdir } from 'fs/promises'
import { products as seededProducts } from '@/lib/data/products'
import { categories as seededCategories } from '@/lib/data/categories'

export const runtime = 'nodejs'

function slugify(input: string) {
  return input.trim().toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

async function listCategoryImages(categoryDir: string) {
  const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'])
  try {
    const entries = await readdir(categoryDir, { withFileTypes: true })
    return entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((n) => exts.has(path.extname(n).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
  } catch {
    return []
  }
}

export async function GET() {
  const baseDir = path.join(process.cwd(), 'lib', 'data')
  const entries = await readdir(baseDir, { withFileTypes: true })
  
  // Key: original folder name (case-insensitive for easy lookup)
  const folderImagesMap = new Map<string, { originalName: string, images: string[] }>()

  for (const e of entries) {
    if (e.isDirectory()) {
      const slug = slugify(e.name)
      folderImagesMap.set(slug, { originalName: e.name, images: await listCategoryImages(path.join(baseDir, e.name)) })
      // also map by exact lowercase string and decoded string just in case
      folderImagesMap.set(e.name.toLowerCase(), { originalName: e.name, images: await listCategoryImages(path.join(baseDir, e.name)) })
    }
  }

  // Intercept categories and products from the static files and fix their mock images ('1.jpg' -> Actual Long Filename)
  const resolvedCategories = seededCategories.map(cat => {
    // try to find by the image string first: '/api/media/lib-data/Folder Name/1.jpg'
    const decodedUrl = decodeURIComponent(cat.image)
    const pathMatch = decodedUrl.match(/\/lib-data\/([^\/]+)\/(\d+)\.jpg$/i)
    
    let resolvedImage = cat.image
    if (pathMatch) {
      const folderKey = pathMatch[1].toLowerCase()
      const index = Math.max(0, parseInt(pathMatch[2]) - 1)
      const folderData = folderImagesMap.get(folderKey)
      if (folderData && folderData.images[index]) {
        resolvedImage = `/api/media/lib-data/${encodeURIComponent(folderData.originalName)}/${encodeURIComponent(folderData.images[index])}`
      }
    }
    return { ...cat, image: resolvedImage }
  })

  const resolvedProducts = seededProducts.map(prod => {
    const resolvedProdImages = prod.images.map(img => {
      const decodedImg = decodeURIComponent(img)
      const folderMatch = decodedImg.match(/\/lib\/data\/([^\/]+)\/(\d+)\.jpg$/i) || decodedImg.match(/\/lib-data\/([^\/]+)\/(\d+)\.jpg$/i)
      
      if (folderMatch) {
         const folderKey = folderMatch[1].toLowerCase()
         const fileIndex = Math.max(0, parseInt(folderMatch[2]) - 1)
         const folderData = folderImagesMap.get(folderKey)
         
         if (folderData && folderData.images[fileIndex]) {
            return `/api/media/lib-data/${encodeURIComponent(folderData.originalName)}/${encodeURIComponent(folderData.images[fileIndex])}`
         }
      }
      return img
    })

    return { ...prod, images: resolvedProdImages }
  })

  return NextResponse.json({
    categories: resolvedCategories.sort((a, b) => a.name.localeCompare(b.name)),
    products: resolvedProducts,
  })
}


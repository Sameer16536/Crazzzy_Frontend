'use client'

import { useState, useEffect, FormEvent, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Package, Layers, Info, Upload, X, Loader2, ImagePlus } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { resolveImageUrl } from '@/lib/catalog/catalog-context'

interface Category {
  id: number
  name: string
  slug: string
  parentId?: number | null
  subcategories?: Category[]
}

interface FormData {
  title: string
  description: string
  sku: string
  categoryId: string
  price: string
  originalPrice: string
  stock: string
  tags: string
  isFeatured: boolean
  isDealOfTheDay: boolean
  isActive: boolean
  variants: { variantName: string; price: string; stock: string; isDefault?: boolean }[]
}

// Existing images from Cloudinary (URL based)
interface ExistingImage {
  id?: number
  imageUrl: string
  publicId?: string
}

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  // IDs of existing images staged for deletion — actual delete happens only on "Update Product"
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([])

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    sku: '',
    categoryId: '',
    price: '',
    originalPrice: '',
    stock: '',
    tags: '',
    isFeatured: false,
    isDealOfTheDay: false,
    isActive: true,
    variants: [],
  })

  // Existing images (already uploaded to Cloudinary, shown in edit mode)
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  // New local files chosen by the admin (not yet uploaded)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([])

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true)

      // 1. Fetch Categories
      const catRes = await api.get<any>('/categories')
      const allCats = Array.isArray(catRes?.data) ? catRes.data : (Array.isArray(catRes) ? catRes : [])
      const mainCategories = allCats.filter((c: any) => !c.parentId)
      const categoriesWithSubs = mainCategories.map((main: any) => ({
        ...main,
        subcategories: allCats.filter((c: any) => c.parentId === main.id),
      }))
      setCategories(categoriesWithSubs)

      // 2. Fetch Product if in Edit Mode
      if (productId) {
        const prodRes = await api.get<any>(`/admin/products/${productId}`)
        const product = prodRes?.data || prodRes

        setFormData({
          title: product.title || '',
          description: product.description || '',
          sku: product.sku || '',
          categoryId: String(product.categoryId || ''),
          price: String(product.price || ''),
          originalPrice: String(product.originalPrice || ''),
          stock: String(product.stock || ''),
          tags: Array.isArray(product.tags) ? product.tags.map((t: any) => t.name).join(', ') : '',
          isFeatured: !!product.isFeatured,
          isDealOfTheDay: !!product.isDealOfTheDay,
          isActive: product.isActive !== false,
          variants: (() => {
            let foundDefault = false
            const parsed = Array.isArray(product.variants)
              ? product.variants.map((v: any) => {
                  const isDefault = !foundDefault && Number(v.additionalPrice || 0) === 0
                  if (isDefault) foundDefault = true
                  return {
                    variantName: v.variantName,
                    price: isDefault ? String(product.price) : String(Number(product.price || 0) + Number(v.additionalPrice || 0)),
                    stock: isDefault ? String(product.stock) : String(v.stock || '0'),
                    isDefault
                  }
                })
              : []
            if (parsed.length > 0 && !foundDefault) {
              parsed[0].isDefault = true
            }
            return parsed
          })(),
        })

        // Load existing images
        const imgs: ExistingImage[] = Array.isArray(product.images) && product.images.length > 0
          ? product.images.map((img: any) => ({ id: img.id, imageUrl: img.imageUrl, publicId: img.publicId }))
          : product.imageUrl
            ? [{ imageUrl: product.imageUrl, publicId: product.publicId }]
            : []
        setExistingImages(imgs)
      }
    } catch (error) {
      console.error('Error initializing form:', error)
      toast.error('Failed to load product data')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      newFilePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [newFilePreviews])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return

    const totalImages = existingImages.length + newFiles.length + selected.length
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed per product')
      return
    }

    // Enforce 5MB limit per file (as described in the dropzone placeholder text)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const oversizedFiles = selected.filter(f => f.size > MAX_SIZE)
    if (oversizedFiles.length > 0) {
      toast.error(`The following files exceed the 5MB size limit: ${oversizedFiles.map(f => f.name).join(', ')}`)
      return
    }

    const previews = selected.map(f => URL.createObjectURL(f))
    setNewFiles(prev => [...prev, ...selected])
    setNewFilePreviews(prev => [...prev, ...previews])

    // Reset input so same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Stage an existing image for deletion (does NOT call backend yet)
  const stageImageForDeletion = (img: ExistingImage) => {
    if (!img.id) return
    setImagesToDelete(prev => [...prev, img.id!])
  }

  // Undo a staged deletion
  const unstageImageDeletion = (img: ExistingImage) => {
    if (!img.id) return
    setImagesToDelete(prev => prev.filter(id => id !== img.id))
  }

  const removeNewFile = (index: number) => {
    URL.revokeObjectURL(newFilePreviews[index])
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setNewFilePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (existingImages.length === 0 && newFiles.length === 0) {
      toast.error('Please upload at least one product image')
      return
    }

    setSubmitting(true)
    try {
      // 1. Delete any staged images first (backend: DB + Cloudinary)
      if (productId && imagesToDelete.length > 0) {
        await Promise.all(
          imagesToDelete.map(imgId =>
            api.delete(`/admin/products/${productId}/images/${imgId}`).catch(() => { })
          )
        )
      }

      // 2. Build FormData — required for multipart file upload
      const fd = new FormData()

      // Text fields
      fd.append('title', formData.title)
      fd.append('description', formData.description)
      fd.append('categoryId', formData.categoryId)
      fd.append('price', formData.price)
      if (formData.originalPrice) fd.append('originalPrice', formData.originalPrice)
      fd.append('stock', formData.stock)
      fd.append('tags', formData.tags)
      fd.append('isFeatured', String(formData.isFeatured))
      fd.append('isDealOfTheDay', String(formData.isDealOfTheDay))
      fd.append('isActive', String(formData.isActive))

      // Calculate under-the-hood additionalPrice (variantPrice - basePrice) for the database/backend
      const basePrice = parseFloat(formData.price) || 0
      const baseStock = parseInt(formData.stock, 10) || 0
      const formattedVariants = formData.variants.map(v => {
        if (v.isDefault) {
          return {
            variantName: v.variantName,
            additionalPrice: 0,
            stock: baseStock
          }
        }
        const variantPrice = v.price ? (parseFloat(v.price) || 0) : basePrice
        const variantStock = v.stock ? (parseInt(v.stock, 10) || 0) : baseStock
        return {
          variantName: v.variantName,
          additionalPrice: variantPrice - basePrice,
          stock: variantStock
        }
      })
      fd.append('variants', JSON.stringify(formattedVariants))

      // Attach new image files under field name "images" (matches backend: upload.array('images', 5))
      newFiles.forEach(file => fd.append('images', file))

      // Determine the Cloudinary folder path based on category hierarchy
      let folderPath = 'uploads'
      const catId = Number(formData.categoryId)
      for (const main of categories) {
        if (main.id === catId) {
          folderPath = main.slug
          break
        }
        const sub = main.subcategories?.find(s => s.id === catId)
        if (sub) {
          folderPath = `${main.slug}/${sub.slug}`
          break
        }
      }
      fd.append('categorySlug', folderPath)

      if (productId) {
        // PUT /admin/products/:id — backend uses upload.array('images', 5) + productUpdateValidation
        await api.uploadPut<any>(`/admin/products/${productId}`, fd)
        toast.success('Product updated successfully!')
      } else {
        // POST /admin/products — backend uses upload.array('images', 5) + productCreateValidation
        await api.upload<any>('/admin/products', fd)
        toast.success('Product created successfully!')
      }

      router.push('/admin/products')
    } catch (error: any) {
      console.error('Submit error:', error)
      const msg = error.message || ''
      if (msg.toLowerCase().includes('slug') || msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('similar title')) {
        toast.error('A product with a very similar title already exists. Try using a slightly different name.')
      } else {
        toast.error(msg || 'Failed to save product')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    let val: any = value
    if (type === 'checkbox') {
      val = (e.target as HTMLInputElement).checked
    }
    
    setFormData(prev => {
      const updated = { ...prev, [name]: val }
      if (name === 'price' || name === 'stock') {
        updated.variants = prev.variants.map(v => {
          if (v.isDefault) {
            return { ...v, [name === 'price' ? 'price' : 'stock']: val }
          }
          return v
        })
      }
      return updated
    })
  }

  const isPosterCategory = () => {
    if (!formData.categoryId) return false
    const mainCat = categories.find(
      c => c.id === Number(formData.categoryId) || c.subcategories?.some(sub => sub.id === Number(formData.categoryId))
    )
    return mainCat?.slug === 'wall-posters' || mainCat?.slug === 'sports'
  }

  const addVariant = () => {
    setFormData(prev => {
      const isDefault = prev.variants.length === 0
      return {
        ...prev,
        variants: [
          ...prev.variants,
          {
            variantName: '',
            price: isDefault ? prev.price : '0',
            stock: isDefault ? prev.stock : '100',
            isDefault
          }
        ]
      }
    })
  }

  const removeVariant = (index: number) => {
    setFormData(prev => {
      const wasDefault = prev.variants[index]?.isDefault
      const filtered = prev.variants.filter((_, i) => i !== index)
      if (wasDefault && filtered.length > 0) {
        filtered[0].isDefault = true
        filtered[0].price = prev.price
        filtered[0].stock = prev.stock
      }
      return { ...prev, variants: filtered }
    })
  }

  const setDefaultVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => ({
        ...v,
        isDefault: i === index,
        price: i === index ? prev.price : v.price,
        stock: i === index ? prev.stock : v.stock,
      })),
    }))
  }

  const updateVariant = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }))
  }

  // Images staged for deletion don't count toward the product (for validation purposes)
  const activeExistingCount = existingImages.filter(img => !img.id || !imagesToDelete.includes(img.id)).length
  const totalImageCount = activeExistingCount + newFiles.length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      {/* Main Fields */}
      <div className="lg:col-span-2 space-y-8">

        {/* Basic Information */}
        <div className="bg-card border border-border p-8 space-y-8 rounded-xl shadow-sm">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-lg">
              <Info size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Basic Information</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Product name, description and category</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Product Title *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g. Anime Wall Poster"
                className="w-full bg-background border border-border px-6 py-4 text-xs font-bold uppercase tracking-widest focus:border-primary/40 transition-all outline-none rounded-lg text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Tell your customers about this product..."
                className="w-full bg-background border border-border px-6 py-4 text-xs font-medium focus:border-primary/40 transition-all outline-none resize-none rounded-lg text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Tags (Comma separated)</label>
              <input
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="anime, posters, decoration"
                className="w-full bg-background border border-border px-6 py-4 text-xs font-bold uppercase tracking-widest focus:border-primary/40 transition-all outline-none rounded-lg text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-background border border-border px-6 py-4 text-xs font-black uppercase tracking-widest focus:border-primary/40 transition-all outline-none appearance-none rounded-lg text-foreground"
                >
                  <option value="">Select a category</option>
                  {categories.map(main => (
                    <optgroup key={main.id} label={main.name.toUpperCase()} className="bg-background text-foreground">
                      <option value={main.id}>{main.name} (Parent)</option>
                      {main.subcategories?.map(sub => (
                        <option key={sub.id} value={sub.id}>└─ {sub.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-card border border-border p-8 space-y-8 rounded-xl shadow-sm">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-lg">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Pricing & Inventory</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Manage your margins and stock</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Sale Price *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-mono font-bold">₹</span>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min={0}
                  className="w-full bg-background border border-border pl-10 pr-6 py-4 text-xs font-mono font-bold focus:border-primary/40 transition-all outline-none rounded-lg text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Regular Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">₹</span>
                <input
                  name="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  min={0}
                  className="w-full bg-background border border-border pl-10 pr-6 py-4 text-xs font-mono font-bold focus:border-primary/40 transition-all outline-none rounded-lg text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">Stock Level *</label>
              <input
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min={0}
                className="w-full bg-background border border-border px-6 py-4 text-xs font-mono font-bold focus:border-primary/40 transition-all outline-none rounded-lg text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Variant Manager */}
        {isPosterCategory() && (
          <div className="bg-card border border-border p-8 space-y-8 rounded-xl shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-lg">
                  <Layers size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Variants Manager</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Manage size options and pricing</p>
                </div>
              </div>
              <Button type="button" onClick={addVariant} variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/50 text-primary hover:bg-primary/10">
                + Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {formData.variants.length === 0 ? (
                <div className="p-8 border border-dashed border-border bg-muted/10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No variants configured. Product will have a single price.</p>
                </div>
              ) : (
                formData.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-border bg-muted/20 relative group rounded-lg pt-6">
                    {/* Default Selector Radio */}
                    <div className="flex items-center gap-2 md:col-span-4 border-b border-border pb-3 mb-2">
                      <input
                        type="radio"
                        id={`default-variant-${index}`}
                        name="defaultVariant"
                        checked={!!variant.isDefault}
                        onChange={() => setDefaultVariant(index)}
                        className="w-3.5 h-3.5 accent-primary cursor-pointer"
                      />
                      <label htmlFor={`default-variant-${index}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary cursor-pointer flex items-center gap-1">
                        Use Pricing & Inventory values as Default
                        {variant.isDefault && <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-black tracking-widest uppercase ml-2">Active Default</span>}
                      </label>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Variant Name</label>
                      <input
                        value={variant.variantName}
                        onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                        placeholder="e.g. Size: A3"
                        required
                        className="w-full bg-background border border-border px-4 py-2 text-xs font-bold uppercase tracking-widest focus:border-primary/40 outline-none text-foreground rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Price (₹)</label>
                      <input
                        type="number"
                        value={variant.isDefault ? formData.price : variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        disabled={variant.isDefault}
                        placeholder={formData.price || '0'}
                        className={`w-full border px-4 py-2 text-xs font-mono font-bold focus:border-primary/40 outline-none rounded ${
                          variant.isDefault 
                            ? 'bg-muted/40 text-muted-foreground border-border/40 cursor-not-allowed' 
                            : 'bg-background border-border text-foreground'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Stock</label>
                      <input
                        type="number"
                        value={variant.isDefault ? formData.stock : variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                        disabled={variant.isDefault}
                        placeholder={formData.stock || '100'}
                        className={`w-full border px-4 py-2 text-xs font-mono font-bold focus:border-primary/40 outline-none rounded ${
                          variant.isDefault 
                            ? 'bg-muted/40 text-muted-foreground border-border/40 cursor-not-allowed' 
                            : 'bg-background border-border text-foreground'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Visibility & Status */}
        <div className="bg-card border border-border p-8 space-y-8 rounded-xl shadow-sm">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-lg">
              <Layers size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Visibility & Marketing</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Control how the product appears</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'isActive', label: 'Published', sub: 'Available to buy' },
              { name: 'isFeatured', label: 'Featured', sub: 'Home page spotlight' },
              { name: 'isDealOfTheDay', label: 'Deal', sub: 'Show as limited deal' },
            ].map(({ name, label, sub }) => (
              <label key={name} className="flex items-center gap-4 p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-primary/20 transition-all group">
                <input
                  type="checkbox"
                  name={name}
                  checked={formData[name as keyof FormData] as boolean}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-primary"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{label}</span>
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest">{sub}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar: Image Upload & Actions */}
      <div className="space-y-8">
        <div className="bg-card border border-border p-8 space-y-6 rounded-xl shadow-sm sticky top-28">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-lg">
              <Upload size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Product Images</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">{totalImageCount}/5 uploaded</p>
            </div>
          </div>

          {/* Drop zone / click to upload */}
          {totalImageCount < 5 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border bg-muted/10 rounded-xl flex flex-col items-center justify-center gap-3 p-8 group hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <ImagePlus className="text-muted-foreground/40 group-hover:text-primary transition-colors" size={32} />
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                  Click to upload images
                </p>
                <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest mt-1">
                  JPEG, PNG, WebP · Max 5MB each · Up to 5 total
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Image grid */}
          {totalImageCount > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {/* Existing images (edit mode) */}
              {existingImages.map((img, i) => {
                const isStaged = !!img.id && imagesToDelete.includes(img.id)
                return (
                  <div
                    key={`existing-${i}`}
                    className={`aspect-square bg-white border rounded-lg relative overflow-hidden group transition-all ${isStaged ? 'border-red-500/60 opacity-50' : 'border-border'
                      }`}
                  >
                    <Image
                      src={resolveImageUrl(img.imageUrl)}
                      alt={`Product image ${i + 1}`}
                      fill
                      className={`object-contain p-1 transition-all ${isStaged ? 'grayscale' : ''}`}
                    />

                    {isStaged ? (
                      // STAGED: show undo overlay
                      <>
                        <div className="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center gap-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-red-600">Will delete</span>
                          <button
                            type="button"
                            onClick={() => unstageImageDeletion(img)}
                            className="text-[8px] font-black uppercase tracking-widest bg-white text-red-600 border border-red-400 px-2 py-0.5 rounded hover:bg-red-50 transition-colors"
                          >
                            Undo
                          </button>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-red-500 text-white text-[8px] px-1 rounded">staged</div>
                      </>
                    ) : (
                      // NORMAL: show X on hover
                      <>
                        <button
                          type="button"
                          onClick={() => stageImageForDeletion(img)}
                          className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          title="Mark for deletion (confirmed on save)"
                        >
                          <X size={18} className="text-white" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1 rounded">saved</div>
                      </>
                    )}
                  </div>
                )
              })}

              {/* New files (local preview) */}
              {newFilePreviews.map((preview, i) => (
                <div key={`new-${i}`} className="aspect-square bg-white border border-primary/30 rounded-lg relative overflow-hidden group">
                  <Image src={preview} alt={`New image ${i + 1}`} fill className="object-contain p-1" />
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    title="Remove image"
                  >
                    <X size={18} className="text-white" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-[8px] px-1 rounded">new</div>
                </div>
              ))}
            </div>
          )}

          {totalImageCount === 0 && (
            <p className="text-[10px] text-red-400/80 uppercase tracking-widest text-center font-bold">
              ⚠ At least 1 image required
            </p>
          )}
          {imagesToDelete.length > 0 && (
            <p className="text-[10px] text-amber-500/90 uppercase tracking-widest text-center font-bold">
              ⚠ {imagesToDelete.length} image{imagesToDelete.length > 1 ? 's' : ''} will be deleted on save
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary py-6 text-primary-foreground font-black uppercase tracking-[0.4em] rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-primary/20"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </div>
            ) : productId ? 'Update Product' : 'Create Product'}
          </button>

          <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex gap-3">
            <AlertCircle className="text-primary shrink-0" size={16} />
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest leading-relaxed">
              Images are uploaded to Cloudinary. Changes go live immediately on save.
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}

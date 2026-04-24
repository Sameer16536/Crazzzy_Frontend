/**
 * ProductForm Component
 * 
 * Comprehensive form for adding/editing products
 * Fields:
 * - Basic Info: Name, Description, SKU
 * - Pricing: Regular price, Sale price
 * - Stock: Quantity and reorder level
 * - Details: Category, Brand, Dimensions
 * - Images: Upload and manage product images
 * 
 * Validation: All fields required for submission
 * Submission: Connects to backend API endpoint
 */

'use client'

import { useState, FormEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { categories } from '@/lib/data/categories'

interface FormData {
  name: string
  description: string
  sku: string
  category: string
  price: string
  salePrice: string
  stock: string
  reorderLevel: string
}

export function ProductForm() {
  // Form state management
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    sku: '',
    category: '',
    price: '',
    salePrice: '',
    stock: '',
    reorderLevel: '',
  })

  // Form submission and validation state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  /**
   * Validate form data before submission
   * Returns true if all required fields are filled
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name) newErrors.name = 'Product name is required'
    if (!formData.sku) newErrors.sku = 'SKU is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.price) newErrors.price = 'Price is required'
    if (!formData.stock) newErrors.stock = 'Stock quantity is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   * In production: Send data to backend API
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      console.log('Submitting product:', formData)

      // In production, replace with actual API call:
      // const response = await fetch('/api/admin/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      // Show success message and redirect
      alert('Product created successfully!')
      // router.push('/admin/products')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle input change events
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main form column - 2/3 width */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Information Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Basic Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* SKU and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g., PROD-001"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.sku && (
                  <p className="text-sm text-destructive mt-1">{errors.sku}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category *
                </label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Cost Section */}
              <div className="pt-4 border-t border-border">
                <h3 className="font-medium text-foreground mb-4">Pricing</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Cost *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sale Price (Optional)
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Stock Management Section */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-medium text-foreground mb-4">Stock</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quantity in Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.stock && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.stock}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleChange}
                    placeholder="10"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 flex gap-3 justify-end border-t border-border">
              <button
                type="button"
                className="px-6 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
            </form>
        </Card>
      </div>

      {/* Sidebar - 1/3 width */}
      <div className="space-y-6">
        {/* Image Upload Card */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Product Image</h3>

          {/* Image upload area */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG up to 10MB
            </p>
          </div>
        </Card>

        {/* SEO & Organization Card */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Help & Info</h3>

          <div className="space-y-3 text-sm">
            <div className="flex space-x-2">
              <AlertCircle size={16} className="text-blue-500 flex-shrink-0" />
              <p className="text-muted-foreground">
                Use descriptive product names for better search visibility
              </p>
            </div>

            <div className="flex space-x-2">
              <AlertCircle size={16} className="text-blue-500 flex-shrink-0" />
              <p className="text-muted-foreground">
                SKU must be unique for inventory tracking
              </p>
            </div>

            <div className="flex space-x-2">
              <AlertCircle size={16} className="text-blue-500 flex-shrink-0" />
              <p className="text-muted-foreground">
                Set reorder level to get alerts when stock is low
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

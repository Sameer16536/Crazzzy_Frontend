/**
 * Category Shop Page
 * Displays products filtered by category
 * Dynamic route based on category slug
 */

'use client'

/** Ensure all category slugs are valid dynamic routes — never 404 in production */
export const dynamicParams = true


import { Navbar } from '@/components/navbar'
import { ProductCard } from '@/components/product-card'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCatalog } from '@/lib/catalog/use-catalog'

export default function CategoryPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug
  const { data, isLoading } = useCatalog()

  const category = data?.categories.find((c) => c.slug === slug)
  const products = category ? (data?.products ?? []).filter((p) => p.categoryId === category.id) : []

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {isLoading ? 'Loading…' : 'Category not found'}
          </h1>
          {!isLoading && (
            <Link href="/shop" className="text-primary hover:text-primary/80">
              Back to shop
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16" />

      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-border/10">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">{category.name}</h1>
        <p className="text-muted-foreground">{category.description}</p>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {isLoading ? 'Loading products…' : 'No products in this category yet'}
            </p>
            <Link href="/shop" className="text-primary hover:text-primary/80 font-semibold">
              Browse all products
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

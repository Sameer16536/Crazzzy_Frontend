'use client'

/**
 * Re-exporting from CatalogContext to maintain backwards compatibility
 * while using the global provider for performance.
 */
export { useCatalog, CatalogProvider } from './catalog-context'
export type { CatalogCategory, CatalogProduct } from './catalog-context'

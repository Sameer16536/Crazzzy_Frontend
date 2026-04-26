import { AdminLayout } from '@/components/admin/layout'
import { ProductForm } from '@/components/admin/products/product-form'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Deploy New Artifact | Cockpit',
  description: 'Create a new product listing in the artifact registry',
}

export default function NewProductPage() {
  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="flex flex-col gap-6">
          <Link 
            href="/admin/products" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors w-fit"
          >
            <ChevronLeft size={14} />
            Abort & Return to Registry
          </Link>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-primary" />
              <span className="text-primary text-[10px] font-mono tracking-[0.3em] uppercase">Operations</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">DEPLOY NEW ARTIFACT</h1>
          </div>
        </div>

        <ProductForm />
      </div>
    </AdminLayout>
  )
}

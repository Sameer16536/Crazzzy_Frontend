import type { Metadata } from 'next'
import ProductPage from './product-client'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  if (API_URL.startsWith('/')) {
    API_URL = process.env.BACKEND_API_URL || 'https://crazzzybackend-production.up.railway.app/api';
  }

  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      next: { revalidate: 3600 } // Cache product metadata for 1 hour
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data; // handle raw object or wrapped data
  } catch (e) {
    console.error('[SEO Server Fetch] Error fetching product details:', e);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found | Crazzzy Store',
      description: 'The product you are looking for does not exist.'
    }
  }

  const titleText = product.title || product.name || '';
  const title = `${titleText} | Crazzzy Store`;
  const description = product.description 
    ? product.description.substring(0, 160) 
    : `Buy ${titleText} online at Crazzzy Store - premium collectibles, anime figures, and posters.`;

  const imageUrl = product.imageUrl || (product.images?.[0]?.imageUrl) || (product.images?.[0]) || '/placeholder.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    }
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  let jsonLd = null;
  if (product) {
    const titleText = product.title || product.name || '';
    const imageUrl = product.imageUrl || (product.images?.[0]?.imageUrl) || (product.images?.[0]) || '';
    const description = product.description || '';
    const price = product.price || 0;
    
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: titleText,
      image: imageUrl,
      description: description,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: price.toString(),
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.stock > 0 || product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      }
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPage />
    </>
  )
}

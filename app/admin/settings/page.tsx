/**
 * Admin Settings Page
 * 
 * Configuration and settings management
 * Features:
 * - Store information
 * - Payment gateway setup
 * - Shipping configuration
 * - Email templates
 * - User permissions
 * - API keys
 * 
 * Location: /admin/settings
 */

import { AdminLayout } from '@/components/admin/layout'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Settings | crazzzy Admin',
  description: 'Manage admin settings and configurations',
}

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure and manage your store settings
          </p>
        </div>

        {/* Placeholder for settings forms - expandable for future development */}
        <Card className="p-12 text-center">
          <div className="text-5xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Settings & Configuration
          </h2>
          <p className="text-muted-foreground mb-6">
            Coming soon - Store settings, payment methods, shipping, and API configuration
          </p>
          <div className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
            Under Development
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}

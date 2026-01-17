import Sidebar from '@/components/layout/Sidebar'
import { UserMenu } from '@/components/auth/UserMenu'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-background">
        <div className="border-b border-border">
          <div className="container mx-auto px-8 py-4 flex justify-end">
            <UserMenu />
          </div>
        </div>
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Contract Manager - Smart Legal Document Analysis',
  description: 'AI-powered contract management software with intelligent risk analysis and legal insights',
  keywords: 'contract management, legal tech, AI analysis, risk assessment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <ErrorBoundary>
          <ToastProvider>
            <main className="relative flex min-h-screen flex-col">
              {children}
            </main>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

import './globals.css'
import { Providers } from './providers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex gap-4">
              <Button variant="link" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="link" asChild>
                <Link href="/clients">Clients</Link>
              </Button>
              <Button variant="link" asChild>
                <Link href="/assets">Assets</Link>
              </Button>
              <Button variant="link" asChild>
                <Link href="/assets-static">Static Assets</Link>
              </Button>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
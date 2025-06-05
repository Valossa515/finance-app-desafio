import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold">Finance Management Online</h1>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/clients">Clients</Link>
        </Button>
        <Button asChild>
          <Link href="/assets">Assets</Link>
        </Button>
        <Button asChild>
          <Link href="/assets-static">Static Assets</Link>
        </Button>
      </div>
    </div>
  )
}
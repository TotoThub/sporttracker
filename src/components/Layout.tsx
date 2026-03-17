import { ReactNode } from 'react'
import Navigation from './Navigation'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto">
      <main className="flex-1 px-4 pt-4 pb-24">
        {children}
      </main>
      <Navigation />
    </div>
  )
}

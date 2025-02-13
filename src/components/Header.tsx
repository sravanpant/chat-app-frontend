// components/Header.tsx
import { UserButton } from '@clerk/nextjs'
import { MessageCircleCode } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800"><MessageCircleCode /></h1>
        <UserButton />
      </div>
    </header>
  )
}
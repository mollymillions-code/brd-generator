'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { User, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <User className="h-4 w-4" />
        Sign in
      </Link>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
          {user.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="hidden sm:inline">{user.email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
          <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
            <div className="font-medium truncate">{user.email}</div>
            <div className="text-xs text-gray-500">
              {user.user_metadata?.full_name || 'User'}
            </div>
          </div>

          <Link
            href="/settings"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>

          <button
            onClick={() => {
              setIsOpen(false)
              signOut()
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

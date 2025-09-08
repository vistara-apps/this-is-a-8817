import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/Button'
import { GraduationCap, User, BookOpen, MessageCircle, Settings } from 'lucide-react'

export const AppShell = ({ children, variant = 'default' }) => {
  const { user, isAuthenticated, logout } = useAuthStore()

  const navigation = [
    { name: 'Browse Paths', href: 'browse', icon: BookOpen },
    { name: 'My Learning', href: 'learning', icon: GraduationCap },
    { name: 'Community', href: 'community', icon: MessageCircle },
  ]

  if (user?.role === 'creator') {
    navigation.unshift({ name: 'Create Path', href: 'create', icon: Settings })
    navigation.unshift({ name: 'My Paths', href: 'my-paths', icon: User })
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                <h1 className="heading1 text-text-primary">Pathways</h1>
              </div>
              
              {isAuthenticated && (
                <nav className="hidden md:flex space-x-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={`#${item.href}`}
                      className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="caption">{item.name}</span>
                    </a>
                  ))}
                </nav>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <ConnectButton />
                  <span className="caption text-text-secondary">
                    Welcome, {user?.username}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={variant === 'dashboard' ? 'max-w-6xl mx-auto px-5 py-8' : ''}>
        {children}
      </main>
    </div>
  )
}
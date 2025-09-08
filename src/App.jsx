import React, { useState, useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { AppShell } from './components/layout/AppShell'
import { AuthForm } from './components/auth/AuthForm'
import { PathBuilder } from './components/path/PathBuilder'
import { PathBrowser } from './components/path/PathBrowser'
import { LearningDashboard } from './components/learning/LearningDashboard'
import { CommunityForum } from './components/community/CommunityForum'
import { MyPaths } from './components/creator/MyPaths'

function App() {
  const { isAuthenticated, user } = useAuthStore()
  const [currentView, setCurrentView] = useState('browse')

  // Handle navigation from hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'browse'
      setCurrentView(hash)
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange() // Set initial view

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (!isAuthenticated) {
    return <AuthForm />
  }

  const renderContent = () => {
    switch (currentView) {
      case 'create':
        return user?.role === 'creator' ? <PathBuilder /> : <PathBrowser />
      case 'my-paths':
        return user?.role === 'creator' ? <MyPaths /> : <LearningDashboard />
      case 'browse':
        return <PathBrowser />
      case 'learning':
        return <LearningDashboard />
      case 'community':
        return <CommunityForum />
      default:
        return <PathBrowser />
    }
  }

  return (
    <AppShell variant="dashboard">
      {renderContent()}
    </AppShell>
  )
}

export default App
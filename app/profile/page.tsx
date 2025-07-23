'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, AuthUser } from '@/lib/auth-client'
import { UserProfile, SubscriptionService } from '@/lib/services/subscription'
import { TopNavigation } from '@/components/ui'
import { useEnhancedNotifications } from '@/components/notifications/notification.hooks'
import PersonalInfo from '@/components/profile/personal-info'
import CompanyDetails from '@/components/profile/company-details'
import JurisdictionSettings from '@/components/profile/jurisdiction-settings'
import styles from './profile.module.css'

type ProfileTab = 'personal' | 'company' | 'jurisdictions'

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const notifications = useEnhancedNotifications()

  useEffect(() => {
    loadUserAndProfile()
  }, [])

  async function loadUserAndProfile() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      
      setUser(currentUser)
      
      const subscriptionService = new SubscriptionService()
      const userProfile = await subscriptionService.getUserProfile(currentUser.id)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading profile:', error)
      notifications.error('Failed to load profile', 'Please try refreshing the page')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    const { signOut } = await import('@/lib/auth-client')
    await signOut()
    router.push('/auth/login')
  }

  const handleProfileUpdate = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return
    
    setSaving(true)
    try {
      // Update profile in database
      const { createClient } = await import('@/lib/supabase-client')
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
      
      if (error) throw error
      
      // Update local state
      setProfile({ ...profile, ...updates })
      notifications.success('Profile updated', 'Your changes have been saved')
    } catch (error) {
      console.error('Error updating profile:', error)
      notifications.error('Failed to update profile', 'Please try again')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'personal' as ProfileTab, label: 'Personal Information' },
    { id: 'company' as ProfileTab, label: 'Company Details' },
    { id: 'jurisdictions' as ProfileTab, label: 'Jurisdiction Settings' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-lg"></div>
      </div>
    )
  }

  return (
    <div className={styles.profileContainer}>
      <TopNavigation 
        user={user}
        onSignOut={handleSignOut}
        showLogo={true}
      />
      
      <div className={styles.profileContent}>
        <div className={styles.profileHeader}>
          <h1 className={styles.profileTitle}>Profile Settings</h1>
          <p className={styles.profileSubtitle}>
            Manage your personal information, company details, and legal preferences
          </p>
        </div>

        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'personal' && user && (
            <PersonalInfo 
              user={user} 
              profile={profile}
              onUpdate={handleProfileUpdate}
              saving={saving}
            />
          )}
          
          {activeTab === 'company' && profile && (
            <CompanyDetails 
              profile={profile}
              onUpdate={handleProfileUpdate}
              saving={saving}
            />
          )}
          
          {activeTab === 'jurisdictions' && profile && (
            <JurisdictionSettings 
              profile={profile}
              onUpdate={handleProfileUpdate}
              saving={saving}
            />
          )}
          
        </div>
      </div>
    </div>
  )
}
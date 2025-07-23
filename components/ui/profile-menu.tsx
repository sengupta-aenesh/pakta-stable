'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { AuthUser } from '@/lib/auth-client'
import { UserProfile } from '@/lib/services/subscription'
import { SubscriptionService } from '@/lib/services/subscription'
import styles from './profile-menu.module.css'

interface ProfileMenuProps {
  user: AuthUser
  onSignOut?: () => void
}

export default function ProfileMenu({ user, onSignOut }: ProfileMenuProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const subscriptionService = new SubscriptionService()
        const userProfile = await subscriptionService.getUserProfile(user.id)
        setProfile(userProfile)
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  // Get user initials for avatar
  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.')
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  const handleSignOut = async () => {
    if (onSignOut) {
      onSignOut()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={styles.profileButton} title="Profile menu">
          <div className={styles.avatar}>
            <span className={styles.avatarText}>{getInitials(user.email)}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.dropdownContent}>
        <DropdownMenuLabel className={styles.userInfo}>
          <div className={styles.userEmail}>{user.email}</div>
          {profile && (
            <div className={styles.userTier}>
              {profile.subscription_tier} • {profile.subscription_status}
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.menuIcon}
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Profile Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/profile/jurisdictions')}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.menuIcon}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          Jurisdiction Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/profile/company')}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.menuIcon}
          >
            <path d="M3 21h18"></path>
            <path d="M3 10h18"></path>
            <path d="M5 6l7-3 7 3"></path>
            <path d="M4 10v11"></path>
            <path d="M20 10v11"></path>
            <path d="M8 14v3"></path>
            <path d="M12 14v3"></path>
            <path d="M16 14v3"></path>
          </svg>
          Company Details
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className={styles.signOutItem}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.menuIcon}
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
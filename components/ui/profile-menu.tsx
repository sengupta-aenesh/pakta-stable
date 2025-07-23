'use client'

import { useRouter } from 'next/navigation'
import { AuthUser } from '@/lib/auth-client'
import styles from './profile-menu.module.css'

interface ProfileMenuProps {
  user: AuthUser
  onSignOut?: () => void
}

export default function ProfileMenu({ user, onSignOut }: ProfileMenuProps) {
  const router = useRouter()

  // Get user initials for avatar
  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.')
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  return (
    <button 
      className={styles.profileButton} 
      title="Go to profile"
      onClick={handleProfileClick}
    >
      <div className={styles.avatar}>
        <span className={styles.avatarText}>{getInitials(user.email)}</span>
      </div>
    </button>
  )
}
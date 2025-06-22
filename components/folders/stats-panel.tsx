'use client'

import { useRouter } from 'next/navigation'
import { Contract } from '@/lib/supabase-client'
import styles from '@/app/folders/folders.module.css'

interface Folder {
  id: string
  user_id: string
  name: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

interface StatsPanelProps {
  contracts: Contract[]
  folders: Folder[]
  user: any
}

export default function StatsPanel({ 
  contracts, 
  folders, 
  user 
}: StatsPanelProps) {
  const router = useRouter()
  
  const getRecentUploads = () => {
    return contracts
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const recentUploads = getRecentUploads()
  const totalContracts = contracts.length
  const totalFolders = folders.length
  const contractsThisMonth = contracts.filter(contract => {
    const contractDate = new Date(contract.created_at)
    const now = new Date()
    return contractDate.getMonth() === now.getMonth() && 
           contractDate.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="h-full overflow-y-auto">
      {/* Quick Stats */}
      <div className={styles.statsCard}>
        <h3 className={styles.statsTitle}>Quick Stats</h3>
        
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Contracts</span>
          <span className={styles.statValue}>{totalContracts}</span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Folders</span>
          <span className={styles.statValue}>{totalFolders}</span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statLabel}>This Month</span>
          <span className={styles.statValue}>{contractsThisMonth}</span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Storage Used</span>
          <span className={styles.statValue}>
            {((totalContracts * 0.5)).toFixed(1)} MB
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.statsCard}>
        <h3 className={styles.statsTitle}>Recent Uploads</h3>
        
        {recentUploads.length === 0 ? (
          <p className={styles.recentUploadsEmpty}>No recent uploads</p>
        ) : (
          <div className={styles.recentUploadsList}>
            {recentUploads.map((contract) => {
              const truncatedTitle = contract.title.length > 25 
                ? contract.title.substring(0, 25) + '...' 
                : contract.title
              
              return (
                <div 
                  key={contract.id} 
                  className={styles.recentUploadItem}
                  onClick={() => router.push(`/dashboard?contractId=${contract.id}`)}
                  style={{ cursor: 'pointer' }}
                  title={`Open ${contract.title}`}
                >
                  <svg 
                    className={styles.recentUploadIcon}
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  
                  <div className={styles.recentUploadContent}>
                    <p className={styles.recentUploadTitle} title={contract.title}>
                      {truncatedTitle}
                    </p>
                    <p className={styles.recentUploadDate}>
                      {formatDate(contract.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>


    </div>
  )
}
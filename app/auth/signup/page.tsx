'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import styles from './signup.module.css'

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className={styles.logoContainer}>
            <img src="/logo.png" alt="Contract Manager" className={styles.logo} />
          </div>
          
          {/* Invitation icon */}
          <div style={{ 
            backgroundColor: '#F0F9FF', 
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <svg 
              width="28" 
              height="28" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="#0369A1" 
              strokeWidth={1.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5-1.422A12.963 12.963 0 0121.75 12c0-2.846-.924-5.47-2.48-7.75M5.25 21A12.963 12.963 0 012.25 12c0-2.846.924-5.47 2.48-7.75"
              />
            </svg>
          </div>
          
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            marginBottom: '8px',
            textAlign: 'center',
            color: '#0F172A'
          }}>
            Sign Up by Invitation Only
          </h1>
          
          <p className="text-secondary text-sm" style={{ 
            textAlign: 'center',
            lineHeight: '1.6'
          }}>
            Our contract analysis platform is currently available to select organizations
          </p>
        </div>
        
        {/* Information section */}
        <div style={{ 
          marginTop: '32px', 
          padding: '20px', 
          backgroundColor: '#FAFBFC', 
          borderRadius: '8px',
          border: '1px solid #E2E8F0'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '12px',
            color: '#1E293B'
          }}>
            Why Invitation Only?
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p className="text-sm text-secondary" style={{ lineHeight: '1.5' }}>
              • Personalized onboarding and dedicated support
            </p>
            <p className="text-sm text-secondary" style={{ lineHeight: '1.5' }}>
              • Custom security configurations for each organization
            </p>
            <p className="text-sm text-secondary" style={{ lineHeight: '1.5' }}>
              • Ensuring optimal performance and user experience
            </p>
          </div>
        </div>
        
        {/* Contact section */}
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          backgroundColor: '#F8FAFC', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p className="text-sm text-secondary" style={{ lineHeight: '1.5' }}>
            Interested in accessing our platform?<br />
            Contact our team to request an invitation.
          </p>
        </div>
        
        {/* Actions */}
        <div style={{ marginTop: '24px' }}>
          <Button 
            onClick={() => window.open('mailto:access@contractmanager.com?subject=Access Request&body=Hello, I would like to request access to the Contract Manager platform.', '_blank')} 
            variant="primary"
            size="lg"
            className="w-full"
            style={{ marginBottom: '12px' }}
          >
            Request Access
          </Button>
          
          <Link href="/auth/login">
            <Button 
              variant="secondary"
              size="lg"
              className="w-full"
            >
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
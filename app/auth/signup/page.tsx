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
          
          {/* Beautiful invitation icon */}
          <div className="auth-icon" style={{ 
            backgroundColor: '#F0F9FF', 
            marginTop: '16px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '16px auto'
          }}>
            <svg 
              width="40" 
              height="40" 
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
            fontSize: '28px', 
            fontWeight: '700', 
            marginBottom: '12px',
            textAlign: 'center',
            color: '#0F172A'
          }}>
            Registration by Invitation Only
          </h1>
          
          <p className="text-secondary" style={{ 
            textAlign: 'center',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            Our AI-powered contract analysis platform is currently available to select organizations and enterprises.
          </p>
        </div>
        
        {/* Elegant information section */}
        <div style={{ 
          marginTop: '32px', 
          padding: '24px', 
          backgroundColor: '#FAFBFC', 
          borderRadius: '12px',
          border: '1px solid #E2E8F0'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: '#1E293B'
          }}>
            Why Invitation Only?
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ 
                width: '6px', 
                height: '6px', 
                backgroundColor: '#0369A1', 
                borderRadius: '50%',
                marginTop: '8px',
                flexShrink: 0
              }}></div>
              <p className="text-sm text-secondary" style={{ lineHeight: '1.6' }}>
                <strong>Regulatory Compliance:</strong> We're ensuring full compliance with local financial regulations and data protection laws.
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ 
                width: '6px', 
                height: '6px', 
                backgroundColor: '#0369A1', 
                borderRadius: '50%',
                marginTop: '8px',
                flexShrink: 0
              }}></div>
              <p className="text-sm text-secondary" style={{ lineHeight: '1.6' }}>
                <strong>Premium Experience:</strong> We're providing personalized onboarding and dedicated support to ensure the best experience.
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ 
                width: '6px', 
                height: '6px', 
                backgroundColor: '#0369A1', 
                borderRadius: '50%',
                marginTop: '8px',
                flexShrink: 0
              }}></div>
              <p className="text-sm text-secondary" style={{ lineHeight: '1.6' }}>
                <strong>Enterprise Security:</strong> Each organization receives custom security configurations and access controls.
              </p>
            </div>
          </div>
        </div>
        
        {/* Contact information */}
        <div style={{ 
          marginTop: '24px', 
          padding: '20px', 
          backgroundColor: '#F8FAFC', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#1E293B'
          }}>
            Interested in Access?
          </h4>
          <p className="text-sm text-secondary" style={{ lineHeight: '1.6' }}>
            Contact our team to discuss your contract analysis needs and explore how our AI can transform your legal workflow.
          </p>
        </div>
        
        {/* Actions */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <Button 
            onClick={() => window.open('mailto:access@contractmanager.com?subject=Access Request&body=Hello, I would like to request access to the Contract Manager platform.', '_blank')} 
            variant="primary"
            size="lg"
            style={{ flex: 1 }}
          >
            Request Access
          </Button>
          
          <Link href="/auth/login" style={{ flex: 1 }}>
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
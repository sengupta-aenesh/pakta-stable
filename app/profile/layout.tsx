import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile Settings | Contract Manager',
  description: 'Manage your profile, company details, and jurisdiction settings',
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
// lib/jurisdiction-data.ts
export interface JurisdictionData {
  name: string
  code: string
  flag: string
  companyTypes: {
    value: string
    label: string
    description: string
  }[]
}

export const jurisdictionData: Record<string, JurisdictionData> = {
  // North America
  'united-states': {
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    companyTypes: [
      {
        value: 'corporation',
        label: 'Corporation (Corp/Inc)',
        description: 'Separate legal entity with shareholders, limited liability'
      },
      {
        value: 'llc',
        label: 'Limited Liability Company (LLC)',
        description: 'Flexible structure with limited liability and tax benefits'
      },
      {
        value: 'partnership',
        label: 'Partnership (GP/LP)',
        description: 'Business owned by two or more partners'
      },
      {
        value: 'sole-proprietorship',
        label: 'Sole Proprietorship',
        description: 'Unincorporated business owned by one person'
      },
      {
        value: 's-corp',
        label: 'S Corporation',
        description: 'Pass-through taxation with corporate structure'
      },
      {
        value: 'non-profit',
        label: 'Non-Profit Corporation',
        description: 'Tax-exempt organization for charitable purposes'
      }
    ]
  },
  'canada': {
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    companyTypes: [
      {
        value: 'corporation',
        label: 'Corporation',
        description: 'Federal or provincial incorporation available'
      },
      {
        value: 'partnership',
        label: 'Partnership',
        description: 'General or limited partnership structure'
      },
      {
        value: 'sole-proprietorship',
        label: 'Sole Proprietorship',
        description: 'Individual doing business under their own name'
      },
      {
        value: 'cooperative',
        label: 'Cooperative',
        description: 'Member-owned business organization'
      }
    ]
  },
  'mexico': {
    name: 'Mexico',
    code: 'MX',
    flag: '🇲🇽',
    companyTypes: [
      {
        value: 'sa-de-cv',
        label: 'S.A. de C.V.',
        description: 'Sociedad Anónima de Capital Variable'
      },
      {
        value: 'srl-de-cv',
        label: 'S. de R.L. de C.V.',
        description: 'Sociedad de Responsabilidad Limitada'
      }
    ]
  },
  
  // Asia
  'china': {
    name: 'China',
    code: 'CN',
    flag: '🇨🇳',
    companyTypes: [
      {
        value: 'wfoe',
        label: 'WFOE',
        description: 'Wholly Foreign-Owned Enterprise'
      },
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Chinese LLC structure'
      },
      {
        value: 'jv',
        label: 'Joint Venture',
        description: 'Partnership with Chinese entity'
      },
      {
        value: 'rep-office',
        label: 'Representative Office',
        description: 'Non-profit generating presence'
      }
    ]
  },
  'japan': {
    name: 'Japan',
    code: 'JP',
    flag: '🇯🇵',
    companyTypes: [
      {
        value: 'kk',
        label: 'Kabushiki Kaisha (KK)',
        description: 'Stock company, most common for foreign businesses'
      },
      {
        value: 'gk',
        label: 'Godo Kaisha (GK)',
        description: 'Japanese LLC, simpler than KK'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Extension of foreign company'
      },
      {
        value: 'rep-office',
        label: 'Representative Office',
        description: 'Market research and liaison only'
      }
    ]
  },
  'south-korea': {
    name: 'South Korea',
    code: 'KR',
    flag: '🇰🇷',
    companyTypes: [
      {
        value: 'yuhan-hoesa',
        label: 'Yuhan Hoesa',
        description: 'Limited liability company'
      },
      {
        value: 'jusik-hoesa',
        label: 'Jusik Hoesa',
        description: 'Stock company'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Extension of foreign company'
      }
    ]
  },
  'india': {
    name: 'India',
    code: 'IN',
    flag: '🇮🇳',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Most common, minimum 2 shareholders'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can raise funds from public, minimum 7 shareholders'
      },
      {
        value: 'llp',
        label: 'Limited Liability Partnership',
        description: 'Hybrid of partnership and company'
      },
      {
        value: 'one-person',
        label: 'One Person Company',
        description: 'Single shareholder company'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Extension of foreign company with restrictions'
      },
      {
        value: 'liaison',
        label: 'Liaison Office',
        description: 'Representative office, no commercial activities'
      }
    ]
  },
  
  // Southeast Asia
  'singapore': {
    name: 'Singapore',
    code: 'SG',
    flag: '🇸🇬',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Most popular, limited liability'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares to public'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Singapore branch of foreign company'
      },
      {
        value: 'rep-office',
        label: 'Representative Office',
        description: 'Temporary setup for market research'
      }
    ]
  },
  'malaysia': {
    name: 'Malaysia',
    code: 'MY',
    flag: '🇲🇾',
    companyTypes: [
      {
        value: 'sdn-bhd',
        label: 'Sdn Bhd',
        description: 'Private limited company'
      },
      {
        value: 'bhd',
        label: 'Bhd',
        description: 'Public limited company'
      },
      {
        value: 'llp',
        label: 'LLP',
        description: 'Limited liability partnership'
      }
    ]
  },
  'thailand': {
    name: 'Thailand',
    code: 'TH',
    flag: '🇹🇭',
    companyTypes: [
      {
        value: 'limited-company',
        label: 'Limited Company',
        description: 'Thai limited company'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Foreign company branch'
      },
      {
        value: 'rep-office',
        label: 'Representative Office',
        description: 'Non-trading office'
      }
    ]
  },
  'vietnam': {
    name: 'Vietnam',
    code: 'VN',
    flag: '🇻🇳',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Most common for foreign investors'
      },
      {
        value: 'jsc',
        label: 'Joint Stock Company',
        description: 'Can issue shares'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Branch of foreign company'
      }
    ]
  },
  'indonesia': {
    name: 'Indonesia',
    code: 'ID',
    flag: '🇮🇩',
    companyTypes: [
      {
        value: 'pt-pma',
        label: 'PT PMA',
        description: 'Foreign investment company'
      },
      {
        value: 'pt',
        label: 'PT',
        description: 'Limited liability company'
      },
      {
        value: 'rep-office',
        label: 'Representative Office',
        description: 'KPPA/KP3A for market research'
      }
    ]
  },
  'philippines': {
    name: 'Philippines',
    code: 'PH',
    flag: '🇵🇭',
    companyTypes: [
      {
        value: 'corporation',
        label: 'Corporation',
        description: 'Stock corporation'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Foreign company branch'
      },
      {
        value: 'rep-office',
        label: 'Representative Office',
        description: 'Non-income generating'
      }
    ]
  },
  
  // Middle East
  'united-arab-emirates': {
    name: 'United Arab Emirates',
    code: 'AE',
    flag: '🇦🇪',
    companyTypes: [
      {
        value: 'llc',
        label: 'LLC',
        description: 'Limited liability company'
      },
      {
        value: 'free-zone',
        label: 'Free Zone Company',
        description: '100% foreign ownership in free zones'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Foreign company branch'
      }
    ]
  },
  'saudi-arabia': {
    name: 'Saudi Arabia',
    code: 'SA',
    flag: '🇸🇦',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Most common for foreign investors'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Foreign company branch'
      },
      {
        value: 'joint-venture',
        label: 'Joint Venture',
        description: 'Partnership with Saudi entity'
      }
    ]
  },
  'israel': {
    name: 'Israel',
    code: 'IL',
    flag: '🇮🇱',
    companyTypes: [
      {
        value: 'private-company',
        label: 'Private Company Ltd',
        description: 'Most common business structure'
      },
      {
        value: 'public-company',
        label: 'Public Company',
        description: 'Can offer shares to public'
      },
      {
        value: 'partnership',
        label: 'Partnership',
        description: 'General or limited partnership'
      }
    ]
  },
  
  // Africa
  'south-africa': {
    name: 'South Africa',
    code: 'ZA',
    flag: '🇿🇦',
    companyTypes: [
      {
        value: 'pty-ltd',
        label: 'Pty Ltd',
        description: 'Private company'
      },
      {
        value: 'public-company',
        label: 'Ltd',
        description: 'Public company'
      },
      {
        value: 'cc',
        label: 'Close Corporation',
        description: 'Simpler than company (being phased out)'
      }
    ]
  },
  'nigeria': {
    name: 'Nigeria',
    code: 'NG',
    flag: '🇳🇬',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Limited by shares'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'PLC - can offer shares publicly'
      },
      {
        value: 'limited-by-guarantee',
        label: 'Limited by Guarantee',
        description: 'Usually for non-profits'
      }
    ]
  },
  'kenya': {
    name: 'Kenya',
    code: 'KE',
    flag: '🇰🇪',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Most common business structure'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares to public'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Foreign company branch'
      }
    ]
  },
  'egypt': {
    name: 'Egypt',
    code: 'EG',
    flag: '🇪🇬',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Most flexible for foreign investors'
      },
      {
        value: 'jsc',
        label: 'Joint Stock Company',
        description: 'Can be listed on stock exchange'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Extension of foreign company'
      }
    ]
  },
  'morocco': {
    name: 'Morocco',
    code: 'MA',
    flag: '🇲🇦',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      },
      {
        value: 'sa',
        label: 'SA',
        description: 'Public limited company'
      }
    ]
  },
  
  // Oceania
  'australia': {
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    companyTypes: [
      {
        value: 'pty-ltd',
        label: 'Proprietary Limited (Pty Ltd)',
        description: 'Private company, most common structure'
      },
      {
        value: 'public-company',
        label: 'Public Company',
        description: 'Can offer shares to the public'
      },
      {
        value: 'partnership',
        label: 'Partnership',
        description: 'Two or more people in business together'
      },
      {
        value: 'sole-trader',
        label: 'Sole Trader',
        description: 'Individual trading on their own'
      },
      {
        value: 'trust',
        label: 'Trust',
        description: 'Trustee manages for beneficiaries'
      }
    ]
  },
  'new-zealand': {
    name: 'New Zealand',
    code: 'NZ',
    flag: '🇳🇿',
    companyTypes: [
      {
        value: 'limited-company',
        label: 'Limited Company',
        description: 'Most common business structure'
      },
      {
        value: 'partnership',
        label: 'Partnership',
        description: 'General or limited partnership'
      },
      {
        value: 'sole-trader',
        label: 'Sole Trader',
        description: 'Individual business owner'
      }
    ]
  }
}

export function searchJurisdictions(query: string): JurisdictionData[] {
  const searchTerm = query.toLowerCase()
  return Object.values(jurisdictionData).filter(jurisdiction => 
    jurisdiction.name.toLowerCase().includes(searchTerm) ||
    jurisdiction.code.toLowerCase().includes(searchTerm)
  )
}

export const popularJurisdictions = [
  'united-states',
  'singapore', 
  'india',
  'united-arab-emirates',
  'canada',
  'australia'
]
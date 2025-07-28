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
  
  // Europe
  'united-kingdom': {
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    companyTypes: [
      {
        value: 'ltd',
        label: 'Private Limited Company (Ltd)',
        description: 'Limited liability, shares not publicly traded'
      },
      {
        value: 'plc',
        label: 'Public Limited Company (PLC)',
        description: 'Can offer shares to the public'
      },
      {
        value: 'llp',
        label: 'Limited Liability Partnership (LLP)',
        description: 'Partnership with limited liability'
      },
      {
        value: 'sole-trader',
        label: 'Sole Trader',
        description: 'Individual running their own business'
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
  'pakistan': {
    name: 'Pakistan',
    code: 'PK',
    flag: '🇵🇰',
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
        value: 'sole-proprietorship',
        label: 'Sole Proprietorship',
        description: 'Individual business ownership'
      }
    ]
  },
  'bangladesh': {
    name: 'Bangladesh',
    code: 'BD',
    flag: '🇧🇩',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Limited liability company'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares publicly'
      },
      {
        value: 'partnership',
        label: 'Partnership',
        description: 'Business partnership'
      }
    ]
  },
  'sri-lanka': {
    name: 'Sri Lanka',
    code: 'LK',
    flag: '🇱🇰',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Most common form'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Listed company'
      }
    ]
  },
  'nepal': {
    name: 'Nepal',
    code: 'NP',
    flag: '🇳🇵',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares publicly'
      }
    ]
  },
  'afghanistan': {
    name: 'Afghanistan',
    code: 'AF',
    flag: '🇦🇫',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Common business structure'
      },
      {
        value: 'corporation',
        label: 'Corporation',
        description: 'Stock corporation'
      }
    ]
  },
  'myanmar': {
    name: 'Myanmar',
    code: 'MM',
    flag: '🇲🇲',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Most common for foreign investment'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Foreign company branch'
      }
    ]
  },
  'cambodia': {
    name: 'Cambodia',
    code: 'KH',
    flag: '🇰🇭',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Foreign company branch'
      }
    ]
  },
  'laos': {
    name: 'Laos',
    code: 'LA',
    flag: '🇱🇦',
    companyTypes: [
      {
        value: 'limited-company',
        label: 'Limited Company',
        description: 'Common business form'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Foreign company branch'
      }
    ]
  },
  'brunei': {
    name: 'Brunei',
    code: 'BN',
    flag: '🇧🇳',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Sdn Bhd',
        description: 'Private limited company'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Foreign company branch'
      }
    ]
  },
  'mongolia': {
    name: 'Mongolia',
    code: 'MN',
    flag: '🇲🇳',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Most common structure'
      },
      {
        value: 'jsc',
        label: 'Joint Stock Company',
        description: 'Can issue shares'
      }
    ]
  },
  'uzbekistan': {
    name: 'Uzbekistan',
    code: 'UZ',
    flag: '🇺🇿',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Common business structure'
      },
      {
        value: 'jsc',
        label: 'Joint Stock Company',
        description: 'Can issue shares'
      }
    ]
  },
  'kazakhstan': {
    name: 'Kazakhstan',
    code: 'KZ',
    flag: '🇰🇿',
    companyTypes: [
      {
        value: 'llp',
        label: 'Limited Liability Partnership',
        description: 'Most common form'
      },
      {
        value: 'jsc',
        label: 'Joint Stock Company',
        description: 'Can issue shares'
      }
    ]
  },
  'kyrgyzstan': {
    name: 'Kyrgyzstan',
    code: 'KG',
    flag: '🇰🇬',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Common business structure'
      }
    ]
  },
  'tajikistan': {
    name: 'Tajikistan',
    code: 'TJ',
    flag: '🇹🇯',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Common business structure'
      }
    ]
  },
  'turkmenistan': {
    name: 'Turkmenistan',
    code: 'TM',
    flag: '🇹🇲',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Common business structure'
      }
    ]
  },
  'georgia': {
    name: 'Georgia',
    code: 'GE',
    flag: '🇬🇪',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Most common structure'
      },
      {
        value: 'jsc',
        label: 'Joint Stock Company',
        description: 'Can issue shares'
      }
    ]
  },
  'armenia': {
    name: 'Armenia',
    code: 'AM',
    flag: '🇦🇲',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Common business structure'
      },
      {
        value: 'jsc',
        label: 'Joint Stock Company',
        description: 'Can issue shares'
      }
    ]
  },
  'azerbaijan': {
    name: 'Azerbaijan',
    code: 'AZ',
    flag: '🇦🇿',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Most common form'
      },
      {
        value: 'jsc',
        label: 'Joint Stock Company',
        description: 'Can issue shares'
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
  'turkey': {
    name: 'Turkey',
    code: 'TR',
    flag: '🇹🇷',
    companyTypes: [
      {
        value: 'limited-company',
        label: 'Limited Company (Ltd. Şti.)',
        description: 'Most common form'
      },
      {
        value: 'joint-stock',
        label: 'Joint Stock Company (A.Ş.)',
        description: 'Can issue shares'
      }
    ]
  },
  'lebanon': {
    name: 'Lebanon',
    code: 'LB',
    flag: '🇱🇧',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      },
      {
        value: 'sal',
        label: 'SAL',
        description: 'Joint stock company'
      }
    ]
  },
  'jordan': {
    name: 'Jordan',
    code: 'JO',
    flag: '🇯🇴',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Most common structure'
      },
      {
        value: 'plc',
        label: 'Public Limited Company',
        description: 'Can offer shares publicly'
      }
    ]
  },
  'kuwait': {
    name: 'Kuwait',
    code: 'KW',
    flag: '🇰🇼',
    companyTypes: [
      {
        value: 'wll',
        label: 'WLL (With Limited Liability)',
        description: 'Limited liability company'
      },
      {
        value: 'ksc',
        label: 'KSC (Kuwaiti Shareholding Company)',
        description: 'Shareholding company'
      }
    ]
  },
  'qatar': {
    name: 'Qatar',
    code: 'QA',
    flag: '🇶🇦',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Most common form'
      },
      {
        value: 'branch',
        label: 'Branch Office',
        description: 'Foreign company branch'
      }
    ]
  },
  'bahrain': {
    name: 'Bahrain',
    code: 'BH',
    flag: '🇧🇭',
    companyTypes: [
      {
        value: 'wll',
        label: 'WLL (With Limited Liability)',
        description: 'Limited liability company'
      },
      {
        value: 'bsc',
        label: 'BSC (Bahraini Shareholding Company)',
        description: 'Shareholding company'
      }
    ]
  },
  'oman': {
    name: 'Oman',
    code: 'OM',
    flag: '🇴🇲',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Most common structure'
      },
      {
        value: 'saoc',
        label: 'SAOC (Joint Stock Company)',
        description: 'Public joint stock company'
      }
    ]
  },
  'yemen': {
    name: 'Yemen',
    code: 'YE',
    flag: '🇾🇪',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Common business structure'
      }
    ]
  },
  'syria': {
    name: 'Syria',
    code: 'SY',
    flag: '🇸🇾',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Common business structure'
      }
    ]
  },
  'iraq': {
    name: 'Iraq',
    code: 'IQ',
    flag: '🇮🇶',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Common business structure'
      }
    ]
  },
  'iran': {
    name: 'Iran',
    code: 'IR',
    flag: '🇮🇷',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Private joint stock company'
      },
      {
        value: 'pjsc',
        label: 'Public Joint Stock Company',
        description: 'Can offer shares publicly'
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
  'ghana': {
    name: 'Ghana',
    code: 'GH',
    flag: '🇬🇭',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Limited liability company'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares publicly'
      }
    ]
  },
  'ethiopia': {
    name: 'Ethiopia',
    code: 'ET',
    flag: '🇪🇹',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Most common structure'
      },
      {
        value: 'share-company',
        label: 'Share Company',
        description: 'Can issue shares'
      }
    ]
  },
  'tanzania': {
    name: 'Tanzania',
    code: 'TZ',
    flag: '🇹🇿',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares publicly'
      }
    ]
  },
  'uganda': {
    name: 'Uganda',
    code: 'UG',
    flag: '🇺🇬',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Most common form'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares publicly'
      }
    ]
  },
  'rwanda': {
    name: 'Rwanda',
    code: 'RW',
    flag: '🇷🇼',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares publicly'
      }
    ]
  },
  'zambia': {
    name: 'Zambia',
    code: 'ZM',
    flag: '🇿🇲',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares publicly'
      }
    ]
  },
  'zimbabwe': {
    name: 'Zimbabwe',
    code: 'ZW',
    flag: '🇿🇼',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares publicly'
      }
    ]
  },
  'botswana': {
    name: 'Botswana',
    code: 'BW',
    flag: '🇧🇼',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares publicly'
      }
    ]
  },
  'namibia': {
    name: 'Namibia',
    code: 'NA',
    flag: '🇳🇦',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares publicly'
      }
    ]
  },
  'mozambique': {
    name: 'Mozambique',
    code: 'MZ',
    flag: '🇲🇿',
    companyTypes: [
      {
        value: 'limitada',
        label: 'Sociedade por Quotas (Lda)',
        description: 'Limited liability company'
      },
      {
        value: 'sa',
        label: 'Sociedade Anónima (SA)',
        description: 'Joint stock company'
      }
    ]
  },
  'angola': {
    name: 'Angola',
    code: 'AO',
    flag: '🇦🇴',
    companyTypes: [
      {
        value: 'limitada',
        label: 'Sociedade por Quotas',
        description: 'Limited liability company'
      },
      {
        value: 'sa',
        label: 'Sociedade Anónima',
        description: 'Joint stock company'
      }
    ]
  },
  'algeria': {
    name: 'Algeria',
    code: 'DZ',
    flag: '🇩🇿',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      },
      {
        value: 'spa',
        label: 'SPA',
        description: 'Joint stock company'
      }
    ]
  },
  'tunisia': {
    name: 'Tunisia',
    code: 'TN',
    flag: '🇹🇳',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      },
      {
        value: 'sa',
        label: 'SA',
        description: 'Joint stock company'
      }
    ]
  },
  'libya': {
    name: 'Libya',
    code: 'LY',
    flag: '🇱🇾',
    companyTypes: [
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Common business structure'
      }
    ]
  },
  'sudan': {
    name: 'Sudan',
    code: 'SD',
    flag: '🇸🇩',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'senegal': {
    name: 'Senegal',
    code: 'SN',
    flag: '🇸🇳',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      },
      {
        value: 'sa',
        label: 'SA',
        description: 'Joint stock company'
      }
    ]
  },
  'ivory-coast': {
    name: 'Ivory Coast',
    code: 'CI',
    flag: '🇨🇮',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      },
      {
        value: 'sa',
        label: 'SA',
        description: 'Joint stock company'
      }
    ]
  },
  'cameroon': {
    name: 'Cameroon',
    code: 'CM',
    flag: '🇨🇲',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      },
      {
        value: 'sa',
        label: 'SA',
        description: 'Joint stock company'
      }
    ]
  },
  'democratic-republic-congo': {
    name: 'Democratic Republic of Congo',
    code: 'CD',
    flag: '🇨🇩',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      },
      {
        value: 'sa',
        label: 'SA',
        description: 'Joint stock company'
      }
    ]
  },
  'madagascar': {
    name: 'Madagascar',
    code: 'MG',
    flag: '🇲🇬',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      },
      {
        value: 'sa',
        label: 'SA',
        description: 'Joint stock company'
      }
    ]
  },
  'mauritius': {
    name: 'Mauritius',
    code: 'MU',
    flag: '🇲🇺',
    companyTypes: [
      {
        value: 'private-company',
        label: 'Private Company',
        description: 'Limited by shares'
      },
      {
        value: 'public-company',
        label: 'Public Company',
        description: 'Can offer shares publicly'
      },
      {
        value: 'gbl',
        label: 'Global Business Company',
        description: 'For international business'
      }
    ]
  },
  'seychelles': {
    name: 'Seychelles',
    code: 'SC',
    flag: '🇸🇨',
    companyTypes: [
      {
        value: 'ibc',
        label: 'International Business Company',
        description: 'Offshore company structure'
      },
      {
        value: 'domestic-company',
        label: 'Domestic Company',
        description: 'Local business operations'
      }
    ]
  },
  'mali': {
    name: 'Mali',
    code: 'ML',
    flag: '🇲🇱',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'burkina-faso': {
    name: 'Burkina Faso',
    code: 'BF',
    flag: '🇧🇫',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'niger': {
    name: 'Niger',
    code: 'NE',
    flag: '🇳🇪',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'chad': {
    name: 'Chad',
    code: 'TD',
    flag: '🇹🇩',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'mauritania': {
    name: 'Mauritania',
    code: 'MR',
    flag: '🇲🇷',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'somalia': {
    name: 'Somalia',
    code: 'SO',
    flag: '🇸🇴',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'eritrea': {
    name: 'Eritrea',
    code: 'ER',
    flag: '🇪🇷',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'djibouti': {
    name: 'Djibouti',
    code: 'DJ',
    flag: '🇩🇯',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'gabon': {
    name: 'Gabon',
    code: 'GA',
    flag: '🇬🇦',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'equatorial-guinea': {
    name: 'Equatorial Guinea',
    code: 'GQ',
    flag: '🇬🇶',
    companyTypes: [
      {
        value: 'sl',
        label: 'Sociedad Limitada',
        description: 'Limited liability company'
      }
    ]
  },
  'republic-congo': {
    name: 'Republic of Congo',
    code: 'CG',
    flag: '🇨🇬',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'central-african-republic': {
    name: 'Central African Republic',
    code: 'CF',
    flag: '🇨🇫',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'south-sudan': {
    name: 'South Sudan',
    code: 'SS',
    flag: '🇸🇸',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'burundi': {
    name: 'Burundi',
    code: 'BI',
    flag: '🇧🇮',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'malawi': {
    name: 'Malawi',
    code: 'MW',
    flag: '🇲🇼',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'lesotho': {
    name: 'Lesotho',
    code: 'LS',
    flag: '🇱🇸',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'swaziland': {
    name: 'Eswatini (Swaziland)',
    code: 'SZ',
    flag: '🇸🇿',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'gambia': {
    name: 'Gambia',
    code: 'GM',
    flag: '🇬🇲',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'guinea': {
    name: 'Guinea',
    code: 'GN',
    flag: '🇬🇳',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'guinea-bissau': {
    name: 'Guinea-Bissau',
    code: 'GW',
    flag: '🇬🇼',
    companyTypes: [
      {
        value: 'limitada',
        label: 'Sociedade por Quotas',
        description: 'Limited liability company'
      }
    ]
  },
  'sierra-leone': {
    name: 'Sierra Leone',
    code: 'SL',
    flag: '🇸🇱',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'liberia': {
    name: 'Liberia',
    code: 'LR',
    flag: '🇱🇷',
    companyTypes: [
      {
        value: 'corporation',
        label: 'Corporation',
        description: 'Standard corporation'
      },
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Limited liability structure'
      }
    ]
  },
  'togo': {
    name: 'Togo',
    code: 'TG',
    flag: '🇹🇬',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'benin': {
    name: 'Benin',
    code: 'BJ',
    flag: '🇧🇯',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
      }
    ]
  },
  'cape-verde': {
    name: 'Cape Verde',
    code: 'CV',
    flag: '🇨🇻',
    companyTypes: [
      {
        value: 'limitada',
        label: 'Sociedade por Quotas',
        description: 'Limited liability company'
      }
    ]
  },
  'sao-tome-principe': {
    name: 'São Tomé and Príncipe',
    code: 'ST',
    flag: '🇸🇹',
    companyTypes: [
      {
        value: 'limitada',
        label: 'Sociedade por Quotas',
        description: 'Limited liability company'
      }
    ]
  },
  'comoros': {
    name: 'Comoros',
    code: 'KM',
    flag: '🇰🇲',
    companyTypes: [
      {
        value: 'sarl',
        label: 'SARL',
        description: 'Limited liability company'
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
  },
  'papua-new-guinea': {
    name: 'Papua New Guinea',
    code: 'PG',
    flag: '🇵🇬',
    companyTypes: [
      {
        value: 'limited-company',
        label: 'Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'fiji': {
    name: 'Fiji',
    code: 'FJ',
    flag: '🇫🇯',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company',
        description: 'Common business structure'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can offer shares publicly'
      }
    ]
  },
  'solomon-islands': {
    name: 'Solomon Islands',
    code: 'SB',
    flag: '🇸🇧',
    companyTypes: [
      {
        value: 'limited-company',
        label: 'Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'vanuatu': {
    name: 'Vanuatu',
    code: 'VU',
    flag: '🇻🇺',
    companyTypes: [
      {
        value: 'limited-company',
        label: 'Limited Company',
        description: 'Common business structure'
      },
      {
        value: 'international-company',
        label: 'International Company',
        description: 'Offshore company structure'
      }
    ]
  },
  'samoa': {
    name: 'Samoa',
    code: 'WS',
    flag: '🇼🇸',
    companyTypes: [
      {
        value: 'limited-company',
        label: 'Limited Company',
        description: 'Common business structure'
      },
      {
        value: 'international-company',
        label: 'International Company',
        description: 'Offshore structure'
      }
    ]
  },
  'tonga': {
    name: 'Tonga',
    code: 'TO',
    flag: '🇹🇴',
    companyTypes: [
      {
        value: 'limited-company',
        label: 'Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'kiribati': {
    name: 'Kiribati',
    code: 'KI',
    flag: '🇰🇮',
    companyTypes: [
      {
        value: 'limited-company',
        label: 'Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'tuvalu': {
    name: 'Tuvalu',
    code: 'TV',
    flag: '🇹🇻',
    companyTypes: [
      {
        value: 'limited-company',
        label: 'Limited Company',
        description: 'Common business structure'
      }
    ]
  },
  'nauru': {
    name: 'Nauru',
    code: 'NR',
    flag: '🇳🇷',
    companyTypes: [
      {
        value: 'corporation',
        label: 'Corporation',
        description: 'Common business structure'
      }
    ]
  },
  'palau': {
    name: 'Palau',
    code: 'PW',
    flag: '🇵🇼',
    companyTypes: [
      {
        value: 'corporation',
        label: 'Corporation',
        description: 'Common business structure'
      }
    ]
  },
  'marshall-islands': {
    name: 'Marshall Islands',
    code: 'MH',
    flag: '🇲🇭',
    companyTypes: [
      {
        value: 'corporation',
        label: 'Corporation',
        description: 'Common business structure'
      },
      {
        value: 'llc',
        label: 'Limited Liability Company',
        description: 'Offshore business structure'
      }
    ]
  },
  'micronesia': {
    name: 'Micronesia',
    code: 'FM',
    flag: '🇫🇲',
    companyTypes: [
      {
        value: 'corporation',
        label: 'Corporation',
        description: 'Common business structure'
      }
    ]
  },
  'cook-islands': {
    name: 'Cook Islands',
    code: 'CK',
    flag: '🇨🇰',
    companyTypes: [
      {
        value: 'international-company',
        label: 'International Company',
        description: 'Offshore company structure'
      },
      {
        value: 'limited-company',
        label: 'Limited Company',
        description: 'Domestic company'
      }
    ]
  },
  'niue': {
    name: 'Niue',
    code: 'NU',
    flag: '🇳🇺',
    companyTypes: [
      {
        value: 'company',
        label: 'Company',
        description: 'Standard company structure'
      }
    ]
  },
  'timor-leste': {
    name: 'Timor-Leste',
    code: 'TL',
    flag: '🇹🇱',
    companyTypes: [
      {
        value: 'limited-company',
        label: 'Limited Company',
        description: 'Common business structure'
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
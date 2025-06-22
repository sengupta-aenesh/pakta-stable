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
      },
      {
        value: 'benefit-corp',
        label: 'Benefit Corporation (B-Corp)',
        description: 'For-profit with social/environmental mission'
      }
    ]
  },
  'united-kingdom': {
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company (Ltd)',
        description: 'Limited liability, shares not publicly traded'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company (PLC)',
        description: 'Can offer shares to the public, minimum £50k capital'
      },
      {
        value: 'partnership',
        label: 'Partnership',
        description: 'Unincorporated association of partners'
      },
      {
        value: 'llp',
        label: 'Limited Liability Partnership (LLP)',
        description: 'Partnership with limited liability protection'
      },
      {
        value: 'sole-trader',
        label: 'Sole Trader',
        description: 'Self-employed individual running their own business'
      },
      {
        value: 'cic',
        label: 'Community Interest Company (CIC)',
        description: 'Limited company for community benefit'
      },
      {
        value: 'charity',
        label: 'Charity',
        description: 'Registered charity for public benefit'
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
        label: 'Corporation (Corp/Inc/Ltd)',
        description: 'Incorporated federally or provincially'
      },
      {
        value: 'partnership',
        label: 'Partnership',
        description: 'General or limited partnership'
      },
      {
        value: 'sole-proprietorship',
        label: 'Sole Proprietorship',
        description: 'Unincorporated business owned by one person'
      },
      {
        value: 'cooperative',
        label: 'Cooperative',
        description: 'Member-owned and democratically controlled'
      },
      {
        value: 'non-profit',
        label: 'Non-Profit Corporation',
        description: 'Incorporated for non-profit purposes'
      },
      {
        value: 'unlimited-liability',
        label: 'Unlimited Liability Company (ULC)',
        description: 'Corporate structure without limited liability'
      }
    ]
  },
  'australia': {
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    companyTypes: [
      {
        value: 'proprietary-limited',
        label: 'Proprietary Limited Company (Pty Ltd)',
        description: 'Private company with limited liability'
      },
      {
        value: 'public-company',
        label: 'Public Company Limited (Ltd)',
        description: 'Can raise capital from the public'
      },
      {
        value: 'partnership',
        label: 'Partnership',
        description: 'Unincorporated association of partners'
      },
      {
        value: 'sole-trader',
        label: 'Sole Trader',
        description: 'Individual trading under their own name or business name'
      },
      {
        value: 'trust',
        label: 'Trust',
        description: 'Trustee holds assets for beneficiaries'
      },
      {
        value: 'company-limited-by-guarantee',
        label: 'Company Limited by Guarantee',
        description: 'Non-profit structure with member guarantees'
      }
    ]
  },
  'singapore': {
    name: 'Singapore',
    code: 'SG',
    flag: '🇸🇬',
    companyTypes: [
      {
        value: 'private-limited',
        label: 'Private Limited Company (Pte Ltd)',
        description: 'Most common business structure in Singapore'
      },
      {
        value: 'public-company',
        label: 'Public Company Limited by Shares',
        description: 'Can offer shares to the public'
      },
      {
        value: 'partnership',
        label: 'Partnership',
        description: 'Business owned by 2-20 partners'
      },
      {
        value: 'sole-proprietorship',
        label: 'Sole Proprietorship',
        description: 'Business owned by one person'
      },
      {
        value: 'llp',
        label: 'Limited Liability Partnership (LLP)',
        description: 'Partnership with limited liability'
      },
      {
        value: 'company-limited-by-guarantee',
        label: 'Company Limited by Guarantee',
        description: 'Non-profit company structure'
      }
    ]
  },
  'germany': {
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    companyTypes: [
      {
        value: 'gmbh',
        label: 'Gesellschaft mit beschränkter Haftung (GmbH)',
        description: 'Private limited liability company'
      },
      {
        value: 'ag',
        label: 'Aktiengesellschaft (AG)',
        description: 'Stock corporation, can be publicly traded'
      },
      {
        value: 'ug',
        label: 'Unternehmergesellschaft (UG)',
        description: 'Mini-GmbH with lower capital requirements'
      },
      {
        value: 'kg',
        label: 'Kommanditgesellschaft (KG)',
        description: 'Limited partnership'
      },
      {
        value: 'ohg',
        label: 'Offene Handelsgesellschaft (OHG)',
        description: 'General partnership'
      },
      {
        value: 'einzelunternehmen',
        label: 'Einzelunternehmen',
        description: 'Sole proprietorship'
      }
    ]
  },
  'france': {
    name: 'France',
    code: 'FR',
    flag: '🇫🇷',
    companyTypes: [
      {
        value: 'sarl',
        label: 'Société à Responsabilité Limitée (SARL)',
        description: 'Private limited liability company'
      },
      {
        value: 'sas',
        label: 'Société par Actions Simplifiée (SAS)',
        description: 'Simplified joint stock company'
      },
      {
        value: 'sa',
        label: 'Société Anonyme (SA)',
        description: 'Public limited company'
      },
      {
        value: 'eurl',
        label: 'Entreprise Unipersonnelle à Responsabilité Limitée (EURL)',
        description: 'Single-member limited liability company'
      },
      {
        value: 'sasu',
        label: 'Société par Actions Simplifiée Unipersonnelle (SASU)',
        description: 'Single-member simplified joint stock company'
      },
      {
        value: 'ei',
        label: 'Entreprise Individuelle (EI)',
        description: 'Sole proprietorship'
      }
    ]
  },
  'netherlands': {
    name: 'Netherlands',
    code: 'NL',
    flag: '🇳🇱',
    companyTypes: [
      {
        value: 'bv',
        label: 'Besloten Vennootschap (BV)',
        description: 'Private limited liability company'
      },
      {
        value: 'nv',
        label: 'Naamloze Vennootschap (NV)',
        description: 'Public limited company'
      },
      {
        value: 'vof',
        label: 'Vennootschap onder Firma (VOF)',
        description: 'General partnership'
      },
      {
        value: 'cv',
        label: 'Commanditaire Vennootschap (CV)',
        description: 'Limited partnership'
      },
      {
        value: 'eenmanszaak',
        label: 'Eenmanszaak',
        description: 'Sole proprietorship'
      },
      {
        value: 'stichting',
        label: 'Stichting',
        description: 'Foundation (non-profit)'
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
        label: 'Private Limited Company (Pvt Ltd)',
        description: 'Most popular corporate structure'
      },
      {
        value: 'public-limited',
        label: 'Public Limited Company',
        description: 'Can raise funds from the public'
      },
      {
        value: 'llp',
        label: 'Limited Liability Partnership (LLP)',
        description: 'Partnership with limited liability'
      },
      {
        value: 'partnership',
        label: 'Partnership Firm',
        description: 'Traditional partnership structure'
      },
      {
        value: 'sole-proprietorship',
        label: 'Sole Proprietorship',
        description: 'Simplest form of business ownership'
      },
      {
        value: 'one-person-company',
        label: 'One Person Company (OPC)',
        description: 'Corporate structure for single entrepreneur'
      },
      {
        value: 'section-8',
        label: 'Section 8 Company',
        description: 'Non-profit company for charitable purposes'
      }
    ]
  },
  'japan': {
    name: 'Japan',
    code: 'JP',
    flag: '🇯🇵',
    companyTypes: [
      {
        value: 'kabushiki-kaisha',
        label: 'Kabushiki Kaisha (KK)',
        description: 'Stock company, most common corporate form'
      },
      {
        value: 'godo-kaisha',
        label: 'Godo Kaisha (GK)',
        description: 'Limited liability company'
      },
      {
        value: 'gomei-kaisha',
        label: 'Gomei Kaisha',
        description: 'General partnership company'
      },
      {
        value: 'goshi-kaisha',
        label: 'Goshi Kaisha',
        description: 'Limited partnership company'
      },
      {
        value: 'sole-proprietorship',
        label: 'Sole Proprietorship (Kojin Jigyo)',
        description: 'Individual business'
      }
    ]
  }
}

export const popularJurisdictions = [
  'united-states',
  'united-kingdom', 
  'canada',
  'australia',
  'singapore',
  'germany',
  'france',
  'netherlands',
  'india',
  'japan'
]

export const allJurisdictions = Object.keys(jurisdictionData)

export function getJurisdictionByKey(key: string): JurisdictionData | null {
  return jurisdictionData[key] || null
}

export function searchJurisdictions(query: string): JurisdictionData[] {
  if (!query.trim()) return []
  
  const searchTerm = query.toLowerCase()
  return Object.entries(jurisdictionData)
    .filter(([key, data]) => 
      data.name.toLowerCase().includes(searchTerm) ||
      data.code.toLowerCase().includes(searchTerm) ||
      key.includes(searchTerm)
    )
    .map(([key, data]) => data)
    .slice(0, 10) // Limit results
}
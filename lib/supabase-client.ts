'use client'

import { createClient } from '@/lib/supabase/client'
import type { Contract, Template, TemplateFolder } from '@/lib/types'

// Re-export createClient for backward compatibility
export { createClient }

// Client-side helper functions for database operations
export const contractsApi = {
  async getAll(userId: string): Promise<Contract[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },
  
  async getById(id: string): Promise<Contract | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },
  
  async create(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<Contract> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('contracts')
      .insert(contract)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async update(id: string, updates: Partial<Contract>): Promise<Contract> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async delete(id: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },
  
  async updateAnalysisCache(id: string, analysisType: string, data: any): Promise<void> {
    const supabase = createClient()
    
    const { data: contract } = await supabase
      .from('contracts')
      .select('analysis_cache')
      .eq('id', id)
      .single()
    
    const updatedCache = {
      ...(contract?.analysis_cache || {}),
      [analysisType]: data,
      lastAnalyzed: new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('contracts')
      .update({ analysis_cache: updatedCache })
      .eq('id', id)
    
    if (error) throw error
  }
}

// Client-side helper functions for template operations
export const templatesApi = {
  async getAll(userId: string): Promise<Template[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Ensure all templates have user_created_variables initialized
    return (data || []).map(template => ({
      ...template,
      user_created_variables: template.user_created_variables || []
    }))
  },
  
  async getById(id: string): Promise<Template | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    // Ensure template has user_created_variables initialized
    if (data) {
      return {
        ...data,
        user_created_variables: data.user_created_variables || []
      }
    }
    return null
  },
  
  async create(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('templates')
      .insert(template)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async update(id: string, updates: Partial<Template>): Promise<Template> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async delete(id: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async updateAnalysisCache(id: string, analysisType: string, data: any): Promise<void> {
    const supabase = createClient()
    
    const { data: template } = await supabase
      .from('templates')
      .select('analysis_cache')
      .eq('id', id)
      .single()
    
    const updatedCache = {
      ...(template?.analysis_cache || {}),
      [analysisType]: data,
      lastAnalyzed: new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('templates')
      .update({ analysis_cache: updatedCache })
      .eq('id', id)
    
    if (error) throw error
  }
}

// Client-side helper functions for template folder operations
export const templateFoldersApi = {
  async getAll(userId: string): Promise<TemplateFolder[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('template_folders')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  },
  
  async create(folder: Omit<TemplateFolder, 'id' | 'created_at' | 'updated_at'>): Promise<TemplateFolder> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('template_folders')
      .insert(folder)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async update(id: string, updates: Partial<TemplateFolder>): Promise<TemplateFolder> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('template_folders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async delete(id: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('template_folders')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Client-side helper functions for template version operations
export const templateVersionsApi = {
  async getAll(templateId: string): Promise<any[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },
  
  async getById(id: string): Promise<any | null> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('template_versions')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },
  
  async create(version: {
    template_id: string
    version_name: string
    vendor_name?: string
    content: string
    analysis_cache?: any
    resolved_risks?: any[]
    notes?: string
  }): Promise<any> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('template_versions')
      .insert(version)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async update(id: string, updates: {
    version_name?: string
    vendor_name?: string
    notes?: string
  }): Promise<any> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('template_versions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async delete(id: string): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('template_versions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async restore(versionId: string, templateId: string): Promise<Template> {
    const supabase = createClient()
    
    // Get the version data
    const { data: version, error: versionError } = await supabase
      .from('template_versions')
      .select('*')
      .eq('id', versionId)
      .single()
    
    if (versionError || !version) throw versionError || new Error('Version not found')
    
    // Update the main template
    const { data: template, error: updateError } = await supabase
      .from('templates')
      .update({
        content: version.content,
        analysis_cache: version.analysis_cache,
        resolved_risks: version.resolved_risks,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .select()
      .single()
    
    if (updateError) throw updateError
    return template
  }
}

// Export types for convenience
export type { Contract, Template, TemplateFolder }
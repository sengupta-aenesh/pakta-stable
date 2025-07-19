export interface Database {
  public: {
    Tables: {
      contracts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          upload_url: string | null
          file_key: string | null
          folder_id: string | null
          creation_session_id: string | null
          analysis_cache: {
            summary?: any
            risks?: any
            complete?: any
            lastAnalyzed?: string
            editableFields?: any[]
            parameters?: Record<string, any>
          }
          analysis_status: string | null
          analysis_progress: number | null
          last_analyzed_at: string | null
          analysis_retry_count: number | null
          analysis_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          upload_url?: string | null
          file_key?: string | null
          folder_id?: string | null
          creation_session_id?: string | null
          analysis_cache?: {
            summary?: any
            risks?: any
            complete?: any
            lastAnalyzed?: string
            editableFields?: any[]
            parameters?: Record<string, any>
          }
          analysis_status?: string | null
          analysis_progress?: number | null
          last_analyzed_at?: string | null
          analysis_retry_count?: number | null
          analysis_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          upload_url?: string | null
          file_key?: string | null
          folder_id?: string | null
          creation_session_id?: string | null
          analysis_cache?: {
            summary?: any
            risks?: any
            complete?: any
            lastAnalyzed?: string
            editableFields?: any[]
            parameters?: Record<string, any>
          }
          analysis_status?: string | null
          analysis_progress?: number | null
          last_analyzed_at?: string | null
          analysis_retry_count?: number | null
          analysis_error?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contract_templates: {
        Row: {
          id: string
          type: string
          name: string
          description: string | null
          category: string | null
          jurisdiction: string
          tags: string[]
          search_vector: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          name: string
          description?: string | null
          category?: string | null
          jurisdiction?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          name?: string
          description?: string | null
          category?: string | null
          jurisdiction?: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      contract_sections: {
        Row: {
          id: string
          template_id: string
          section_type: string
          title: string
          content: string
          variables: any[]
          order_index: number
          is_optional: boolean
          conditions: any | null
          search_vector: any
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          section_type: string
          title: string
          content: string
          variables?: any[]
          order_index?: number
          is_optional?: boolean
          conditions?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          section_type?: string
          title?: string
          content?: string
          variables?: any[]
          order_index?: number
          is_optional?: boolean
          conditions?: any | null
          created_at?: string
        }
      }
      contract_clauses: {
        Row: {
          id: string
          clause_type: string
          title: string
          content: string
          tags: string[]
          use_cases: string[]
          search_vector: any
          created_at: string
        }
        Insert: {
          id?: string
          clause_type: string
          title: string
          content: string
          tags?: string[]
          use_cases?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          clause_type?: string
          title?: string
          content?: string
          tags?: string[]
          use_cases?: string[]
          created_at?: string
        }
      }
      contract_parameters: {
        Row: {
          id: string
          contract_type: string
          parameter_key: string
          parameter_label: string
          parameter_type: string
          is_required: boolean
          validation_rules: any | null
          help_text: string | null
          example_value: string | null
          options: any | null
          created_at: string
        }
        Insert: {
          id?: string
          contract_type: string
          parameter_key: string
          parameter_label: string
          parameter_type: string
          is_required?: boolean
          validation_rules?: any | null
          help_text?: string | null
          example_value?: string | null
          options?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          contract_type?: string
          parameter_key?: string
          parameter_label?: string
          parameter_type?: string
          is_required?: boolean
          validation_rules?: any | null
          help_text?: string | null
          example_value?: string | null
          options?: any | null
          created_at?: string
        }
      }
      contract_creation_sessions: {
        Row: {
          id: string
          user_id: string
          initial_request: string
          detected_type: string | null
          collected_parameters: Record<string, any>
          conversation_history: any[]
          agent_state: any
          generated_contract: string | null
          editable_fields: any[]
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          initial_request: string
          detected_type?: string | null
          collected_parameters?: Record<string, any>
          conversation_history?: any[]
          agent_state?: any
          generated_contract?: string | null
          editable_fields?: any[]
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          initial_request?: string
          detected_type?: string | null
          collected_parameters?: Record<string, any>
          conversation_history?: any[]
          agent_state?: any
          generated_contract?: string | null
          editable_fields?: any[]
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      template_folders: {
        Row: {
          id: string
          user_id: string
          name: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          upload_url: string | null
          file_key: string | null
          folder_id: string | null
          analysis_cache: {
            summary?: any
            risks?: any
            complete?: any
            lastAnalyzed?: string
            editableFields?: any[]
            parameters?: Record<string, any>
          }
          analysis_status: string | null
          analysis_progress: number | null
          last_analyzed_at: string | null
          analysis_retry_count: number | null
          analysis_error: string | null
          resolved_risks: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          upload_url?: string | null
          file_key?: string | null
          folder_id?: string | null
          analysis_cache?: {
            summary?: any
            risks?: any
            complete?: any
            lastAnalyzed?: string
            editableFields?: any[]
            parameters?: Record<string, any>
          }
          analysis_status?: string | null
          analysis_progress?: number | null
          last_analyzed_at?: string | null
          analysis_retry_count?: number | null
          analysis_error?: string | null
          resolved_risks?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          upload_url?: string | null
          file_key?: string | null
          folder_id?: string | null
          analysis_cache?: {
            summary?: any
            risks?: any
            complete?: any
            lastAnalyzed?: string
            editableFields?: any[]
            parameters?: Record<string, any>
          }
          analysis_status?: string | null
          analysis_progress?: number | null
          last_analyzed_at?: string | null
          analysis_retry_count?: number | null
          analysis_error?: string | null
          resolved_risks?: any[]
          created_at?: string
          updated_at?: string
        }
      }
      template_versions: {
        Row: {
          id: string
          template_id: string
          version_name: string
          vendor_name: string
          version_data: Record<string, any>
          generated_content: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          template_id: string
          version_name: string
          vendor_name: string
          version_data?: Record<string, any>
          generated_content?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          template_id?: string
          version_name?: string
          vendor_name?: string
          version_data?: Record<string, any>
          generated_content?: string | null
          created_at?: string
          created_by?: string
        }
      }
    }
  }
}
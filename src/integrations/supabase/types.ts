export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_actions: {
        Row: {
          action_data: Json
          action_type: string
          agent_id: string
          created_at: string | null
          execution_result: Json | null
          id: string
          moderation_flags: Json | null
          safety_check_passed: boolean | null
          simulation_result: Json | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_data?: Json
          action_type: string
          agent_id: string
          created_at?: string | null
          execution_result?: Json | null
          id?: string
          moderation_flags?: Json | null
          safety_check_passed?: boolean | null
          simulation_result?: Json | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          agent_id?: string
          created_at?: string | null
          execution_result?: Json | null
          id?: string
          moderation_flags?: Json | null
          safety_check_passed?: boolean | null
          simulation_result?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_memory: {
        Row: {
          agent_id: string
          content: Json
          created_at: string | null
          id: string
          memory_type: string
          metadata: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id: string
          content?: Json
          created_at?: string | null
          id?: string
          memory_type?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          content?: Json
          created_at?: string | null
          id?: string
          memory_type?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_requests: {
        Row: {
          agent_type: string
          created_at: string
          id: string
          input_data: Json
          result: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type: string
          created_at?: string
          id?: string
          input_data?: Json
          result?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: string
          created_at?: string
          id?: string
          input_data?: Json
          result?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: string
          last_run: string | null
          name: string
          status: string | null
          success_rate: number | null
          tasks_completed: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_run?: string | null
          name: string
          status?: string | null
          success_rate?: number | null
          tasks_completed?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_run?: string | null
          name?: string
          status?: string | null
          success_rate?: number | null
          tasks_completed?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_model_configs: {
        Row: {
          configuration: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          model_name: string
          model_type: string
          performance_metrics: Json | null
          updated_at: string | null
        }
        Insert: {
          configuration?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_name: string
          model_type: string
          performance_metrics?: Json | null
          updated_at?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_name?: string
          model_type?: string
          performance_metrics?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_model_preferences: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          model_parameters: Json | null
          preferred_model: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          model_parameters?: Json | null
          preferred_model: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          model_parameters?: Json | null
          preferred_model?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      approval_requests: {
        Row: {
          agent_action_id: string | null
          approval_notes: string | null
          approver_id: string | null
          created_at: string
          id: string
          request_data: Json
          requester_id: string
          status: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          agent_action_id?: string | null
          approval_notes?: string | null
          approver_id?: string | null
          created_at?: string
          id?: string
          request_data?: Json
          requester_id: string
          status?: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          agent_action_id?: string | null
          approval_notes?: string | null
          approver_id?: string | null
          created_at?: string
          id?: string
          request_data?: Json
          requester_id?: string
          status?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_agent_action_id_fkey"
            columns: ["agent_action_id"]
            isOneToOne: false
            referencedRelation: "agent_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "approval_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows: {
        Row: {
          approval_chain: Json
          created_at: string
          id: string
          is_active: boolean | null
          trigger_conditions: Json
          updated_at: string
          user_id: string
          workflow_name: string
        }
        Insert: {
          approval_chain?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          trigger_conditions?: Json
          updated_at?: string
          user_id: string
          workflow_name: string
        }
        Update: {
          approval_chain?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          trigger_conditions?: Json
          updated_at?: string
          user_id?: string
          workflow_name?: string
        }
        Relationships: []
      }
      assessment_questions: {
        Row: {
          correct_answer: string | null
          created_at: string
          difficulty: string
          evaluation_criteria: Json | null
          id: string
          options: Json | null
          points: number
          question_text: string
          question_type: string
          skill_type: string
          time_limit: number | null
          updated_at: string
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          difficulty: string
          evaluation_criteria?: Json | null
          id?: string
          options?: Json | null
          points?: number
          question_text: string
          question_type: string
          skill_type: string
          time_limit?: number | null
          updated_at?: string
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          difficulty?: string
          evaluation_criteria?: Json | null
          id?: string
          options?: Json | null
          points?: number
          question_text?: string
          question_type?: string
          skill_type?: string
          time_limit?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      assessment_responses: {
        Row: {
          ai_feedback: string | null
          answered_at: string
          id: string
          is_correct: boolean | null
          points_earned: number
          question_id: string
          session_id: string
          time_taken: number | null
          user_answer: string
        }
        Insert: {
          ai_feedback?: string | null
          answered_at?: string
          id?: string
          is_correct?: boolean | null
          points_earned?: number
          question_id: string
          session_id: string
          time_taken?: number | null
          user_answer: string
        }
        Update: {
          ai_feedback?: string | null
          answered_at?: string
          id?: string
          is_correct?: boolean | null
          points_earned?: number
          question_id?: string
          session_id?: string
          time_taken?: number | null
          user_answer?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_results: {
        Row: {
          ai_feedback: string | null
          competency_profile: Json
          completed_at: string
          created_at: string
          id: string
          improvement_areas: Json
          overall_score: number
          recommendations: Json
          session_id: string
          skill_scores: Json
          strengths: Json
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          competency_profile?: Json
          completed_at?: string
          created_at?: string
          id?: string
          improvement_areas?: Json
          overall_score?: number
          recommendations?: Json
          session_id: string
          skill_scores?: Json
          strengths?: Json
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          competency_profile?: Json
          completed_at?: string
          created_at?: string
          id?: string
          improvement_areas?: Json
          overall_score?: number
          recommendations?: Json
          session_id?: string
          skill_scores?: Json
          strengths?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "assessment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_sessions: {
        Row: {
          answered_questions: number
          completed_at: string | null
          created_at: string
          current_question_index: number
          id: string
          selected_skills: Json
          session_data: Json
          session_type: string
          started_at: string
          status: string
          total_questions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          answered_questions?: number
          completed_at?: string | null
          created_at?: string
          current_question_index?: number
          id?: string
          selected_skills?: Json
          session_data?: Json
          session_type?: string
          started_at?: string
          status?: string
          total_questions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          answered_questions?: number
          completed_at?: string | null
          created_at?: string
          current_question_index?: number
          id?: string
          selected_skills?: Json
          session_data?: Json
          session_type?: string
          started_at?: string
          status?: string
          total_questions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          resource_id: string | null
          resource_type: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      charging_stations: {
        Row: {
          address: string
          amenities: string[] | null
          available_ports: number
          created_at: string
          external_id: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          power_output: string
          price_per_kwh: number
          provider: string | null
          rating: number | null
          station_type: string
          total_ports: number
          updated_at: string
        }
        Insert: {
          address: string
          amenities?: string[] | null
          available_ports?: number
          created_at?: string
          external_id?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          power_output: string
          price_per_kwh: number
          provider?: string | null
          rating?: number | null
          station_type: string
          total_ports?: number
          updated_at?: string
        }
        Update: {
          address?: string
          amenities?: string[] | null
          available_ports?: number
          created_at?: string
          external_id?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          power_output?: string
          price_per_kwh?: number
          provider?: string | null
          rating?: number | null
          station_type?: string
          total_ports?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          context_data: Json | null
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context_data?: Json | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context_data?: Json | null
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cognify_puzzles: {
        Row: {
          attempted_at: string | null
          category: string
          created_at: string | null
          difficulty: string
          expected_answer: string
          explanation: string
          hint: string | null
          id: string
          is_correct: boolean | null
          points: number | null
          puzzle_id: string
          question: string
          session_id: string | null
          type: string
          user_answer: string | null
        }
        Insert: {
          attempted_at?: string | null
          category: string
          created_at?: string | null
          difficulty: string
          expected_answer: string
          explanation: string
          hint?: string | null
          id?: string
          is_correct?: boolean | null
          points?: number | null
          puzzle_id: string
          question: string
          session_id?: string | null
          type: string
          user_answer?: string | null
        }
        Update: {
          attempted_at?: string | null
          category?: string
          created_at?: string | null
          difficulty?: string
          expected_answer?: string
          explanation?: string
          hint?: string | null
          id?: string
          is_correct?: boolean | null
          points?: number | null
          puzzle_id?: string
          question?: string
          session_id?: string | null
          type?: string
          user_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cognify_puzzles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cognify_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cognify_sessions: {
        Row: {
          created_at: string | null
          current_level: number | null
          id: string
          puzzles_solved: number | null
          session_id: string
          status: string
          streak: number | null
          total_score: number | null
          updated_at: string | null
          user_id: string | null
          user_profile: Json
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          id?: string
          puzzles_solved?: number | null
          session_id: string
          status?: string
          streak?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_profile?: Json
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          id?: string
          puzzles_solved?: number | null
          session_id?: string
          status?: string
          streak?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_profile?: Json
        }
        Relationships: [
          {
            foreignKeyName: "cognify_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "edgesense_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_workspaces: {
        Row: {
          content: Json
          created_at: string
          id: string
          settings: Json
          solution_id: string
          updated_at: string
          version: number
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          settings?: Json
          solution_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          settings?: Json
          solution_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_workspaces_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_analyses: {
        Row: {
          analysis_type: string
          clause_analysis: Json | null
          created_at: string | null
          document_id: string | null
          findings: Json
          id: string
          recommendations: Json | null
          red_flags: Json | null
          risk_score: number | null
          user_id: string | null
        }
        Insert: {
          analysis_type: string
          clause_analysis?: Json | null
          created_at?: string | null
          document_id?: string | null
          findings?: Json
          id?: string
          recommendations?: Json | null
          red_flags?: Json | null
          risk_score?: number | null
          user_id?: string | null
        }
        Update: {
          analysis_type?: string
          clause_analysis?: Json | null
          created_at?: string | null
          document_id?: string | null
          findings?: Json
          id?: string
          recommendations?: Json | null
          red_flags?: Json | null
          risk_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_analyses_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      credential_vault: {
        Row: {
          created_at: string
          credential_type: string
          encrypted_data: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          service_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_type: string
          encrypted_data: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          service_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credential_type?: string
          encrypted_data?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          service_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deployment_configs: {
        Row: {
          config_data: Json
          created_at: string
          deployment_type: string
          id: string
          manifest_files: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config_data?: Json
          created_at?: string
          deployment_type: string
          id?: string
          manifest_files?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config_data?: Json
          created_at?: string
          deployment_type?: string
          id?: string
          manifest_files?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_collaborations: {
        Row: {
          branch_name: string | null
          created_at: string
          document_id: string
          github_repo_url: string | null
          id: string
          last_commit_hash: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          branch_name?: string | null
          created_at?: string
          document_id: string
          github_repo_url?: string | null
          id?: string
          last_commit_hash?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          branch_name?: string | null
          created_at?: string
          document_id?: string
          github_repo_url?: string | null
          id?: string
          last_commit_hash?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_collaborations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_comments: {
        Row: {
          content: string
          created_at: string
          document_id: string
          id: string
          is_resolved: boolean | null
          parent_id: string | null
          position_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          id?: string
          is_resolved?: boolean | null
          parent_id?: string | null
          position_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          id?: string
          is_resolved?: boolean | null
          parent_id?: string | null
          position_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "document_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      document_processing_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          document_id: string | null
          error_message: string | null
          id: string
          input_parameters: Json | null
          job_type: string
          processing_time_ms: number | null
          results: Json | null
          status: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          document_id?: string | null
          error_message?: string | null
          id?: string
          input_parameters?: Json | null
          job_type: string
          processing_time_ms?: number | null
          results?: Json | null
          status?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          document_id?: string | null
          error_message?: string | null
          id?: string
          input_parameters?: Json | null
          job_type?: string
          processing_time_ms?: number | null
          results?: Json | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_processing_jobs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          jurisdiction: string | null
          name: string
          placeholders: Json | null
          template_content: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string | null
          name: string
          placeholders?: Json | null
          template_content: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string | null
          name?: string
          placeholders?: Json | null
          template_content?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      document_triage: {
        Row: {
          action_items: Json | null
          category: string
          created_at: string | null
          deadline_analysis: Json | null
          document_id: string | null
          id: string
          priority_score: number | null
          triage_reasoning: string | null
          urgency_level: string
          user_id: string | null
        }
        Insert: {
          action_items?: Json | null
          category: string
          created_at?: string | null
          deadline_analysis?: Json | null
          document_id?: string | null
          id?: string
          priority_score?: number | null
          triage_reasoning?: string | null
          urgency_level: string
          user_id?: string | null
        }
        Update: {
          action_items?: Json | null
          category?: string
          created_at?: string | null
          deadline_analysis?: Json | null
          document_id?: string | null
          id?: string
          priority_score?: number | null
          triage_reasoning?: string | null
          urgency_level?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_triage_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          analysis_results: Json | null
          created_at: string | null
          id: string
          name: string
          status: string
          storage_path: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_results?: Json | null
          created_at?: string | null
          id?: string
          name: string
          status?: string
          storage_path: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_results?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          status?: string
          storage_path?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      domains: {
        Row: {
          created_at: string | null
          data_sources: Json | null
          default_model: string
          id: string
          name: string
          namespace: string
          system_prompt: string
        }
        Insert: {
          created_at?: string | null
          data_sources?: Json | null
          default_model: string
          id?: string
          name: string
          namespace: string
          system_prompt: string
        }
        Update: {
          created_at?: string | null
          data_sources?: Json | null
          default_model?: string
          id?: string
          name?: string
          namespace?: string
          system_prompt?: string
        }
        Relationships: []
      }
      edgesense_profiles: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
          username: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          username: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      email_agents: {
        Row: {
          created_at: string
          credentials_vault_id: string | null
          email_provider: string
          id: string
          last_sync: string | null
          name: string
          sorting_rules: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credentials_vault_id?: string | null
          email_provider: string
          id?: string
          last_sync?: string | null
          name: string
          sorting_rules?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credentials_vault_id?: string | null
          email_provider?: string
          id?: string
          last_sync?: string | null
          name?: string
          sorting_rules?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ethical_compliance_checks: {
        Row: {
          check_type: string
          compliance_framework: string
          created_at: string | null
          document_id: string | null
          id: string
          recommendations: Json | null
          results: Json
          risk_level: string | null
          user_id: string | null
        }
        Insert: {
          check_type: string
          compliance_framework: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          recommendations?: Json | null
          results?: Json
          risk_level?: string | null
          user_id?: string | null
        }
        Update: {
          check_type?: string
          compliance_framework?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          recommendations?: Json | null
          results?: Json
          risk_level?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ethical_compliance_checks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      explainable_interfaces: {
        Row: {
          components: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          layout_config: Json
          model_id: string | null
          name: string
          status: Database["public"]["Enums"]["interface_status"] | null
          target_audience: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          components?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          layout_config?: Json
          model_id?: string | null
          name: string
          status?: Database["public"]["Enums"]["interface_status"] | null
          target_audience?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          components?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          layout_config?: Json
          model_id?: string | null
          name?: string
          status?: Database["public"]["Enums"]["interface_status"] | null
          target_audience?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "explainable_interfaces_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ml_models"
            referencedColumns: ["id"]
          },
        ]
      }
      explanation_methods: {
        Row: {
          configuration_schema: Json
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: Database["public"]["Enums"]["explanation_method"]
          supported_model_types: string[]
        }
        Insert: {
          configuration_schema?: Json
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: Database["public"]["Enums"]["explanation_method"]
          supported_model_types?: string[]
        }
        Update: {
          configuration_schema?: Json
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: Database["public"]["Enums"]["explanation_method"]
          supported_model_types?: string[]
        }
        Relationships: []
      }
      explanation_results: {
        Row: {
          created_at: string | null
          expires_at: string | null
          explanation_data: Json
          id: string
          input_data: Json
          interface_id: string | null
          metadata: Json | null
          method: Database["public"]["Enums"]["explanation_method"]
          model_id: string | null
          status: Database["public"]["Enums"]["explanation_status"] | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          explanation_data: Json
          id?: string
          input_data: Json
          interface_id?: string | null
          metadata?: Json | null
          method: Database["public"]["Enums"]["explanation_method"]
          model_id?: string | null
          status?: Database["public"]["Enums"]["explanation_status"] | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          explanation_data?: Json
          id?: string
          input_data?: Json
          interface_id?: string | null
          metadata?: Json | null
          method?: Database["public"]["Enums"]["explanation_method"]
          model_id?: string | null
          status?: Database["public"]["Enums"]["explanation_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "explanation_results_interface_id_fkey"
            columns: ["interface_id"]
            isOneToOne: false
            referencedRelation: "explainable_interfaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "explanation_results_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ml_models"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_profiles: {
        Row: {
          availability_hours_per_week: number | null
          bio: string | null
          created_at: string
          experience_years: number | null
          hourly_rate: number | null
          id: string
          industries: string[] | null
          portfolio_url: string | null
          preferred_budget_max: number | null
          preferred_budget_min: number | null
          resume_url: string | null
          skills: string[] | null
          timezone: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_hours_per_week?: number | null
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          industries?: string[] | null
          portfolio_url?: string | null
          preferred_budget_max?: number | null
          preferred_budget_min?: number | null
          resume_url?: string | null
          skills?: string[] | null
          timezone?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_hours_per_week?: number | null
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          industries?: string[] | null
          portfolio_url?: string | null
          preferred_budget_max?: number | null
          preferred_budget_min?: number | null
          resume_url?: string | null
          skills?: string[] | null
          timezone?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_specs: {
        Row: {
          created_at: string
          created_by: string | null
          generated_code: Json | null
          id: string
          implementation_plan: Json | null
          project_id: string | null
          specification: Json
          status: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          generated_code?: Json | null
          id?: string
          implementation_plan?: Json | null
          project_id?: string | null
          specification: Json
          status?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          generated_code?: Json | null
          id?: string
          implementation_plan?: Json | null
          project_id?: string | null
          specification?: Json
          status?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "generated_specs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_specs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_records: {
        Row: {
          created_at: string
          evidence_files: string[] | null
          id: string
          implementation_id: string
          measurement_date: string
          metrics_data: Json
          notes: string | null
          recorded_by: string | null
          verification_method: string | null
        }
        Insert: {
          created_at?: string
          evidence_files?: string[] | null
          id?: string
          implementation_id: string
          measurement_date: string
          metrics_data?: Json
          notes?: string | null
          recorded_by?: string | null
          verification_method?: string | null
        }
        Update: {
          created_at?: string
          evidence_files?: string[] | null
          id?: string
          implementation_id?: string
          measurement_date?: string
          metrics_data?: Json
          notes?: string | null
          recorded_by?: string | null
          verification_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_records_implementation_id_fkey"
            columns: ["implementation_id"]
            isOneToOne: false
            referencedRelation: "solution_implementations"
            referencedColumns: ["id"]
          },
        ]
      }
      interface_shares: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          interface_id: string | null
          permission_level: string | null
          shared_with: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          interface_id?: string | null
          permission_level?: string | null
          shared_with?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          interface_id?: string | null
          permission_level?: string | null
          shared_with?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interface_shares_interface_id_fkey"
            columns: ["interface_id"]
            isOneToOne: false
            referencedRelation: "explainable_interfaces"
            referencedColumns: ["id"]
          },
        ]
      }
      interface_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          is_featured: boolean | null
          name: string
          preview_image: string | null
          template_config: Json
          usage_count: number | null
          use_case: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_featured?: boolean | null
          name: string
          preview_image?: string | null
          template_config: Json
          usage_count?: number | null
          use_case?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_featured?: boolean | null
          name?: string
          preview_image?: string | null
          template_config?: Json
          usage_count?: number | null
          use_case?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applied_at: string
          cover_letter: string | null
          id: string
          job_id: string
          notes: string | null
          platform: string
          proposal_amount: number | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id: string
          notes?: string | null
          platform: string
          proposal_amount?: number | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          platform?: string
          proposal_amount?: number | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_count: number | null
          application_url: string
          budget_amount: number | null
          budget_currency: string | null
          budget_max: number | null
          budget_min: number | null
          budget_type: Database["public"]["Enums"]["budget_type"]
          category: string | null
          client_hires: number | null
          client_rating: number | null
          client_total_spent: number | null
          client_verified: boolean | null
          competition_level:
            | Database["public"]["Enums"]["competition_level"]
            | null
          created_at: string
          data_freshness: Database["public"]["Enums"]["data_freshness"] | null
          deadline: string | null
          description: string
          external_id: string | null
          fetched_at: string
          id: string
          last_updated: string | null
          location: string | null
          platform: string
          posted_date: string
          quality_score: number | null
          remote: boolean | null
          skills: string[] | null
          source: string
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          application_count?: number | null
          application_url: string
          budget_amount?: number | null
          budget_currency?: string | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: Database["public"]["Enums"]["budget_type"]
          category?: string | null
          client_hires?: number | null
          client_rating?: number | null
          client_total_spent?: number | null
          client_verified?: boolean | null
          competition_level?:
            | Database["public"]["Enums"]["competition_level"]
            | null
          created_at?: string
          data_freshness?: Database["public"]["Enums"]["data_freshness"] | null
          deadline?: string | null
          description: string
          external_id?: string | null
          fetched_at?: string
          id?: string
          last_updated?: string | null
          location?: string | null
          platform: string
          posted_date: string
          quality_score?: number | null
          remote?: boolean | null
          skills?: string[] | null
          source: string
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          application_count?: number | null
          application_url?: string
          budget_amount?: number | null
          budget_currency?: string | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: Database["public"]["Enums"]["budget_type"]
          category?: string | null
          client_hires?: number | null
          client_rating?: number | null
          client_total_spent?: number | null
          client_verified?: boolean | null
          competition_level?:
            | Database["public"]["Enums"]["competition_level"]
            | null
          created_at?: string
          data_freshness?: Database["public"]["Enums"]["data_freshness"] | null
          deadline?: string | null
          description?: string
          external_id?: string | null
          fetched_at?: string
          id?: string
          last_updated?: string | null
          location?: string | null
          platform?: string
          posted_date?: string
          quality_score?: number | null
          remote?: boolean | null
          skills?: string[] | null
          source?: string
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_documents: {
        Row: {
          chunks_count: number | null
          created_at: string | null
          domain: string
          embeddings_count: number | null
          id: string
          name: string
          processing_progress: number | null
          size: number | null
          status: string | null
          type: string | null
        }
        Insert: {
          chunks_count?: number | null
          created_at?: string | null
          domain: string
          embeddings_count?: number | null
          id?: string
          name: string
          processing_progress?: number | null
          size?: number | null
          status?: string | null
          type?: string | null
        }
        Update: {
          chunks_count?: number | null
          created_at?: string | null
          domain?: string
          embeddings_count?: number | null
          id?: string
          name?: string
          processing_progress?: number | null
          size?: number | null
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      legal_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string
          title: string
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority: string
          title: string
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      legal_deadlines: {
        Row: {
          created_at: string
          deadline_date: string
          description: string | null
          document_id: string | null
          id: string
          priority: string | null
          reminder_sent: boolean | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline_date: string
          description?: string | null
          document_id?: string | null
          id?: string
          priority?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline_date?: string
          description?: string | null
          document_id?: string | null
          id?: string
          priority?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_deadlines_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_knowledge_base: {
        Row: {
          category: string
          citations: Json | null
          confidence_score: number | null
          content: string
          created_at: string | null
          document_type: string | null
          id: string
          jurisdiction: string | null
          last_updated: string | null
          practice_area: string | null
          source_url: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          category: string
          citations?: Json | null
          confidence_score?: number | null
          content: string
          created_at?: string | null
          document_type?: string | null
          id?: string
          jurisdiction?: string | null
          last_updated?: string | null
          practice_area?: string | null
          source_url?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          category?: string
          citations?: Json | null
          confidence_score?: number | null
          content?: string
          created_at?: string | null
          document_type?: string | null
          id?: string
          jurisdiction?: string | null
          last_updated?: string | null
          practice_area?: string | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      legal_precedents: {
        Row: {
          case_name: string
          citation: string | null
          court: string
          created_at: string | null
          date_decided: string | null
          full_text: string | null
          id: string
          jurisdiction: string
          key_principles: Json | null
          practice_areas: string[] | null
          relevance_keywords: string[] | null
          summary: string | null
        }
        Insert: {
          case_name: string
          citation?: string | null
          court: string
          created_at?: string | null
          date_decided?: string | null
          full_text?: string | null
          id?: string
          jurisdiction: string
          key_principles?: Json | null
          practice_areas?: string[] | null
          relevance_keywords?: string[] | null
          summary?: string | null
        }
        Update: {
          case_name?: string
          citation?: string | null
          court?: string
          created_at?: string | null
          date_decided?: string | null
          full_text?: string | null
          id?: string
          jurisdiction?: string
          key_principles?: Json | null
          practice_areas?: string[] | null
          relevance_keywords?: string[] | null
          summary?: string | null
        }
        Relationships: []
      }
      marketplace_agents: {
        Row: {
          category: string
          configuration: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          downloads: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number | null
          price_type: string | null
          rating: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          downloads?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price?: number | null
          price_type?: string | null
          rating?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          downloads?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number | null
          price_type?: string | null
          rating?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      match_scores: {
        Row: {
          budget_match: number | null
          calculated_at: string
          experience_match: number | null
          expires_at: string
          explanation: string | null
          id: string
          job_id: string
          match_score: number
          missing_skills: string[] | null
          recommendations: string[] | null
          skills_match: number | null
          user_id: string
        }
        Insert: {
          budget_match?: number | null
          calculated_at?: string
          experience_match?: number | null
          expires_at?: string
          explanation?: string | null
          id?: string
          job_id: string
          match_score?: number
          missing_skills?: string[] | null
          recommendations?: string[] | null
          skills_match?: number | null
          user_id: string
        }
        Update: {
          budget_match?: number | null
          calculated_at?: string
          experience_match?: number | null
          expires_at?: string
          explanation?: string | null
          id?: string
          job_id?: string
          match_score?: number
          missing_skills?: string[] | null
          recommendations?: string[] | null
          skills_match?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_scores_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      mcp_connections: {
        Row: {
          connection_config: Json
          connection_name: string
          connection_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          live_streaming_enabled: boolean | null
          streaming_config: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connection_config?: Json
          connection_name: string
          connection_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          live_streaming_enabled?: boolean | null
          streaming_config?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connection_config?: Json
          connection_name?: string
          connection_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          live_streaming_enabled?: boolean | null
          streaming_config?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      media_files: {
        Row: {
          agent_id: string
          analysis_results: Json | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          mime_type: string
          processing_status: string
          updated_at: string | null
          uploaded_by: string
          user_id: string
        }
        Insert: {
          agent_id: string
          analysis_results?: Json | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          mime_type: string
          processing_status?: string
          updated_at?: string | null
          uploaded_by: string
          user_id: string
        }
        Update: {
          agent_id?: string
          analysis_results?: Json | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          mime_type?: string
          processing_status?: string
          updated_at?: string | null
          uploaded_by?: string
          user_id?: string
        }
        Relationships: []
      }
      media_processing_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          file_id: string
          id: string
          options: Json | null
          processing_type: string
          result: Json | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_id: string
          id?: string
          options?: Json | null
          processing_type: string
          result?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_id?: string
          id?: string
          options?: Json | null
          processing_type?: string
          result?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_processing_requests_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_files: {
        Row: {
          analysis: string | null
          created_at: string | null
          file_name: string
          file_type: string
          file_url: string
          id: string
          user_id: string | null
        }
        Insert: {
          analysis?: string | null
          created_at?: string | null
          file_name: string
          file_type: string
          file_url: string
          id?: string
          user_id?: string | null
        }
        Update: {
          analysis?: string | null
          created_at?: string | null
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          diagnosis: string
          id: string
          simplified_explanation: string | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          diagnosis: string
          id?: string
          simplified_explanation?: string | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          diagnosis?: string
          id?: string
          simplified_explanation?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meditation_sessions: {
        Row: {
          category: string
          completed: boolean | null
          created_at: string | null
          duration: number
          id: string
          user_id: string | null
        }
        Insert: {
          category: string
          completed?: boolean | null
          created_at?: string | null
          duration: number
          id?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          completed?: boolean | null
          created_at?: string | null
          duration?: number
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meditation_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_models: {
        Row: {
          api_endpoint: string | null
          api_key_required: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          feature_names: string[] | null
          framework: Database["public"]["Enums"]["model_framework"]
          id: string
          input_schema: Json
          is_active: boolean | null
          model_type: string
          name: string
          output_schema: Json
          target_names: string[] | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_key_required?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          feature_names?: string[] | null
          framework: Database["public"]["Enums"]["model_framework"]
          id?: string
          input_schema?: Json
          is_active?: boolean | null
          model_type: string
          name: string
          output_schema?: Json
          target_names?: string[] | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_key_required?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          feature_names?: string[] | null
          framework?: Database["public"]["Enums"]["model_framework"]
          id?: string
          input_schema?: Json
          is_active?: boolean | null
          model_type?: string
          name?: string
          output_schema?: Json
          target_names?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_sync_status: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          jobs_fetched: number | null
          last_sync_at: string | null
          next_sync_at: string | null
          platform: string
          sync_status: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          jobs_fetched?: number | null
          last_sync_at?: string | null
          next_sync_at?: string | null
          platform: string
          sync_status?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          jobs_fetched?: number | null
          last_sync_at?: string | null
          next_sync_at?: string | null
          platform?: string
          sync_status?: string | null
        }
        Relationships: []
      }
      problem_interests: {
        Row: {
          created_at: string
          estimated_timeline: number | null
          id: string
          interest_type: string
          problem_id: string
          proposed_approach: string | null
          resource_commitment: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          estimated_timeline?: number | null
          id?: string
          interest_type?: string
          problem_id: string
          proposed_approach?: string | null
          resource_commitment?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          estimated_timeline?: number | null
          id?: string
          interest_type?: string
          problem_id?: string
          proposed_approach?: string | null
          resource_commitment?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_interests_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      problems: {
        Row: {
          category: string
          complexity: Database["public"]["Enums"]["complexity_level"]
          constraints: Json | null
          created_at: string
          deadline: string | null
          description: string
          id: string
          impact_scope: Database["public"]["Enums"]["impact_scope"]
          interest_count: number | null
          resource_requirements: Json
          skills_needed: string[] | null
          solution_count: number | null
          stakeholders: Json
          status: Database["public"]["Enums"]["problem_status"]
          subcategory: string | null
          submitted_by: string | null
          success_criteria: Json
          tags: string[] | null
          title: string
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
          verification_score: number | null
          verification_status: string | null
          view_count: number | null
        }
        Insert: {
          category: string
          complexity?: Database["public"]["Enums"]["complexity_level"]
          constraints?: Json | null
          created_at?: string
          deadline?: string | null
          description: string
          id?: string
          impact_scope?: Database["public"]["Enums"]["impact_scope"]
          interest_count?: number | null
          resource_requirements?: Json
          skills_needed?: string[] | null
          solution_count?: number | null
          stakeholders?: Json
          status?: Database["public"]["Enums"]["problem_status"]
          subcategory?: string | null
          submitted_by?: string | null
          success_criteria?: Json
          tags?: string[] | null
          title: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          verification_score?: number | null
          verification_status?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string
          complexity?: Database["public"]["Enums"]["complexity_level"]
          constraints?: Json | null
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          impact_scope?: Database["public"]["Enums"]["impact_scope"]
          interest_count?: number | null
          resource_requirements?: Json
          skills_needed?: string[] | null
          solution_count?: number | null
          stakeholders?: Json
          status?: Database["public"]["Enums"]["problem_status"]
          subcategory?: string | null
          submitted_by?: string | null
          success_criteria?: Json
          tags?: string[] | null
          title?: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          verification_score?: number | null
          verification_status?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_documents: {
        Row: {
          content: string
          created_at: string | null
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      requirement_sessions: {
        Row: {
          created_at: string
          domain: string
          id: string
          project_id: string | null
          session_data: Json
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          project_id?: string | null
          session_data?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          project_id?: string | null
          session_data?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirement_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      research_results: {
        Row: {
          analysis: string
          cases: Json | null
          compliance_checks: Json | null
          confidence_score: number | null
          court_type: string | null
          created_at: string
          id: string
          jurisdiction: string | null
          practice_area: string | null
          query: string
          statutes: Json | null
          templates: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis: string
          cases?: Json | null
          compliance_checks?: Json | null
          confidence_score?: number | null
          court_type?: string | null
          created_at?: string
          id?: string
          jurisdiction?: string | null
          practice_area?: string | null
          query: string
          statutes?: Json | null
          templates?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis?: string
          cases?: Json | null
          compliance_checks?: Json | null
          confidence_score?: number | null
          court_type?: string | null
          created_at?: string
          id?: string
          jurisdiction?: string | null
          practice_area?: string | null
          query?: string
          statutes?: Json | null
          templates?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          title: string
          type: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          type: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          type?: string
          url?: string
        }
        Relationships: []
      }
      safety_policies: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          policy_name: string
          policy_rules: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          policy_name: string
          policy_rules?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          policy_name?: string
          policy_rules?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          id: string
          job_id: string
          notes: string | null
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          job_id: string
          notes?: string | null
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          job_id?: string
          notes?: string | null
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      service_integrations: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          oauth_config: Json
          refresh_token_encrypted: string | null
          service_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          oauth_config?: Json
          refresh_token_encrypted?: string | null
          service_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          oauth_config?: Json
          refresh_token_encrypted?: string | null
          service_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skills_assessments: {
        Row: {
          answers: Json
          assessment_type: string
          competency_profile: Json
          completed_at: string | null
          created_at: string | null
          feedback: string | null
          id: string
          questions: Json
          score: number | null
          skills: Json
          status: string
          user_id: string | null
        }
        Insert: {
          answers?: Json
          assessment_type: string
          competency_profile?: Json
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          questions?: Json
          score?: number | null
          skills?: Json
          status?: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          assessment_type?: string
          competency_profile?: Json
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          questions?: Json
          score?: number | null
          skills?: Json
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "edgesense_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_implementations: {
        Row: {
          context: string
          created_at: string
          id: string
          resources_allocated: Json
          solution_id: string
          stakeholders: Json
          started_by: string | null
          status: string
          success_metrics: Json
          target_beneficiaries: Json
          timeline: Json
          tracking_frequency: string
          updated_at: string
        }
        Insert: {
          context: string
          created_at?: string
          id?: string
          resources_allocated?: Json
          solution_id: string
          stakeholders?: Json
          started_by?: string | null
          status?: string
          success_metrics?: Json
          target_beneficiaries?: Json
          timeline?: Json
          tracking_frequency?: string
          updated_at?: string
        }
        Update: {
          context?: string
          created_at?: string
          id?: string
          resources_allocated?: Json
          solution_id?: string
          stakeholders?: Json
          started_by?: string | null
          status?: string
          success_metrics?: Json
          target_beneficiaries?: Json
          timeline?: Json
          tracking_frequency?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_implementations_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_phases: {
        Row: {
          completed_at: string | null
          created_at: string
          deliverables: Json
          description: string | null
          end_date: string | null
          estimated_duration_weeks: number | null
          id: string
          name: string
          order_index: number
          progress_percentage: number | null
          required_skills: string[] | null
          solution_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["phase_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deliverables?: Json
          description?: string | null
          end_date?: string | null
          estimated_duration_weeks?: number | null
          id?: string
          name: string
          order_index: number
          progress_percentage?: number | null
          required_skills?: string[] | null
          solution_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["phase_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deliverables?: Json
          description?: string | null
          end_date?: string | null
          estimated_duration_weeks?: number | null
          id?: string
          name?: string
          order_index?: number
          progress_percentage?: number | null
          required_skills?: string[] | null
          solution_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["phase_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_phases_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          approach: string
          collaboration_settings: Json
          created_at: string
          created_by: string | null
          current_phase: string | null
          description: string
          feasibility_score: number | null
          id: string
          impact_potential: number | null
          innovation_score: number | null
          ip_protection: Json | null
          licensing_terms: Json | null
          problem_id: string
          progress_percentage: number | null
          resource_efficiency: number | null
          status: Database["public"]["Enums"]["solution_status"]
          title: string
          updated_at: string
        }
        Insert: {
          approach: string
          collaboration_settings?: Json
          created_at?: string
          created_by?: string | null
          current_phase?: string | null
          description: string
          feasibility_score?: number | null
          id?: string
          impact_potential?: number | null
          innovation_score?: number | null
          ip_protection?: Json | null
          licensing_terms?: Json | null
          problem_id: string
          progress_percentage?: number | null
          resource_efficiency?: number | null
          status?: Database["public"]["Enums"]["solution_status"]
          title: string
          updated_at?: string
        }
        Update: {
          approach?: string
          collaboration_settings?: Json
          created_at?: string
          created_by?: string | null
          current_phase?: string | null
          description?: string
          feasibility_score?: number | null
          id?: string
          impact_potential?: number | null
          innovation_score?: number | null
          ip_protection?: Json | null
          licensing_terms?: Json | null
          problem_id?: string
          progress_percentage?: number | null
          resource_efficiency?: number | null
          status?: Database["public"]["Enums"]["solution_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solutions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      specs: {
        Row: {
          created_at: string | null
          created_by: string | null
          domain: string
          id: string
          payload: Json
          state: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          domain: string
          id?: string
          payload: Json
          state?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          domain?: string
          id?: string
          payload?: Json
          state?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_memberships: {
        Row: {
          commitment_level: Database["public"]["Enums"]["commitment_level"]
          contributions: Json | null
          hours_contributed: number | null
          id: string
          joined_at: string
          left_at: string | null
          permissions: Json
          role: Database["public"]["Enums"]["team_role"]
          solution_id: string
          user_id: string
        }
        Insert: {
          commitment_level?: Database["public"]["Enums"]["commitment_level"]
          contributions?: Json | null
          hours_contributed?: number | null
          id?: string
          joined_at?: string
          left_at?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["team_role"]
          solution_id: string
          user_id: string
        }
        Update: {
          commitment_level?: Database["public"]["Enums"]["commitment_level"]
          contributions?: Json | null
          hours_contributed?: number | null
          id?: string
          joined_at?: string
          left_at?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["team_role"]
          solution_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          name: string
          saml_config: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name: string
          saml_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string
          saml_config?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      therapy_sessions: {
        Row: {
          created_at: string | null
          crisis_detected: boolean | null
          id: string
          sentiment_score: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          crisis_detected?: boolean | null
          id?: string
          sentiment_score?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          crisis_detected?: boolean | null
          id?: string
          sentiment_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapy_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      training_simulations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          feedback: string | null
          id: string
          scenario_type: string
          score: number | null
          simulation_data: Json
          simulation_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          scenario_type: string
          score?: number | null
          simulation_data?: Json
          simulation_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          scenario_type?: string
          score?: number | null
          simulation_data?: Json
          simulation_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "edgesense_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          charging_session_id: string | null
          created_at: string
          currency: string
          id: string
          kwh_consumed: number | null
          session_duration: number | null
          station_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          transaction_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          charging_session_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          kwh_consumed?: number | null
          session_duration?: number | null
          station_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          charging_session_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          kwh_consumed?: number | null
          session_duration?: number | null
          station_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "charging_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_sessions: {
        Row: {
          content: string
          created_at: string | null
          difficulty: string
          id: string
          lesson: string
          messages: Json
          next_steps: Json
          progress: number | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          difficulty: string
          id?: string
          lesson: string
          messages?: Json
          next_steps?: Json
          progress?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          difficulty?: string
          id?: string
          lesson?: string
          messages?: Json
          next_steps?: Json
          progress?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "edgesense_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_data: Json
          achievement_type: string
          created_at: string
          id: string
          points_awarded: number | null
          user_id: string
        }
        Insert: {
          achievement_data?: Json
          achievement_type: string
          created_at?: string
          id?: string
          points_awarded?: number | null
          user_id: string
        }
        Update: {
          achievement_data?: Json
          achievement_type?: string
          created_at?: string
          id?: string
          points_awarded?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          id: string
          metric_data: Json | null
          metric_name: string
          metric_value: number
          recorded_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          metric_data?: Json | null
          metric_name: string
          metric_value: number
          recorded_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          metric_data?: Json | null
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          collaboration_preferences: Json
          created_at: string
          notification_settings: Json
          preferred_categories: string[] | null
          preferred_complexity:
            | Database["public"]["Enums"]["complexity_level"][]
            | null
          preferred_impact_scope:
            | Database["public"]["Enums"]["impact_scope"][]
            | null
          updated_at: string
          user_id: string
        }
        Insert: {
          collaboration_preferences?: Json
          created_at?: string
          notification_settings?: Json
          preferred_categories?: string[] | null
          preferred_complexity?:
            | Database["public"]["Enums"]["complexity_level"][]
            | null
          preferred_impact_scope?:
            | Database["public"]["Enums"]["impact_scope"][]
            | null
          updated_at?: string
          user_id: string
        }
        Update: {
          collaboration_preferences?: Json
          created_at?: string
          notification_settings?: Json
          preferred_categories?: string[] | null
          preferred_complexity?:
            | Database["public"]["Enums"]["complexity_level"][]
            | null
          preferred_impact_scope?:
            | Database["public"]["Enums"]["impact_scope"][]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          achievements: Json
          created_at: string | null
          id: string
          last_activity: string | null
          module_type: string
          progress_data: Json
          total_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          achievements?: Json
          created_at?: string | null
          id?: string
          last_activity?: string | null
          module_type: string
          progress_data?: Json
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievements?: Json
          created_at?: string | null
          id?: string
          last_activity?: string | null
          module_type?: string
          progress_data?: Json
          total_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "edgesense_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_research_profiles: {
        Row: {
          created_at: string | null
          id: string
          interaction_history: Json | null
          personalization_data: Json | null
          practice_areas: string[] | null
          preferred_jurisdictions: string[] | null
          research_preferences: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_history?: Json | null
          personalization_data?: Json | null
          practice_areas?: string[] | null
          preferred_jurisdictions?: string[] | null
          research_preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_history?: Json | null
          personalization_data?: Json | null
          practice_areas?: string[] | null
          preferred_jurisdictions?: string[] | null
          research_preferences?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          proficiency_level: number
          skill_name: string
          updated_at: string
          user_id: string
          verified: boolean | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          proficiency_level?: number
          skill_name: string
          updated_at?: string
          user_id: string
          verified?: boolean | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          proficiency_level?: number
          skill_name?: string
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          years_experience?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          role?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      web_automation_agents: {
        Row: {
          automation_scripts: Json
          browser_config: Json
          created_at: string
          id: string
          last_run: string | null
          name: string
          status: string
          target_websites: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          automation_scripts?: Json
          browser_config?: Json
          created_at?: string
          id?: string
          last_run?: string | null
          name: string
          status?: string
          target_websites?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          automation_scripts?: Json
          browser_config?: Json
          created_at?: string
          id?: string
          last_run?: string | null
          name?: string
          status?: string
          target_websites?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          name: string
          preview_image: string | null
          template_data: Json
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          preview_image?: string | null
          template_data?: Json
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          preview_image?: string | null
          template_data?: Json
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      workflows: {
        Row: {
          created_at: string | null
          description: string | null
          executions: number | null
          id: string
          name: string
          status: string | null
          success_rate: number | null
          updated_at: string | null
          user_id: string
          workflow_data: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          executions?: number | null
          id?: string
          name: string
          status?: string | null
          success_rate?: number | null
          updated_at?: string | null
          user_id: string
          workflow_data?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          executions?: number | null
          id?: string
          name?: string
          status?: string | null
          success_rate?: number | null
          updated_at?: string | null
          user_id?: string
          workflow_data?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_explanations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_match_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      application_status: "applied" | "shortlisted" | "hired" | "rejected"
      budget_type: "hourly" | "fixed" | "unknown"
      commitment_level: "full_time" | "part_time" | "consultant" | "volunteer"
      competition_level: "low" | "medium" | "high"
      complexity_level: "beginner" | "intermediate" | "advanced" | "expert"
      data_freshness: "real-time" | "scraped" | "cached"
      explanation_method:
        | "shap"
        | "lime"
        | "feature_importance"
        | "decision_tree"
        | "permutation_importance"
      explanation_status: "pending" | "processing" | "completed" | "failed"
      impact_scope: "local" | "regional" | "national" | "global"
      interface_status: "draft" | "published" | "archived"
      job_status: "active" | "closed" | "expired"
      model_framework:
        | "tensorflow"
        | "pytorch"
        | "scikit_learn"
        | "xgboost"
        | "lightgbm"
        | "custom"
      phase_status: "not_started" | "in_progress" | "completed" | "blocked"
      problem_status: "draft" | "open" | "in_progress" | "solved" | "closed"
      solution_status: "draft" | "active" | "completed" | "abandoned"
      team_role: "lead" | "contributor" | "advisor" | "observer"
      urgency_level: "low" | "medium" | "high" | "critical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: ["applied", "shortlisted", "hired", "rejected"],
      budget_type: ["hourly", "fixed", "unknown"],
      commitment_level: ["full_time", "part_time", "consultant", "volunteer"],
      competition_level: ["low", "medium", "high"],
      complexity_level: ["beginner", "intermediate", "advanced", "expert"],
      data_freshness: ["real-time", "scraped", "cached"],
      explanation_method: [
        "shap",
        "lime",
        "feature_importance",
        "decision_tree",
        "permutation_importance",
      ],
      explanation_status: ["pending", "processing", "completed", "failed"],
      impact_scope: ["local", "regional", "national", "global"],
      interface_status: ["draft", "published", "archived"],
      job_status: ["active", "closed", "expired"],
      model_framework: [
        "tensorflow",
        "pytorch",
        "scikit_learn",
        "xgboost",
        "lightgbm",
        "custom",
      ],
      phase_status: ["not_started", "in_progress", "completed", "blocked"],
      problem_status: ["draft", "open", "in_progress", "solved", "closed"],
      solution_status: ["draft", "active", "completed", "abandoned"],
      team_role: ["lead", "contributor", "advisor", "observer"],
      urgency_level: ["low", "medium", "high", "critical"],
    },
  },
} as const

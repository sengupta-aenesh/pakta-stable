import { createClient } from "@/lib/supabase/server";
import { ChatOpenAI } from "@langchain/openai";

export class ContractAnalysisService {
  private model: ChatOpenAI;
  private supabase: any;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.2,
    });
    this.supabase = createClient();
  }

  async analyzeUserRequest(request: string) {
    const prompt = `
      Analyze this contract request and extract:
      1. Contract type (employment, nda, service, consulting, etc.)
      2. Key parameters mentioned (parties, dates, amounts, duration, etc.)
      3. Special requirements or conditions
      4. Jurisdiction if mentioned
      
      Request: "${request}"
      
      Return as JSON: {
        "contractType": "type or null",
        "mentionedParameters": {"key": "value"},
        "specialRequirements": [],
        "jurisdiction": "jurisdiction or null",
        "confidence": 0.0-1.0
      }
    `;

    const response = await this.model.invoke(prompt);
    return JSON.parse(response.content as string);
  }

  async searchRelevantTemplates(contractType: string, requirements: string[]) {
    // Search by contract type and tags
    const { data: templates } = await this.supabase
      .from("contract_templates")
      .select(`
        *,
        contract_sections(*)
      `)
      .or(`type.eq.${contractType},tags.cs.{${requirements.join(',')}}`)
      .order('created_at', { ascending: false });

    return templates || [];
  }

  async searchRelevantClauses(clauseTypes: string[], tags: string[]) {
    const { data: clauses } = await this.supabase
      .from("contract_clauses")
      .select("*")
      .or(`clause_type.in.(${clauseTypes.join(',')}),tags.ov.{${tags.join(',')}}`)
      .limit(20);

    return clauses || [];
  }

  async getRequiredParameters(contractType: string) {
    const { data: parameters } = await this.supabase
      .from("contract_parameters")
      .select("*")
      .eq("contract_type", contractType)
      .order("is_required", { ascending: false });

    return parameters || [];
  }

  async identifyMissingParameters(required: any[], collected: Record<string, any>) {
    return required
      .filter(param => param.is_required && !collected[param.parameter_key])
      .map(param => param.parameter_key);
  }
}
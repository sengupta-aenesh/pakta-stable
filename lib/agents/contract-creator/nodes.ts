import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ContractAnalysisService } from "@/lib/services/contract-analysis.service";
import { ContractCreatorState } from "./state";

const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.3,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const analysisService = new ContractAnalysisService();

export async function analyzeRequest(state: typeof ContractCreatorState.State) {
  try {
    console.log("analyzeRequest called with state:", JSON.stringify(state, null, 2));
    
    const userRequest = state.messages[state.messages.length - 1].content as string;
    console.log("User request:", userRequest);
    
    // Analyze the user's request
    const analysis = await analysisService.analyzeUserRequest(userRequest);
    console.log("Analysis result:", analysis);
  
  if (analysis.confidence < 0.7 || !analysis.contractType) {
    // Ask for clarification
    const clarificationPrompt = `
      The user wants to create a contract but I need more information.
      Request: "${userRequest}"
      
      Ask a clarifying question to understand:
      - What type of contract they need
      - The main purpose of the contract
      - Who the parties involved are
      
      Be conversational and helpful.
    `;
    
    const response = await model.invoke(clarificationPrompt);
    
    return {
      messages: [new AIMessage(response.content as string)],
      currentStep: "clarify_request",
    };
  }
  
  // Get required parameters for this contract type
  const requiredParams = await analysisService.getRequiredParameters(analysis.contractType);
  
    return {
      userRequest,
      detectedContractType: analysis.contractType,
      collectedParameters: analysis.mentionedParameters,
      requiredParameters: requiredParams,
      currentStep: "collect_parameters",
    };
  } catch (error) {
    console.error("Error in analyzeRequest:", error);
    
    // Fallback response for testing
    return {
      messages: [new AIMessage("I'm having trouble analyzing your request. Could you please tell me what type of contract you need? (e.g., employment contract, NDA, service agreement)")],
      currentStep: "clarify_request",
    };
  }
}

export async function collectParameters(state: typeof ContractCreatorState.State) {
  const { requiredParameters, collectedParameters } = state;
  
  // Find missing required parameters
  const missingParams = await analysisService.identifyMissingParameters(
    requiredParameters,
    collectedParameters
  );
  
  if (missingParams.length === 0) {
    return { currentStep: "search_templates" };
  }
  
  // Ask for the next missing parameter
  const nextParam = requiredParameters.find(
    p => missingParams.includes(p.parameter_key)
  );
  
  const questionPrompt = `
    You're helping create a ${state.detectedContractType} contract.
    You need to collect: ${nextParam.parameter_label}
    
    Context: ${nextParam.help_text || ''}
    Example: ${nextParam.example_value || ''}
    
    Ask for this information in a natural, conversational way.
    If it's a date, mention the preferred format.
    If it's a select field, provide the options: ${JSON.stringify(nextParam.options || [])}
  `;
  
  const response = await model.invoke(questionPrompt);
  
  return {
    messages: [new AIMessage(response.content as string)],
    currentStep: "awaiting_parameter",
    missingParameters: missingParams,
  };
}

export async function searchTemplates(state: typeof ContractCreatorState.State) {
  const { detectedContractType, collectedParameters } = state;
  
  // Search for relevant templates and clauses
  const [templates, clauses] = await Promise.all([
    analysisService.searchRelevantTemplates(
      detectedContractType!,
      Object.keys(collectedParameters)
    ),
    analysisService.searchRelevantClauses(
      [detectedContractType!],
      Object.keys(collectedParameters)
    ),
  ]);
  
  return {
    relevantTemplates: templates,
    relevantClauses: clauses,
    currentStep: "generate_contract",
  };
}

export async function generateContract(state: typeof ContractCreatorState.State) {
  const {
    detectedContractType,
    collectedParameters,
    relevantTemplates,
    relevantClauses,
    userRequest,
  } = state;
  
  // Prepare template and clause information for the AI
  const templateInfo = relevantTemplates.map(t => ({
    name: t.name,
    sections: t.contract_sections.map((s: any) => ({
      type: s.section_type,
      title: s.title,
      content: s.content,
    })),
  }));
  
  const clauseInfo = relevantClauses.map(c => ({
    type: c.clause_type,
    title: c.title,
    content: c.content,
  }));
  
  const generationPrompt = `
    Generate a professional ${detectedContractType} contract based on:
    
    USER REQUEST: ${userRequest}
    
    COLLECTED INFORMATION:
    ${JSON.stringify(collectedParameters, null, 2)}
    
    REFERENCE TEMPLATES:
    ${JSON.stringify(templateInfo, null, 2)}
    
    AVAILABLE CLAUSES:
    ${JSON.stringify(clauseInfo, null, 2)}
    
    Instructions:
    1. Create a complete, professional contract
    2. Use the reference templates as a guide for structure
    3. Include relevant clauses based on the contract type
    4. Mark all variable fields with [[FIELD:field_name:current_value]]
    5. Ensure all collected parameters are incorporated
    6. Add standard legal language appropriate for ${detectedContractType}
    7. Include sections for: parties, terms, payment (if applicable), confidentiality, termination, governing law
    
    Return the contract text with marked fields.
  `;
  
  const response = await model.invoke(generationPrompt);
  const contractText = response.content as string;
  
  // Extract editable fields
  const fieldRegex = /\[\[FIELD:(\w+):(.*?)\]\]/g;
  const editableFields = [];
  let match;
  
  while ((match = fieldRegex.exec(contractText)) !== null) {
    editableFields.push({
      fieldName: match[1],
      currentValue: match[2],
      displayName: match[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    });
  }
  
  // Clean contract for display (replace field markers with values)
  const displayContract = contractText.replace(fieldRegex, '$2');
  
  return {
    generatedContract: displayContract,
    editableFields,
    currentStep: "contract_complete",
    messages: [new AIMessage(
      "I've generated your contract with the key parameters highlighted. You can edit these fields before finalizing the document."
    )],
  };
}

export async function processUserInput(state: typeof ContractCreatorState.State) {
  const lastMessage = state.messages[state.messages.length - 1].content as string;
  const { currentStep, missingParameters } = state;
  
  if (currentStep === "clarify_request") {
    // Re-analyze with additional context
    return analyzeRequest(state);
  }
  
  if (currentStep === "awaiting_parameter") {
    // Extract and validate the parameter value
    const currentParam = state.requiredParameters.find(
      p => missingParameters.includes(p.parameter_key)
    );
    
    const extractionPrompt = `
      Extract and validate the parameter value from user input.
      Parameter: ${currentParam.parameter_key} (${currentParam.parameter_type})
      User input: "${lastMessage}"
      Validation rules: ${JSON.stringify(currentParam.validation_rules || {})}
      
      Return JSON: {"valid": boolean, "value": extracted_value, "error": "error if invalid"}
    `;
    
    const validation = await model.invoke(extractionPrompt);
    const result = JSON.parse(validation.content as string);
    
    if (result.valid) {
      return {
        collectedParameters: {
          ...state.collectedParameters,
          [currentParam.parameter_key]: result.value,
        },
        currentStep: "collect_parameters",
      };
    } else {
      return {
        messages: [new AIMessage(
          `I couldn't process that: ${result.error}. ${currentParam.help_text || 'Please try again.'}`
        )],
        currentStep: "awaiting_parameter",
      };
    }
  }
  
  return state;
}
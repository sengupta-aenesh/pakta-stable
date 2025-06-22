import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ContractCreatorState } from "./state";

// Create OpenAI model with fallback
let model;
try {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OpenAI API key not found, using fallback responses");
    model = null;
  } else {
    model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.3,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.error("Error creating OpenAI model:", error);
  model = null;
}

export async function simpleAnalyzeRequest(state: typeof ContractCreatorState.State) {
  try {
    console.log("Simple analyzeRequest called with state:", state);
    
    if (!state.messages || state.messages.length === 0) {
      console.log("No messages in state");
      return {
        messages: [new AIMessage("Hello! I can help you create a contract. What type of contract do you need?")],
        currentStep: "clarify_request",
      };
    }
    
    const userRequest = state.messages[state.messages.length - 1].content as string;
    console.log("User request:", userRequest);
    
    // Simple detection for common contract types
    const contractTypes = {
      'employment': ['employment', 'job', 'work', 'employee', 'salary', 'hire'],
      'nda': ['nda', 'confidentiality', 'non-disclosure', 'secret', 'confidential'],
      'service': ['service', 'consulting', 'contractor', 'freelance', 'project'],
      'rental': ['rental', 'lease', 'rent', 'property', 'apartment'],
      'sale': ['sale', 'purchase', 'buy', 'sell', 'goods']
    };
    
    let detectedType = null;
    for (const [type, keywords] of Object.entries(contractTypes)) {
      if (keywords.some(keyword => userRequest.toLowerCase().includes(keyword))) {
        detectedType = type;
        break;
      }
    }
    
    if (!detectedType) {
      console.log("No contract type detected, asking for clarification");
      return {
        messages: [new AIMessage("I can help you create a contract! What type of contract do you need? I can help with employment contracts, NDAs, service agreements, rental agreements, or sales contracts.")],
        currentStep: "clarify_request",
      };
    }
    
    console.log("Detected contract type:", detectedType);
    
    // Mock required parameters for testing
    const mockRequiredParams = [
      {
        parameter_key: "party1_name",
        parameter_label: "First Party Name",
        parameter_type: "text",
        is_required: true,
        help_text: "Name of the first party to the contract"
      },
      {
        parameter_key: "party2_name", 
        parameter_label: "Second Party Name",
        parameter_type: "text",
        is_required: true,
        help_text: "Name of the second party to the contract"
      }
    ];
    
    const result = {
      userRequest,
      detectedContractType: detectedType,
      collectedParameters: {},
      requiredParameters: mockRequiredParams,
      currentStep: "collect_parameters",
    };
    
    console.log("Returning result from analyzeRequest:", result);
    return result;
    
  } catch (error) {
    console.error("Error in simpleAnalyzeRequest:", error);
    
    return {
      messages: [new AIMessage("I'm having trouble analyzing your request. Could you please tell me what type of contract you need?")],
      currentStep: "clarify_request",
    };
  }
}

export async function simpleCollectParameters(state: typeof ContractCreatorState.State) {
  try {
    console.log("Simple collectParameters called");
    
    const { requiredParameters, collectedParameters } = state;
    
    // Find missing required parameters
    const missingParams = requiredParameters.filter(
      p => p.is_required && !collectedParameters[p.parameter_key]
    );
    
    if (missingParams.length === 0) {
      return { currentStep: "generate_contract" };
    }
    
    // Ask for the next missing parameter
    const nextParam = missingParams[0];
    
    const message = `Great! I'm creating a ${state.detectedContractType} contract for you. I need some information: What is the ${nextParam.parameter_label.toLowerCase()}?`;
    
    return {
      messages: [new AIMessage(message)],
      currentStep: "awaiting_parameter",
      missingParameters: missingParams.map(p => p.parameter_key),
    };
  } catch (error) {
    console.error("Error in simpleCollectParameters:", error);
    
    return {
      messages: [new AIMessage("I'm having trouble collecting the contract details. Let's try a simpler approach - could you tell me the names of both parties for this contract?")],
      currentStep: "awaiting_parameter",
    };
  }
}

export async function simpleGenerateContract(state: typeof ContractCreatorState.State) {
  try {
    console.log("Simple generateContract called");
    
    const {
      detectedContractType,
      collectedParameters,
      userRequest,
    } = state;
    
    const simpleContract = `
${detectedContractType.toUpperCase()} AGREEMENT

This ${detectedContractType} agreement is made between:

Party 1: ${collectedParameters.party1_name || '[PARTY 1 NAME]'}
Party 2: ${collectedParameters.party2_name || '[PARTY 2 NAME]'}

Based on your request: "${userRequest}"

Terms and Conditions:
1. Both parties agree to the terms set forth in this agreement.
2. This agreement shall be governed by applicable law.
3. Any disputes shall be resolved through appropriate legal channels.

Date: ${new Date().toLocaleDateString()}

Signatures:
Party 1: _____________________
Party 2: _____________________
    `.trim();
    
    return {
      generatedContract: simpleContract,
      editableFields: [
        {
          fieldName: "party1_name",
          currentValue: collectedParameters.party1_name || '[PARTY 1 NAME]',
          displayName: "Party 1 Name"
        },
        {
          fieldName: "party2_name", 
          currentValue: collectedParameters.party2_name || '[PARTY 2 NAME]',
          displayName: "Party 2 Name"
        }
      ],
      currentStep: "contract_complete",
      messages: [new AIMessage("I've generated your contract! You can review it and edit any fields as needed.")],
    };
  } catch (error) {
    console.error("Error in simpleGenerateContract:", error);
    
    return {
      messages: [new AIMessage("I encountered an error generating your contract. Please try again.")],
      currentStep: "clarify_request",
    };
  }
}

export async function simpleProcessUserInput(state: typeof ContractCreatorState.State) {
  try {
    console.log("Simple processUserInput called");
    
    const lastMessage = state.messages[state.messages.length - 1].content as string;
    const { currentStep, missingParameters } = state;
    
    if (currentStep === "clarify_request") {
      return simpleAnalyzeRequest(state);
    }
    
    if (currentStep === "awaiting_parameter" && missingParameters && missingParameters.length > 0) {
      const currentParamKey = missingParameters[0];
      
      return {
        collectedParameters: {
          ...state.collectedParameters,
          [currentParamKey]: lastMessage,
        },
        currentStep: "collect_parameters",
      };
    }
    
    return state;
  } catch (error) {
    console.error("Error in simpleProcessUserInput:", error);
    return state;
  }
}
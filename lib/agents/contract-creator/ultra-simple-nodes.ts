import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ContractCreatorState } from "./state";

export async function ultraSimpleAnalyzeRequest(state: typeof ContractCreatorState.State) {
  try {
    console.log("Ultra simple analyzeRequest called");
    
    if (!state.messages || state.messages.length === 0) {
      return {
        messages: [new AIMessage("Hello! I can help you create a contract. What type of contract do you need?")],
        currentStep: "clarify_request",
      };
    }
    
    const userRequest = state.messages[state.messages.length - 1].content as string;
    console.log("User request:", userRequest);
    
    // Simple keyword detection
    let detectedType = "general";
    if (userRequest.toLowerCase().includes("employment") || userRequest.toLowerCase().includes("job")) {
      detectedType = "employment";
    } else if (userRequest.toLowerCase().includes("nda") || userRequest.toLowerCase().includes("confidential")) {
      detectedType = "nda";
    }
    
    console.log("Detected type:", detectedType);
    
    const mockParams = [
      {
        parameter_key: "party1_name",
        parameter_label: "First Party Name",
        parameter_type: "text",
        is_required: true,
        help_text: "Name of the first party"
      },
      {
        parameter_key: "party2_name", 
        parameter_label: "Second Party Name",
        parameter_type: "text",
        is_required: true,
        help_text: "Name of the second party"
      }
    ];
    
    return {
      userRequest,
      detectedContractType: detectedType,
      collectedParameters: {},
      requiredParameters: mockParams,
      currentStep: "collect_parameters",
    };
    
  } catch (error) {
    console.error("Error in ultraSimpleAnalyzeRequest:", error);
    return {
      messages: [new AIMessage("I'm having trouble. Could you tell me what type of contract you need?")],
      currentStep: "clarify_request",
    };
  }
}

export async function ultraSimpleCollectParameters(state: typeof ContractCreatorState.State) {
  try {
    console.log("Ultra simple collectParameters called");
    
    const { requiredParameters, collectedParameters } = state;
    
    const missingParams = requiredParameters.filter(
      p => p.is_required && !collectedParameters[p.parameter_key]
    );
    
    if (missingParams.length === 0) {
      return { currentStep: "generate_contract" };
    }
    
    const nextParam = missingParams[0];
    const message = `Great! I'm creating a ${state.detectedContractType} contract. What is the ${nextParam.parameter_label.toLowerCase()}?`;
    
    return {
      messages: [new AIMessage(message)],
      currentStep: "awaiting_parameter",
      missingParameters: missingParams.map(p => p.parameter_key),
    };
    
  } catch (error) {
    console.error("Error in ultraSimpleCollectParameters:", error);
    return {
      messages: [new AIMessage("Let's simplify - could you tell me the names of both parties for this contract?")],
      currentStep: "awaiting_parameter",
    };
  }
}

export async function ultraSimpleGenerateContract(state: typeof ContractCreatorState.State) {
  try {
    console.log("Ultra simple generateContract called");
    
    const {
      detectedContractType,
      collectedParameters,
      userRequest,
    } = state;
    
    const simpleContract = `
${(detectedContractType || 'CONTRACT').toUpperCase()} AGREEMENT

This ${detectedContractType || 'contract'} agreement is made between:

Party 1: ${collectedParameters.party1_name || '[PARTY 1 NAME]'}
Party 2: ${collectedParameters.party2_name || '[PARTY 2 NAME]'}

Based on your request: "${userRequest}"

Terms and Conditions:
1. Both parties agree to the terms set forth in this agreement.
2. This agreement shall be governed by applicable law.
3. Any disputes shall be resolved through appropriate legal channels.

Date: ${new Date().toLocaleDateString()}

Signatures:
_____________________     _____________________
Party 1                   Party 2
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
      messages: [new AIMessage("I've generated your contract! You can review and edit it as needed.")],
    };
    
  } catch (error) {
    console.error("Error in ultraSimpleGenerateContract:", error);
    return {
      messages: [new AIMessage("I had trouble generating the contract. Please try again.")],
      currentStep: "clarify_request",
    };
  }
}

export async function ultraSimpleProcessUserInput(state: typeof ContractCreatorState.State) {
  try {
    console.log("Ultra simple processUserInput called");
    
    const lastMessage = state.messages[state.messages.length - 1].content as string;
    const { currentStep, missingParameters } = state;
    
    if (currentStep === "clarify_request") {
      return ultraSimpleAnalyzeRequest(state);
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
    console.error("Error in ultraSimpleProcessUserInput:", error);
    return state;
  }
}
import { StateGraph, END } from "@langchain/langgraph";
import { ContractCreatorState } from "./state";
import * as simpleNodes from "./simple-nodes";

export function createSimpleContractCreatorGraph() {
  try {
    console.log("Building simple LangGraph workflow...");
    
    const workflow = new StateGraph(ContractCreatorState)
      .addNode("analyze_request", simpleNodes.simpleAnalyzeRequest)
      .addNode("collect_parameters", simpleNodes.simpleCollectParameters)
      .addNode("generate_contract", simpleNodes.simpleGenerateContract)
      .addNode("process_input", simpleNodes.simpleProcessUserInput);

    console.log("Added nodes to simple workflow");

    // Define the flow
    workflow.addEdge("analyze_request", "collect_parameters");
    workflow.addEdge("generate_contract", END);
    
    console.log("Added basic edges");
    
    // Conditional edges
    workflow.addConditionalEdges("collect_parameters", (state) => {
      const missingParams = state.requiredParameters
        .filter(p => p.is_required && !state.collectedParameters[p.parameter_key]);
      
      if (missingParams.length === 0) {
        return "generate_contract";
      }
      return "collect_parameters";
    });
    
    workflow.addConditionalEdges("process_input", (state) => {
      switch (state.currentStep) {
        case "clarify_request":
          return "analyze_request";
        case "awaiting_parameter":
          return "collect_parameters";
        default:
          return END;
      }
    });

    console.log("Added conditional edges");

    // Set entry point
    workflow.setEntryPoint("analyze_request");
    
    console.log("Set entry point, compiling simple graph...");

    return workflow.compile();
  } catch (error) {
    console.error("Error creating simple contract creator graph:", error);
    throw error;
  }
}
import { StateGraph, END } from "@langchain/langgraph";
import { ContractCreatorState } from "./state";
import * as nodes from "./nodes";

export function createContractCreatorGraph() {
  try {
    console.log("Building LangGraph workflow...");
    
    const workflow = new StateGraph(ContractCreatorState)
      .addNode("analyze_request", nodes.analyzeRequest)
      .addNode("collect_parameters", nodes.collectParameters)
      .addNode("search_templates", nodes.searchTemplates)
      .addNode("generate_contract", nodes.generateContract)
      .addNode("process_input", nodes.processUserInput);

    console.log("Added nodes to workflow");

    // Define the flow
    workflow.addEdge("analyze_request", "collect_parameters");
    workflow.addEdge("search_templates", "generate_contract");
    workflow.addEdge("generate_contract", END);
    
    console.log("Added basic edges");
    
    // Conditional edges
    workflow.addConditionalEdges("collect_parameters", (state) => {
      const missingParams = state.requiredParameters
        .filter(p => p.is_required && !state.collectedParameters[p.parameter_key]);
      
      if (missingParams.length === 0) {
        return "search_templates";
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
    
    console.log("Set entry point, compiling graph...");

    return workflow.compile();
  } catch (error) {
    console.error("Error creating contract creator graph:", error);
    throw error;
  }
}
import { StateGraph, END } from "@langchain/langgraph";
import { ContractCreatorState } from "./state";
import * as ultraSimpleNodes from "./ultra-simple-nodes";

export function createUltraSimpleContractCreatorGraph() {
  try {
    console.log("Building ultra simple LangGraph workflow...");
    
    const workflow = new StateGraph(ContractCreatorState)
      .addNode("analyze_request", ultraSimpleNodes.ultraSimpleAnalyzeRequest)
      .addNode("collect_parameters", ultraSimpleNodes.ultraSimpleCollectParameters)
      .addNode("generate_contract", ultraSimpleNodes.ultraSimpleGenerateContract)
      .addNode("process_input", ultraSimpleNodes.ultraSimpleProcessUserInput);

    console.log("Added nodes to ultra simple workflow");

    // Define the flow
    workflow.addEdge("analyze_request", "collect_parameters");
    workflow.addEdge("generate_contract", END);
    
    console.log("Added basic edges");
    
    // Conditional edges
    workflow.addConditionalEdges("collect_parameters", (state) => {
      console.log("Conditional edge - collect_parameters:", {
        step: state.currentStep,
        missingParams: state.requiredParameters?.filter((p: any) => p.is_required && !state.collectedParameters[p.parameter_key]),
        collectedParams: state.collectedParameters
      });
      
      if (state.currentStep === "awaiting_parameter") {
        return "process_input";
      }
      
      const missingParams = state.requiredParameters
        .filter((p: any) => p.is_required && !state.collectedParameters[p.parameter_key]);
      
      if (missingParams.length === 0) {
        return "generate_contract";
      }
      
      // This should not loop back to collect_parameters, instead go to awaiting input
      return "process_input";
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
    
    console.log("Set entry point, compiling ultra simple graph...");

    return workflow.compile();
  } catch (error) {
    console.error("Error creating ultra simple contract creator graph:", error);
    throw error;
  }
}
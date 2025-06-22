import { StateGraph, END } from "@langchain/langgraph";
import { ExpertContractCreatorState } from "./state";
import * as sophisticatedNodes from "./sophisticated-nodes";

export function createExpertContractCreatorGraph() {
  try {
    console.log("🏗️ Building Sophisticated Multi-Agent Legal Contract Creator...");
    
    const workflow = new StateGraph(ExpertContractCreatorState)
      .addNode("legal_intake", sophisticatedNodes.legalIntakeAgent)
      .addNode("collect_information", sophisticatedNodes.informationCollectionAgent)
      .addNode("jurisdiction_analysis", sophisticatedNodes.jurisdictionIntelligenceAgent)
      .addNode("template_discovery", sophisticatedNodes.templateResearchAgent)
      .addNode("contract_architecture", sophisticatedNodes.contractArchitectureAgent)
      .addNode("contract_drafting", sophisticatedNodes.draftingSpecialistAgent)
      .addNode("draft_section", sophisticatedNodes.draftingSpecialistAgent)
      .addNode("legal_review", sophisticatedNodes.legalReviewAgent);

    console.log("✅ Added all sophisticated legal agents to workflow");

    // Define the sophisticated multi-agent workflow with static edges
    workflow.addEdge("jurisdiction_analysis", "template_discovery");
    workflow.addEdge("template_discovery", "contract_architecture");
    workflow.addEdge("contract_architecture", "contract_drafting");
    workflow.addEdge("legal_review", END);
    
    console.log("✅ Added sophisticated agent workflow edges");
    
    // Conditional edges for sophisticated routing
    workflow.addConditionalEdges("legal_intake", (state) => {
      console.log("🔄 Routing from Legal Intake Agent:", {
        currentStep: state.currentStep,
        workflowStatus: state.workflowStatus
      });
      
      // If we need to collect information, route to information collection
      if (state.currentStep === "collect_information") {
        return "collect_information";
      }
      // If ready to proceed, go to jurisdiction analysis
      if (state.currentStep === "jurisdiction_analysis") {
        return "jurisdiction_analysis";
      }
      // If we need clarification, END and wait for user input
      if (state.currentStep === "clarify_requirements") {
        return END;
      }
      // Default to jurisdiction analysis
      return "jurisdiction_analysis";
    });

    // Information collection routing
    workflow.addConditionalEdges("collect_information", (state) => {
      console.log("🔄 Routing from Information Collection Agent:", {
        currentStep: state.currentStep,
        workflowStatus: state.workflowStatus
      });
      
      // If still collecting information, stay in collection loop
      if (state.currentStep === "collect_information") {
        return "collect_information";
      }
      // If collection complete, proceed to jurisdiction analysis
      if (state.currentStep === "jurisdiction_analysis") {
        return "jurisdiction_analysis";
      }
      // Default to jurisdiction analysis
      return "jurisdiction_analysis";
    });

    // Contract drafting routing for section-by-section generation
    workflow.addConditionalEdges("contract_drafting", (state) => {
      console.log("🔄 Routing from Contract Drafting Agent:", {
        currentStep: state.currentStep,
        workflowStatus: state.workflowStatus,
        currentSection: state.currentSection,
        totalSections: state.totalSections
      });
      
      // If starting section-by-section drafting, route to draft_section
      if (state.currentStep === "draft_section") {
        return "draft_section";
      }
      // If drafting complete, go to legal review
      if (state.currentStep === "legal_review") {
        return "legal_review";
      }
      // Default to legal review
      return "legal_review";
    });

    // Section drafting routing for iterative section generation
    workflow.addConditionalEdges("draft_section", (state) => {
      console.log("🔄 Routing from Section Drafting:", {
        currentStep: state.currentStep,
        currentSection: state.currentSection,
        totalSections: state.totalSections,
        workflowStatus: state.workflowStatus
      });
      
      // If still drafting sections, continue section loop
      if (state.currentStep === "draft_section") {
        return "draft_section";
      }
      // If all sections complete, proceed to legal review
      if (state.currentStep === "legal_review") {
        return "legal_review";
      }
      // Default to legal review
      return "legal_review";
    });

    console.log("✅ Added sophisticated conditional routing logic");

    // Set entry point to our Legal Intake Agent
    workflow.setEntryPoint("legal_intake");
    
    console.log("✅ Set entry point, compiling expert graph...");

    return workflow.compile({
      recursionLimit: 100 // Increase limit appropriately 
    });
  } catch (error) {
    console.error("❌ Error creating expert contract creator graph:", error);
    throw error;
  }
}
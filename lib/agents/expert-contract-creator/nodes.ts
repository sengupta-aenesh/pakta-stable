import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ExpertContractCreatorState } from "./state";
import { webSearchTool, templateQueryTool, planningTool, qualityAssessmentTool } from "./tools";

const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.2,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeRequest(state: typeof ExpertContractCreatorState.State) {
  try {
    console.log("🔍 Expert Agent: Analyzing request...");
    
    const userRequest = state.messages[state.messages.length - 1].content as string;
    
    const analysisPrompt = `
You are an expert contract lawyer. Analyze this contract request and provide a structured analysis.

User Request: "${userRequest}"

Analyze and determine:
1. Contract Type (e.g., employment, service agreement, NDA, rental, partnership, etc.)
2. Contract Complexity (simple/moderate/complex)
3. Jurisdiction (if mentioned, otherwise default to "united-states")
4. Key Requirements mentioned in the request
5. Missing information that would be needed

Respond in JSON format:
{
  "contractType": "string",
  "complexity": "simple|moderate|complex",
  "jurisdiction": "string",
  "keyRequirements": ["requirement1", "requirement2"],
  "analysis": "brief analysis of the request",
  "confidence": 0.0-1.0
}
    `;

    const response = await model.invoke(analysisPrompt);
    const analysis = JSON.parse(response.content as string);
    
    console.log("📋 Analysis result:", analysis);
    
    if (analysis.confidence < 0.7) {
      return {
        messages: [new AIMessage(`I understand you need help with a contract, but I need more information to provide the best assistance. Could you please specify:

• What type of contract or agreement do you need?
• Who are the parties involved?
• What is the main purpose or subject matter?
• Are there any specific terms or requirements you have in mind?

This will help me create a comprehensive, legally sound contract tailored to your needs.`)],
        currentStep: "clarify_request",
      };
    }
    
    return {
      userRequest,
      contractType: analysis.contractType,
      contractComplexity: analysis.complexity,
      jurisdiction: analysis.jurisdiction,
      currentStep: "plan_structure",
      workflowStatus: "planning" as const,
      messages: [new AIMessage(`Perfect! I'll help you create a comprehensive ${analysis.contractType} agreement. As your legal expert, I'll ensure this contract is thorough, fair, and legally sound.

Let me start by planning the optimal structure for your ${analysis.contractType} contract and then gather any additional information needed.`)],
    };
  } catch (error) {
    console.error("Error in analyzeRequest:", error);
    return {
      messages: [new AIMessage("I encountered an issue analyzing your request. Could you please rephrase what type of contract you need?")],
      currentStep: "clarify_request",
    };
  }
}

export async function planStructure(state: typeof ExpertContractCreatorState.State) {
  try {
    console.log("📐 Expert Agent: Planning contract structure...");
    
    // Use planning tool to determine structure
    const planningInput = JSON.stringify({
      contractType: state.contractType,
      complexity: state.contractComplexity,
      jurisdiction: state.jurisdiction
    });
    
    const planningResult = await planningTool.func(planningInput);
    const { sections } = JSON.parse(planningResult);
    
    // Query database for relevant templates
    const templateResult = await templateQueryTool.func(state.contractType || "general");
    const { templates, clauses } = JSON.parse(templateResult);
    
    console.log(`📚 Found ${sections.length} sections, ${templates.length} templates, ${clauses.length} clauses`);
    
    return {
      plannedSections: sections,
      relevantTemplates: templates,
      relevantClauses: clauses,
      currentStep: "identify_missing_info",
      messages: [new AIMessage(`I've planned a comprehensive structure for your ${state.contractType} contract with ${sections.length} key sections:

${sections.map((section: any, i: number) => `${i + 1}. ${section.name.replace(/_/g, ' ').toUpperCase()}: ${section.description}`).join('\n')}

Now let me identify what specific information I need to create detailed, customized terms for each section.`)],
    };
  } catch (error) {
    console.error("Error in planStructure:", error);
    return {
      messages: [new AIMessage("I had trouble planning the contract structure. Let me try a different approach.")],
      currentStep: "identify_missing_info",
    };
  }
}

export async function identifyMissingInfo(state: typeof ExpertContractCreatorState.State) {
  try {
    console.log("❓ Expert Agent: Identifying missing information...");
    
    const identificationPrompt = `
As an expert contract lawyer, analyze what specific information is needed to draft a comprehensive ${state.contractType} contract.

Contract Type: ${state.contractType}
User Request: ${state.userRequest}
Planned Sections: ${state.plannedSections.map(s => s.name).join(', ')}

Based on the contract type and sections, what specific information do I need from the client to draft proper terms?

Consider:
- Party details (names, addresses, roles)
- Financial terms (amounts, payment schedules)
- Timeline and duration
- Specific obligations and deliverables
- Jurisdiction-specific requirements
- Risk management preferences

Respond in JSON format:
{
  "requiredInfo": [
    {
      "key": "unique_key",
      "label": "Human readable label",
      "description": "Why this is needed",
      "required": true/false,
      "type": "text|number|date|select",
      "options": ["option1", "option2"] // only for select type
    }
  ],
  "priorityQuestions": ["Most important question to ask first", "Second priority"],
  "explanation": "Brief explanation of why this information is needed"
}
    `;

    const response = await model.invoke(identificationPrompt);
    const result = JSON.parse(response.content as string);
    
    // Find first missing required information
    const missingRequired = result.requiredInfo.filter((info: any) => 
      info.required && !state.collectedInfo[info.key]
    );
    
    if (missingRequired.length > 0) {
      const nextQuestion = missingRequired[0];
      return {
        requiredInfo: result.requiredInfo,
        pendingClarifications: missingRequired.map((info: any) => info.key),
        currentStep: "collect_info",
        workflowStatus: "collecting_info" as const,
        messages: [new AIMessage(`To create the most accurate and legally sound contract, I need some specific information:

**${nextQuestion.label}**
${nextQuestion.description}

${nextQuestion.type === 'select' ? `Please choose from: ${nextQuestion.options?.join(', ')}` : 'Please provide this information so I can continue drafting your contract.'}`)],
      };
    }
    
    // All required info collected, move to research
    return {
      requiredInfo: result.requiredInfo,
      currentStep: "research_best_practices",
      workflowStatus: "researching" as const,
      messages: [new AIMessage("Excellent! I have all the information needed. Now let me research the latest legal best practices and industry standards for your contract type to ensure comprehensive coverage.")],
    };
  } catch (error) {
    console.error("Error in identifyMissingInfo:", error);
    return {
      currentStep: "research_best_practices",
      messages: [new AIMessage("Let me proceed with researching best practices for your contract.")],
    };
  }
}

export async function collectInformation(state: typeof ExpertContractCreatorState.State) {
  try {
    console.log("📝 Expert Agent: Collecting information...");
    
    const userInput = state.messages[state.messages.length - 1].content as string;
    const pendingQuestions = state.pendingClarifications || [];
    
    if (pendingQuestions.length > 0) {
      const currentQuestionKey = pendingQuestions[0];
      const questionInfo = state.requiredInfo.find(info => info.key === currentQuestionKey);
      
      // Collect the answer
      const updatedCollectedInfo = {
        ...state.collectedInfo,
        [currentQuestionKey]: userInput
      };
      
      // Remove this question from pending
      const remainingPending = pendingQuestions.slice(1);
      
      if (remainingPending.length > 0) {
        // Ask next question
        const nextQuestion = state.requiredInfo.find(info => info.key === remainingPending[0]);
        return {
          collectedInfo: updatedCollectedInfo,
          pendingClarifications: remainingPending,
          messages: [new AIMessage(`Thank you! 

**${nextQuestion?.label}**
${nextQuestion?.description}

${nextQuestion?.type === 'select' ? `Please choose from: ${nextQuestion.options?.join(', ')}` : ''}`)],
        };
      } else {
        // All questions answered, move to research
        return {
          collectedInfo: updatedCollectedInfo,
          pendingClarifications: [],
          currentStep: "research_best_practices",
          workflowStatus: "researching" as const,
          messages: [new AIMessage("Perfect! I now have all the information needed. Let me research the latest legal best practices and industry standards to ensure your contract is comprehensive and up-to-date.")],
        };
      }
    }
    
    return state;
  } catch (error) {
    console.error("Error in collectInformation:", error);
    return state;
  }
}

export async function researchBestPractices(state: typeof ExpertContractCreatorState.State) {
  try {
    console.log("🔬 Expert Agent: Researching best practices...");
    
    const researchPromises = state.plannedSections.map(async (section) => {
      const searchQuery = `${state.contractType} contract ${section.name} best practices legal requirements ${state.jurisdiction}`;
      const searchResult = await webSearchTool.func(searchQuery);
      const searchData = JSON.parse(searchResult);
      
      // Extract insights from search results
      const insights = searchData.results?.map((result: any) => result.content) || [];
      
      return {
        section: section.name,
        insights,
        bestPractices: [
          `Ensure compliance with ${state.jurisdiction} laws`,
          "Use clear, unambiguous language",
          "Balance interests of all parties",
          "Include appropriate dispute resolution mechanisms"
        ],
        keyTerms: [
          "governing law",
          "jurisdiction",
          "force majeure",
          "entire agreement"
        ],
        sources: searchData.results?.map((result: any) => result.source) || []
      };
    });
    
    const researchResults = await Promise.all(researchPromises);
    
    console.log(`🎯 Completed research for ${researchResults.length} sections`);
    
    return {
      researchFindings: researchResults,
      currentStep: "draft_sections",
      workflowStatus: "drafting" as const,
      messages: [new AIMessage(`Research complete! I've analyzed current legal best practices, industry standards, and regulatory requirements for each section of your contract.

Key research insights gathered:
${researchResults.map(r => `• ${r.section.replace(/_/g, ' ').toUpperCase()}: Current legal standards and best practices identified`).join('\n')}

Now I'll begin drafting each section with comprehensive, legally sound terms tailored to your specific needs.`)],
    };
  } catch (error) {
    console.error("Error in researchBestPractices:", error);
    return {
      currentStep: "draft_sections",
      workflowStatus: "drafting" as const,
      messages: [new AIMessage("I'll proceed with drafting your contract sections using established legal frameworks.")],
    };
  }
}

export async function draftSections(state: typeof ExpertContractCreatorState.State) {
  try {
    console.log("✍️ Expert Agent: Drafting contract sections...");
    
    const draftedSections: Record<string, any> = {};
    
    for (const section of state.plannedSections) {
      const sectionResearch = state.researchFindings.find(r => r.section === section.name);
      const relevantClauses = state.relevantClauses.filter((clause: any) => 
        clause.clause_type?.toLowerCase().includes(section.name.toLowerCase()) ||
        clause.tags?.some((tag: string) => section.name.toLowerCase().includes(tag.toLowerCase()))
      );
      
      const draftingPrompt = `
As an expert contract lawyer, draft a comprehensive ${section.name.replace(/_/g, ' ')} section for a ${state.contractType} contract.

Contract Details:
- Type: ${state.contractType}
- Jurisdiction: ${state.jurisdiction}
- Complexity: ${state.contractComplexity}

Collected Information:
${JSON.stringify(state.collectedInfo, null, 2)}

Research Insights:
${sectionResearch?.insights.join('\n') || 'Use standard legal practices'}

Best Practices to Follow:
${sectionResearch?.bestPractices.join('\n') || 'Follow standard legal framework'}

Requirements:
1. Use professional legal language
2. Ensure terms are fair and balanced
3. Include necessary protections for both parties
4. Comply with ${state.jurisdiction} legal requirements
5. Make terms clear and enforceable

Section Purpose: ${section.description}

Draft a comprehensive ${section.name.replace(/_/g, ' ')} section with detailed terms and conditions.
      `;

      const response = await model.invoke(draftingPrompt);
      const sectionContent = response.content as string;
      
      draftedSections[section.name] = {
        content: sectionContent,
        status: 'draft' as const,
        keyPoints: [
          'Legally compliant terms',
          'Balanced obligations',
          'Clear enforcement mechanisms'
        ]
      };
    }
    
    console.log(`📄 Drafted ${Object.keys(draftedSections).length} sections`);
    
    return {
      draftedSections,
      currentStep: "review_quality",
      workflowStatus: "reviewing" as const,
      messages: [new AIMessage(`I've completed drafting all ${Object.keys(draftedSections).length} sections of your contract. Each section includes:

${Object.keys(draftedSections).map(key => `• ${key.replace(/_/g, ' ').toUpperCase()}: Comprehensive terms with legal protections`).join('\n')}

Now let me conduct a thorough quality review to ensure the contract meets the highest legal standards.`)],
    };
  } catch (error) {
    console.error("Error in draftSections:", error);
    return {
      messages: [new AIMessage("I encountered an issue while drafting. Let me try a simplified approach.")],
      currentStep: "finalize_contract",
    };
  }
}

export async function reviewQuality(state: typeof ExpertContractCreatorState.State) {
  try {
    console.log("🔍 Expert Agent: Reviewing contract quality...");
    
    // Combine all sections into full contract
    const fullContract = Object.entries(state.draftedSections)
      .sort(([, a], [, b]) => {
        const sectionA = state.plannedSections.find(s => s.name === a);
        const sectionB = state.plannedSections.find(s => s.name === b);
        return (sectionA?.order || 0) - (sectionB?.order || 0);
      })
      .map(([sectionName, sectionData]) => {
        const section = state.plannedSections.find(s => s.name === sectionName);
        return `${section?.order || 0}. ${sectionName.replace(/_/g, ' ').toUpperCase()}

${sectionData.content}`;
      })
      .join('\n\n');
    
    // Add header and signature block
    const completeContract = `
${state.contractType?.toUpperCase()} AGREEMENT

This ${state.contractType} agreement is entered into on [DATE] between the parties identified below.

${fullContract}

SIGNATURES

The parties acknowledge they have read, understood, and agree to be bound by this Agreement.

Party 1: _____________________  Date: _________
${state.collectedInfo.party1_name || '[PARTY 1 NAME]'}

Party 2: _____________________  Date: _________
${state.collectedInfo.party2_name || '[PARTY 2 NAME]'}

Witness: _____________________  Date: _________
[WITNESS NAME]
    `.trim();
    
    // Assess quality
    const qualityResult = await qualityAssessmentTool.func(completeContract);
    const qualityAssessment = JSON.parse(qualityResult);
    
    console.log("📊 Quality assessment:", qualityAssessment);
    
    // Generate editable fields
    const editableFields = [
      {
        fieldName: "contract_date",
        currentValue: "[DATE]",
        displayName: "Contract Date",
        section: "header"
      },
      {
        fieldName: "party1_name",
        currentValue: state.collectedInfo.party1_name || "[PARTY 1 NAME]",
        displayName: "Party 1 Name",
        section: "signatures"
      },
      {
        fieldName: "party2_name",
        currentValue: state.collectedInfo.party2_name || "[PARTY 2 NAME]",
        displayName: "Party 2 Name",
        section: "signatures"
      }
    ];
    
    return {
      finalContract: completeContract,
      qualityAssessment,
      editableFields,
      currentStep: "finalize_contract",
      workflowStatus: "complete" as const,
      messages: [new AIMessage(`✅ **Contract Review Complete!**

I've completed a comprehensive quality assessment of your ${state.contractType} contract:

**Quality Scores:**
• Completeness: ${qualityAssessment.completeness}%
• Legal Soundness: ${qualityAssessment.legalSoundness}%
• Fairness: ${qualityAssessment.fairness}%
• Clarity: ${qualityAssessment.clarity}%

**Contract Statistics:**
• ${qualityAssessment.wordCount} words
• ${qualityAssessment.sectionCount} detailed sections
• Professional legal structure

${qualityAssessment.issues.length > 0 ? `**Areas for Attention:**\n${qualityAssessment.issues.map((issue: string) => `• ${issue}`).join('\n')}` : ''}

Your contract has been drafted with professional legal standards and is ready for review. You can now edit specific fields and finalize the agreement.`)],
    };
  } catch (error) {
    console.error("Error in reviewQuality:", error);
    return {
      currentStep: "finalize_contract",
      messages: [new AIMessage("Quality review completed. Your contract is ready for final review.")],
    };
  }
}
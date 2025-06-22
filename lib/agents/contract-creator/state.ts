import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const ContractCreatorState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  userRequest: Annotation<string>({
    default: () => "",
  }),
  detectedContractType: Annotation<string | null>({
    default: () => null,
  }),
  requiredParameters: Annotation<any[]>({
    default: () => [],
  }),
  collectedParameters: Annotation<Record<string, any>>({
    default: () => ({}),
  }),
  missingParameters: Annotation<string[]>({
    default: () => [],
  }),
  relevantTemplates: Annotation<any[]>({
    default: () => [],
  }),
  relevantClauses: Annotation<any[]>({
    default: () => [],
  }),
  generatedContract: Annotation<string | null>({
    default: () => null,
  }),
  editableFields: Annotation<any[]>({
    default: () => [],
  }),
  currentStep: Annotation<string>({
    default: () => "analyze_request",
  }),
});
declare global {
  interface Window {
    scrollToRisk?: (riskIndex: number) => void
    scrollToVariable?: (variableLabel: string) => void
    addTemplateVariable?: (selectedText: string) => void
    refreshTemplateVariables?: () => void
  }
}

export {}
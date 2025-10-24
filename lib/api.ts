// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
export const API_ENDPOINTS = {
  presentations: `${API_BASE_URL}/api/presentations`,
  presentationAnalysis: (id: string) => `${API_BASE_URL}/api/presentations/${id}/analysis`,
  category: (category: string) => `${API_BASE_URL}/api/category/${category}`,
  question: (category: string, question: string) => `${API_BASE_URL}/api/question/${category}/${question}`,
  // Add more endpoints as needed
  // evaluations: `${API_BASE_URL}/api/evaluations`,
} as const

// API utility functions
export async function fetchWithErrorHandling<T>(url: string): Promise<T> {
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

// Types for API responses
export interface PresentationResponse {
  id: string
  title: string
  presenter: string
  company: string
}

export interface PresentationAnalysisResponse {
  id: string
  title: string
  presenter: string
  company: string
  strengths: string[]
  improvements: string[]
  summary: string
  aiScores: {
    "[O/I 수준 진단]": number
    "[과제 목표 수준]": number
    "[성과 지속 가능성]": number
    "[Process/System]": number
    "[본원적 경쟁력 연계]": number
    "[혁신성]": number
    "[실행 가능성]": number
    "[기대 효과]": number
  }
  onSiteScores: {
    "[전략적 중요도]": number
    "[실행 가능성]": number
    "[발표 완성도]": number
  }
}

export interface ApiError {
  message: string
  status?: number
}

export interface CategoryResponse {
  title: string
  subtitle: string
  questions: Array<{
    id: string
    question: string
    description: string
  }>
}

export interface QuestionResponse {
  id: string
  title: string
  answer: string
  categoryName: string
}

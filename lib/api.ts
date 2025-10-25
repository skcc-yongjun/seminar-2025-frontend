// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export const API_ENDPOINTS = {
  presentations: `${API_BASE_URL}/seminar/api/presentations`,
  presenters: `${API_BASE_URL}/seminar/api/presenters`,
  presentationAnalysis: (id: string) => `${API_BASE_URL}/seminar/api/presentations/${id}/analysis`,
  category: (category: string) => `${API_BASE_URL}/seminar/api/category/${category}`,
  question: (category: string, question: string) => `${API_BASE_URL}/seminar/api/qna-questions/${question}`,
  qnaKeywords: (sessionType: string) => `${API_BASE_URL}/seminar/api/qna-questions/session/${sessionType}/keywords`,
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
export interface PresenterResponse {
  presenter_id: string
  name: string
  company: string
  created_at: string
}

export interface PresenterList {
  total: number
  items: PresenterResponse[]
}

export interface PresentationResponse {
  presentation_id: string
  session_type: string
  presenter_id: string
  topic: string
  presentation_order: number
  status: string
  material_url?: string
  start_time?: string
  end_time?: string
  duration_seconds?: number
  created_at: string
}

export interface PresentationList {
  total: number
  items: PresentationResponse[]
}

export interface PresentationWithPresenter extends PresentationResponse {
  presenter?: PresenterResponse
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
  id: string          // question_id
  title: string       // question_text
  answer: string      // answer_text
  categoryName: string // group, business, market
  questionVideoUrl: string // question_video_url
  answerVideoUrl: string // answer_video_url
  video_result?: string // video_result from API
  questionText: string // questionText from API
  answerText: string   // answerText from API
}

export interface QnAKeywordListResponse {
  total: number
  keywords: string[]
}

// API functions
export async function fetchPresenters(): Promise<PresenterResponse[]> {
  const data = await fetchWithErrorHandling<PresenterList>(API_ENDPOINTS.presenters)
  return data.items
}

export async function fetchPresentations(sessionType?: string): Promise<PresentationResponse[]> {
  let url: string = API_ENDPOINTS.presentations
  
  // session_type이 제공되면 쿼리 파라미터 추가
  if (sessionType) {
    url = `${url}?session_type=${encodeURIComponent(sessionType)}`
  }
  
  const data = await fetchWithErrorHandling<PresentationList>(url)
  return data.items
}

export async function fetchPresentationsWithPresenters(sessionType?: string): Promise<PresentationWithPresenter[]> {
  // 발표 목록과 발표자 목록을 모두 가져와서 조인
  const [presentations, presenters] = await Promise.all([
    fetchPresentations(sessionType),
    fetchPresenters(),
  ])

  // presenter_id로 조인
  const presenterMap = new Map(presenters.map(p => [p.presenter_id, p]))
  
  return presentations.map(presentation => ({
    ...presentation,
    presenter: presenterMap.get(presentation.presenter_id),
  }))
}

export async function fetchQnAKeywords(sessionType: string): Promise<string[]> {
  const data = await fetchWithErrorHandling<QnAKeywordListResponse>(
    API_ENDPOINTS.qnaKeywords(sessionType)
  )
  return data.keywords
}

export interface QnAQuestionResponse {
  question_id: number
  presentation_id: string
  keyword: string | null
  timestamp_label: string | null
  timestamp_seconds: number | null
  question_text: string
  answer_text: string | null
  created_at: string
}

export interface QnAQuestionListResponse {
  total: number
  items: QnAQuestionResponse[]
}

export async function fetchQnAQuestionsByKeyword(keyword: string): Promise<QnAQuestionResponse[]> {
  const data = await fetchWithErrorHandling<QnAQuestionListResponse>(
    `${API_BASE_URL}/seminar/api/qna-questions/keyword/${encodeURIComponent(keyword)}`
  )
  return data.items
}

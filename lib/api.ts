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

/**
 * 발표자 목록 조회
 * @returns 발표자 목록
 */
export async function fetchPresenters(): Promise<PresenterResponse[]> {
  const data = await fetchWithErrorHandling<PresenterList>(API_ENDPOINTS.presenters)
  return data.items
}

/**
 * 발표자 생성
 * @param presenter 발표자 생성 데이터
 * @returns 생성된 발표자
 */
export async function createPresenter(presenter: { name: string; company: string; presenter_id?: string }): Promise<PresenterResponse> {
  const response = await fetch(API_ENDPOINTS.presenters, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(presenter),
  })
  
  if (!response.ok) {
    throw new Error(`발표자 생성 실패: ${response.status}`)
  }
  
  return response.json()
}

/**
 * 발표자 수정
 * @param presenterId 발표자 ID
 * @param presenter 발표자 수정 데이터
 * @returns 수정된 발표자
 */
export async function updatePresenter(presenterId: string, presenter: { name?: string; company?: string }): Promise<PresenterResponse> {
  const response = await fetch(`${API_ENDPOINTS.presenters}/${presenterId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(presenter),
  })
  
  if (!response.ok) {
    throw new Error(`발표자 수정 실패: ${response.status}`)
  }
  
  return response.json()
}

/**
 * 발표자 삭제
 * @param presenterId 발표자 ID
 */
export async function deletePresenter(presenterId: string): Promise<void> {
  const response = await fetch(`${API_ENDPOINTS.presenters}/${presenterId}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error(`발표자 삭제 실패: ${response.status}`)
  }
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

export async function fetchQnAQuestionsByKeyword(keyword: string): Promise<QnAQuestionResponse[]> {
  const data = await fetchWithErrorHandling<QnAQuestionList>(
    `${API_BASE_URL}/seminar/api/qna-questions/keyword/${encodeURIComponent(keyword)}`
  )
  return data.items
}

// Character API Types
export interface CharacterResponse {
  character_id: string
  character_name: string
  voice_id: string
  created_at: string
}

export interface CharacterList {
  total: number
  items: CharacterResponse[]
}

/**
 * 캐릭터 목록 조회
 * @returns 캐릭터 목록
 */
export async function fetchCharacters(): Promise<CharacterResponse[]> {
  const data = await fetchWithErrorHandling<CharacterList>(`${API_BASE_URL}/seminar/api/characters`)
  return data.items
}

/**
 * 발표 생성 (FormData 사용)
 * @param presentation 발표 생성 데이터 (PDF 파일 포함 가능)
 * @returns 생성된 발표
 */
export async function createPresentation(presentation: {
  session_type: string
  presenter_id: string
  topic: string
  presentation_order: number
  presentation_id?: string
  status?: string
  pdf_file?: File
}): Promise<PresentationResponse> {
  const formData = new FormData()
  
  // 필수 필드
  formData.append('session_type', presentation.session_type)
  formData.append('presenter_id', presentation.presenter_id)
  formData.append('topic', presentation.topic)
  formData.append('presentation_order', presentation.presentation_order.toString())
  
  // 선택 필드
  if (presentation.presentation_id) {
    formData.append('presentation_id', presentation.presentation_id)
  }
  if (presentation.status) {
    formData.append('status', presentation.status)
  }
  if (presentation.pdf_file) {
    formData.append('pdf_file', presentation.pdf_file)
  }
  
  const response = await fetch(API_ENDPOINTS.presentations, {
    method: 'POST',
    body: formData, // FormData는 Content-Type을 자동으로 설정
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`발표 생성 실패: ${response.status} - ${error}`)
  }
  
  return response.json()
}

/**
 * 발표 수정
 * @param presentationId 발표 ID
 * @param presentation 발표 수정 데이터
 * @returns 수정된 발표
 */
export async function updatePresentation(
  presentationId: string,
  presentation: {
    topic?: string
    presentation_order?: number
    status?: string
    material_url?: string
    start_time?: string
    end_time?: string
    duration_seconds?: number
  }
): Promise<PresentationResponse> {
  const response = await fetch(`${API_ENDPOINTS.presentations}/${presentationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(presentation),
  })
  
  if (!response.ok) {
    throw new Error(`발표 수정 실패: ${response.status}`)
  }
  
  return response.json()
}

/**
 * 발표 삭제
 * @param presentationId 발표 ID
 */
export async function deletePresentation(presentationId: string): Promise<void> {
  const response = await fetch(`${API_ENDPOINTS.presentations}/${presentationId}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error(`발표 삭제 실패: ${response.status}`)
  }
}

// Prompt API Types
export interface PromptResponse {
  prompt_id: string
  prompt_type: 'AI 평가' | '질문 생성'
  content: string
  presentation_id?: string
  created_at: string
}

export interface PromptList {
  total: number
  items: PromptResponse[]
}

/**
 * 프롬프트 목록 조회
 * @param presentationId 발표 ID로 필터링 (선택사항)
 * @returns 프롬프트 목록
 */
export async function fetchPrompts(presentationId?: string): Promise<PromptResponse[]> {
  let url = `${API_BASE_URL}/seminar/api/prompts`
  if (presentationId) {
    url += `?presentation_id=${encodeURIComponent(presentationId)}`
  }
  const data = await fetchWithErrorHandling<PromptList>(url)
  return data.items
}

/**
 * 프롬프트 생성
 * @param prompt 프롬프트 생성 데이터
 * @returns 생성된 프롬프트
 */
export async function createPrompt(prompt: {
  prompt_type: 'AI 평가' | '질문 생성'
  content: string
  presentation_id?: string
  prompt_id?: string
}): Promise<PromptResponse> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/prompts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prompt),
  })
  
  if (!response.ok) {
    throw new Error(`프롬프트 생성 실패: ${response.status}`)
  }
  
  return response.json()
}

/**
 * 프롬프트 수정
 * @param promptId 프롬프트 ID
 * @param prompt 프롬프트 수정 데이터
 * @returns 수정된 프롬프트
 */
export async function updatePrompt(
  promptId: string,
  prompt: {
    prompt_type?: 'AI 평가' | '질문 생성'
    content?: string
    presentation_id?: string
  }
): Promise<PromptResponse> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/prompts/${promptId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(prompt),
  })
  
  if (!response.ok) {
    throw new Error(`프롬프트 수정 실패: ${response.status}`)
  }
  
  return response.json()
}

/**
 * 프롬프트 삭제
 * @param promptId 프롬프트 ID
 */
export async function deletePrompt(promptId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/prompts/${promptId}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error(`프롬프트 삭제 실패: ${response.status}`)
  }
}

/**
 * 발표 상태를 "진행중"으로 초기화
 * @param presentationId 발표 ID
 * @returns 업데이트된 발표
 */
export async function resetPresentationToInProgress(presentationId: string): Promise<PresentationResponse> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/presentations/${presentationId}/reset-to-in-progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`발표 상태 초기화 실패: ${response.status}`)
  }
  
  return response.json()
}

// QnA Question API Types
export interface QnAQuestionResponse {
  question_id: number
  presentation_id: string
  title: string | null
  keyword: string | null
  timestamp_label: string | null
  timestamp_seconds: number | null
  question_text: string
  question_korean_caption: string | null
  answer_text: string | null
  answer_korean_caption: string | null
  is_selected: boolean
  created_by: number // 1: 자동생성, 2: 수동생성
  created_at: string
  video_created: boolean
  character_name: string | null // 매핑된 캐릭터 이름
}

export interface QnAQuestionList {
  total: number
  items: QnAQuestionResponse[]
}

export interface QnAQuestionCreate {
  presentation_id: string
  character_name: string // 캐릭터 이름 (필수)
  title?: string
  keyword?: string
  question_text: string
  question_korean_caption?: string
  answer_text?: string
  answer_korean_caption?: string
  is_selected?: boolean
  created_by?: number
}

export interface ManualQACreateResponse {
  question_id: number
  presentation_id: string
  question_text: string
  answer_text: string | null
  created_by: number
  is_selected: boolean
  created_at: string
  avatar_generation_status: string // "completed", "failed", "pending"
  question_video_url: string | null
  answer_video_url: string | null
  avatar_error_message: string | null
  processing_time_seconds: number | null
}

export interface QnAQuestionUpdate {
  title?: string
  keyword?: string
  question_text?: string
  question_korean_caption?: string
  answer_text?: string
  answer_korean_caption?: string
  is_selected?: boolean
  created_by?: number
}

/**
 * QnA 질문 목록 조회
 * @param presentationId 발표 ID로 필터링 (선택사항)
 * @returns QnA 질문 목록
 */
export async function fetchQnAQuestions(presentationId?: string): Promise<QnAQuestionResponse[]> {
  let url = `${API_BASE_URL}/seminar/api/qna-questions`
  if (presentationId) {
    url += `?presentation_id=${encodeURIComponent(presentationId)}`
  }
  const data = await fetchWithErrorHandling<QnAQuestionList>(url)
  return data.items
}

/**
 * QnA 질문 생성 (아바타 비디오 생성 포함)
 * @param question QnA 질문 생성 데이터
 * @returns 생성된 QnA 질문 및 아바타 비디오 정보
 */
export async function createQnAQuestion(question: QnAQuestionCreate): Promise<ManualQACreateResponse> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/qna-questions/manual-with-avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(question),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`QnA 질문 생성 실패: ${response.status} - ${errorText}`)
  }
  
  return response.json()
}

/**
 * QnA 질문 수정
 * @param questionId 질문 ID
 * @param question QnA 질문 수정 데이터
 * @returns 수정된 QnA 질문
 */
export async function updateQnAQuestion(
  questionId: number,
  question: QnAQuestionUpdate
): Promise<QnAQuestionResponse> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/qna-questions/${questionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(question),
  })
  
  if (!response.ok) {
    throw new Error(`QnA 질문 수정 실패: ${response.status}`)
  }
  
  return response.json()
}

/**
 * QnA 질문 삭제
 * @param questionId 질문 ID
 */
export async function deleteQnAQuestion(questionId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/qna-questions/${questionId}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error(`QnA 질문 삭제 실패: ${response.status}`)
  }
}

/**
 * QnA 질문 선택 상태 토글
 * @param questionId 질문 ID
 * @returns 업데이트된 QnA 질문
 */
export async function toggleQnAQuestionSelect(questionId: number): Promise<QnAQuestionResponse> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/qna-questions/${questionId}/toggle-select`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`QnA 질문 선택 상태 토글 실패: ${response.status}`)
  }
  
  return response.json()
}

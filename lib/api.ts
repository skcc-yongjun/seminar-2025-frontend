// 프롬프트 테스트(질문 생성만, DB 저장 없음)
export interface PromptTestRequest {
  presentation_id: string;
  prompt_override?: string;
  count?: number;
}

export interface PromptTestResponse {
  presentation_id: string;
  raw_result: string;
  parsed_result?: any;
  parse_error?: string;
  metadata: {
    image_count: number;
    transcript_count: number;
    prompt_type?: string;
  };
}

export async function postPromptTest(data: PromptTestRequest): Promise<PromptTestResponse> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/prompts/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`프롬프트 테스트 실패: ${response.status}`);
  }
  return response.json();
}

// 프롬프트 테스트 스트리밍
export async function* postPromptTestStream(data: PromptTestRequest, timeoutMs: number = 300000): AsyncGenerator<string, void, unknown> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(`${API_BASE_URL}/seminar/api/prompts/test/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`프롬프트 테스트 스트리밍 실패: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.done) {
                return;
              }
              if (parsed.chunk) {
                yield parsed.chunk;
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Stream request timeout after ${timeoutMs}ms`)
    }
    throw error
  }
}
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
export async function fetchWithErrorHandling<T>(url: string, timeoutMs: number = 300000): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`)
    }
    throw error
  }
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
  keywords_en: string[]
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
  is_used: boolean
  created_by: number // 1: 자동생성, 2: 수동생성
  created_at: string
  video_created: boolean
  character_name: string | null // 매핑된 캐릭터 이름
}

export interface QnAQuestionWithVideoResponse {
  question_id: number
  presentation_id: string
  title: string | null
  keyword: string | null
  question_text: string
  question_korean_caption: string | null
  answer_text: string | null
  answer_korean_caption: string | null
  is_selected: boolean
  is_used: boolean
  created_by: number
  created_at: string

  // QuestionCharacter 조인 정보
  video_result: string | null
  answer_video_result: string | null
  character_id: string | null
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
  is_used?: boolean
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
 * QnA 질문 생성 (Direct Vision 방식)
 * - 백엔드: POST /seminar/api/qna-questions/direct-vision
 * - FormData로 presentation_id를 전달해야 함
 * @param presentationId 발표 ID
 * @returns 생성된 첫 번째 QnA 질문
 */
export async function generateQnAQuestions(
  presentationId: string
): Promise<QnAQuestionResponse> {
  const formData = new FormData()
  formData.append('presentation_id', presentationId)

  const response = await fetch(
    `${API_BASE_URL}/seminar/api/qna-questions/direct-vision`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Q&A 생성 실패: ${response.status} - ${errorText}`)
  }

  return response.json()
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

// Human Evaluation Score API Types
export interface HumanEvaluationScoreItem {
  category: string
  score: number
}

export interface HumanEvaluationScoreBatchCreate {
  device_id: string
  scores: HumanEvaluationScoreItem[]
}

export interface HumanEvaluationScoreResponse {
  score_id: number
  presentation_id: string
  device_id: string
  category: string
  score: number
  score_type: string
  evaluated_at: string
  created_at: string
}

export interface HumanEvaluationScoreBatchResponse {
  presentation_id: string
  saved_count: number
  scores: HumanEvaluationScoreResponse[]
}

export interface EvaluatorCountResponse {
  presentation_id: string
  evaluator_count: number
  total_evaluator_count: number
  score_type: string
}

/**
 * 사람 평가 점수 배치 제출
 * @param presentationId 발표 ID
 * @param data 평가 점수 데이터 (device_id, scores)
 * @returns 저장된 평가 점수 정보
 */
export async function submitHumanEvaluationScores(
  presentationId: string,
  data: HumanEvaluationScoreBatchCreate
): Promise<HumanEvaluationScoreBatchResponse> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/human-evaluation-scores/batch/${presentationId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  )
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`평가 제출 실패: ${response.status} - ${errorText}`)
  }
  
  return response.json()
}

/**
 * 평가 완료 인원 수 조회
 * @param presentationId 발표 ID
 * @param scoreType 점수 타입 (기본값: '최종')
 * @returns 평가 완료 인원 수 정보
 */
export async function fetchEvaluatorCount(
  presentationId: string,
  scoreType: string = '최종'
): Promise<EvaluatorCountResponse> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/human-evaluation-scores/presentation/${presentationId}/evaluator-count?score_type=${encodeURIComponent(scoreType)}`
  )
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`평가 인원 수 조회 실패: ${response.status} - ${errorText}`)
  }
  
  return response.json()
}

/**
 * 발표 정보 조회 (단일)
 * @param presentationId 발표 ID
 * @returns 발표 정보
 */
export async function fetchPresentation(presentationId: string): Promise<PresentationResponse> {
  const response = await fetch(`${API_ENDPOINTS.presentations}/${presentationId}`)
  
  if (!response.ok) {
    throw new Error(`발표 조회 실패: ${response.status}`)
  }
  
  return response.json()
}

// Presentation Analysis Comment API Types
export interface PresentationAnalysisCommentResponse {
  comment_id: number
  presentation_id: string
  type: string // '강점' | '약점' | '총평'
  title: string | null // 제목
  comment: string // 본문
  source_type: string // '발표' | '자료'
  source: string | null
  created_at: string
}

export interface PresentationAnalysisCommentList {
  total: number
  items: PresentationAnalysisCommentResponse[]
}

/**
 * 발표 분석 코멘트 조회
 * @param presentationId 발표 ID
 * @returns 분석 코멘트 목록 (강점, 약점, 총평)
 */
export async function fetchPresentationAnalysisComments(
  presentationId: string
): Promise<PresentationAnalysisCommentResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/presentation-analysis-comments?presentation_id=${encodeURIComponent(presentationId)}`
  )
  
  if (!response.ok) {
    throw new Error(`분석 코멘트 조회 실패: ${response.status}`)
  }
  
  const data = await response.json() as PresentationAnalysisCommentList
  return data.items
}

export interface PresentationAnalysisCommentCreate {
  presentation_id: string
  type: string // '강점' | '약점' | '총평'
  title?: string | null // 제목
  comment: string // 본문
  source_type: string // '발표' | '자료'
  source?: string | null
}

export interface PresentationAnalysisCommentUpdate {
  type?: string
  title?: string | null // 제목
  comment?: string // 본문
  source_type?: string
  source?: string | null
}

/**
 * 발표 분석 코멘트 생성
 * @param data 생성할 코멘트 데이터
 * @returns 생성된 코멘트
 */
export async function createPresentationAnalysisComment(
  data: PresentationAnalysisCommentCreate
): Promise<PresentationAnalysisCommentResponse> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/presentation-analysis-comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error(`분석 코멘트 생성 실패: ${response.status}`)
  }
  
  return response.json()
}

/**
 * 발표 분석 코멘트 수정
 * @param commentId 코멘트 ID
 * @param data 수정할 데이터
 * @returns 수정된 코멘트
 */
export async function updatePresentationAnalysisComment(
  commentId: number,
  data: PresentationAnalysisCommentUpdate
): Promise<PresentationAnalysisCommentResponse> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/presentation-analysis-comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error(`분석 코멘트 수정 실패: ${response.status}`)
  }
  
  return response.json()
}

/**
 * 발표 분석 코멘트 삭제
 * @param commentId 코멘트 ID
 * @returns 삭제 성공 여부
 */
export async function deletePresentationAnalysisComment(commentId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/presentation-analysis-comments/${commentId}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error(`분석 코멘트 삭제 실패: ${response.status}`)
  }
}

// AI Evaluation Score API Types
export interface AIEvaluationScoreResponse {
  score_id: number
  presentation_id: string
  category: string
  score: number | string  // Decimal은 문자열로 반환될 수 있음
  score_type: string
  evaluated_at: string
  created_at: string
}

export interface AIEvaluationScoreList {
  total: number
  items: AIEvaluationScoreResponse[]
}

/**
 * AI 평가 점수 조회
 * @param presentationId 발표 ID
 * @returns AI 평가 점수 목록
 */
export async function fetchAIEvaluationScores(
  presentationId: string
): Promise<AIEvaluationScoreResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/ai-evaluation-scores?presentation_id=${encodeURIComponent(presentationId)}`
  )
  
  if (!response.ok) {
    throw new Error(`AI 평가 점수 조회 실패: ${response.status}`)
  }
  
  const data = await response.json() as AIEvaluationScoreList
  return data.items
}

// Human Evaluation Score Average API Types
export interface HumanEvaluationScoreStats {
  presentation_id: string
  category: string
  avg_score: number | string  // Decimal은 문자열로 반환될 수 있음
  min_score: number | string
  max_score: number | string
  score_count: number
}

/**
 * 사람 평가 평균 점수 조회
 * @param presentationId 발표 ID
 * @param scoreType 점수 타입 (기본값: '최종')
 * @returns 카테고리별 평균 점수
 */
export async function fetchHumanEvaluationAverageScores(
  presentationId: string,
  scoreType: string = '최종'
): Promise<HumanEvaluationScoreStats[]> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/human-evaluation-scores/presentation/${presentationId}/average?score_type=${encodeURIComponent(scoreType)}`
  )
  
  if (!response.ok) {
    throw new Error(`사람 평가 평균 점수 조회 실패: ${response.status}`)
  }
  
  return response.json()
}

// QnA Categories API Types (더 이상 사용하지 않음 - 고정된 카테고리 사용)

/**
 * QnA 카테고리 목록 조회 (한글-영어 키워드 쌍)
 * @returns QnA 키워드 쌍 목록 (제목 업데이트용)
 */
export async function fetchQnACategories(): Promise<{title: string, titleEn: string}[]> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/qna-questions/session/세션2/keywords`)
  
  if (!response.ok) {
    throw new Error(`QnA 키워드 조회 실패: ${response.status}`)
  }
  
  const data = await response.json() as QnAKeywordListResponse
  
  // 한글과 영어 키워드를 쌍으로 묶어서 반환
  return data.keywords.map((keyword, index) => ({
    title: keyword,
    titleEn: data.keywords_en[index] || keyword
  }))
}


// ============================================================================
// 패널토의 관련 API
// ============================================================================

/**
 * 패널토의 인사이트 인터페이스
 */
export interface PanelInsight {
  comment_id: number
  presentation_id: string
  timestamp_label: string
  timestamp_seconds: number
  comment_text: string
  category: string
  created_at: string
}

/**
 * 패널토의 인사이트 목록 응답
 */
export interface PanelInsightList {
  total: number
  items: PanelInsight[]
}

/**
 * 패널토의 발표 생성 요청
 */
export interface PanelPresentationCreate {
  presentation_id?: string
  session_type: "패널토의"
  presenter_id: string
  topic: string
  presentation_order: number
  status?: string
}

/**
 * 패널토의 인사이트 조회
 * 
 * @param presentationId - 발표 ID
 * @returns 인사이트 목록
 */
export async function getPanelInsights(presentationId: string): Promise<PanelInsightList> {
  const url = `${API_BASE_URL}/seminar/api/ai-comments?presentation_id=${presentationId}&category=insight`
  return fetchWithErrorHandling<PanelInsightList>(url)
}

/**
 * 패널토의 발표 생성
 * 
 * @param data - 발표 생성 데이터
 * @returns 생성된 발표 정보
 */
export async function createPanelPresentation(data: PanelPresentationCreate): Promise<PresentationResponse> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/presentations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`발표 생성 실패: ${response.status} - ${errorText}`)
  }
  
  return response.json()
}

/**
 * 키워드별 미사용 질문 랜덤 조회 및 사용 표시
 * @param keyword 키워드
 * @returns 비디오 URL이 포함된 질문 정보
 */
export async function fetchRandomUnusedQuestionByKeyword(
  keyword: string
): Promise<QnAQuestionWithVideoResponse> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/qna-questions/keyword/${encodeURIComponent(keyword)}/unused-random`
  )

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`AI가 카테고리 '${keyword}'에 해당하는 질문을 준비중입니다.`)
    }
    throw new Error(`질문 조회 실패: ${response.status}`)
  }

  return response.json()
}

/**
 * 키워드별 선택된 질문 랜덤 조회 및 선택 해제
 * @param keyword 검색할 키워드
 * @returns 랜덤으로 선택된 질문 정보
 */
export async function fetchRandomSelectedQuestionByKeyword(keyword: string): Promise<QnAQuestionResponse> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/qna-questions/keyword/${encodeURIComponent(keyword)}/selected`)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`AI가 카테고리 '${keyword}'에 해당하는 질문을 생성중입니다.`)
    }
    throw new Error(`질문 조회 실패: ${response.status}`)
  }

  return response.json()
}

// ==================== Live Q&A API ====================

/**
 * Live Q&A 세션 상태 타입
 */
export type LiveQAStatus = 'intro' | 'recording' | 'generating' | 'playing' | 'completed' | 'error'

/**
 * Live Q&A 세션 정보
 */
export interface LiveQASession {
  session_id: string
  status: LiveQAStatus
  character_id?: string
  created_at: string
}

/**
 * Live Q&A 세션 상태 정보 (폴링용)
 */
export interface LiveQASessionState {
  session_id: string
  status: LiveQAStatus
  generation_progress: number
  question_text?: string
  answer_text?: string
  answer_video_url?: string
  error_message?: string
  created_at: string
  started_recording_at?: string
  stopped_recording_at?: string
  started_generating_at?: string
  completed_at?: string
}

/**
 * 새로운 Live Q&A 세션 시작
 * @returns 생성된 세션 정보
 */
export async function startLiveQASession(): Promise<LiveQASession> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/live-qa/session/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({})
  })

  if (!response.ok) {
    const error = await response.json()
    if (response.status === 409) {
      throw new Error('이미 진행 중인 세션이 있습니다')
    }
    throw new Error(error.message || 'Live Q&A 세션 시작 실패')
  }

  return response.json()
}

/**
 * 현재 Live Q&A 세션 상태 조회 (폴링용)
 * @returns 세션 상태 정보
 */
export async function getLiveQAStatus(): Promise<LiveQASessionState> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/live-qa/session/current/status`)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('활성 세션이 없습니다')
    }
    throw new Error('세션 상태 조회 실패')
  }

  return response.json()
}

/**
 * STT 녹음 시작
 * @param sessionId 세션 ID
 */
export async function startRecording(sessionId: string): Promise<LiveQASession> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/live-qa/session/${sessionId}/start-recording`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({})
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'STT 녹음 시작 실패')
  }

  return response.json()
}

/**
 * STT 녹음 중지 및 답변 생성
 * @param sessionId 세션 ID
 * @param manualText 수동 입력 텍스트 (테스트용)
 * @param audioFilePath 오디오 파일 경로
 */
export async function stopRecording(
  sessionId: string,
  manualText?: string,
  audioFilePath?: string
): Promise<LiveQASession> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/live-qa/session/${sessionId}/stop-recording`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      manual_text: manualText,
      audio_file_path: audioFilePath
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'STT 녹음 중지 실패')
  }

  return response.json()
}

/**
 * Live Q&A 세션 종료
 * @param sessionId 세션 ID
 */
export async function endLiveQASession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/seminar/api/live-qa/session/${sessionId}`, {
    method: 'DELETE'
  })

  if (!response.ok && response.status !== 404) {
    throw new Error('세션 종료 실패')
  }
}


// (수동 머지) 사라진 것들 모두 추가

// Full Transcript API Types
export interface FullTranscriptResponse {
  full_transcript_id: string
  presentation_id: string
  full_text: string
  word_count: number
  created_at: string
  updated_at: string | null
}

export interface FullTranscriptList {
  total: number
  items: FullTranscriptResponse[]
}

/**
 * 전체 트랜스크립트 조회
 * @param presentationId 발표 ID
 * @returns 전체 트랜스크립트
 */
export async function fetchFullTranscript(
  presentationId: string
): Promise<FullTranscriptResponse | null> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/full-transcripts?presentation_id=${encodeURIComponent(presentationId)}`
  )
  
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`전체 트랜스크립트 조회 실패: ${response.status}`)
  }
  
  const data = await response.json() as FullTranscriptList
  return data.items.length > 0 ? data.items[0] : null
}

// Presentation Summary API Types
export interface PresentationSummaryResponse {
  summary_id: string
  presentation_id: string
  summary_text: string
  key_points: string[] | null
  created_at: string
  updated_at: string | null
}

export interface PresentationSummaryList {
  total: number
  items: PresentationSummaryResponse[]
}

/**
 * 프레젠테이션 요약 조회
 * @param presentationId 발표 ID
 * @returns 프레젠테이션 요약
 */
export async function fetchPresentationSummary(
  presentationId: string
): Promise<PresentationSummaryResponse | null> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/presentation-summaries?presentation_id=${encodeURIComponent(presentationId)}`
  )
  
  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`프레젠테이션 요약 조회 실패: ${response.status}`)
  }
  
  const data = await response.json() as PresentationSummaryList
  return data.items.length > 0 ? data.items[0] : null
}

// AI Comments API Types
export interface AICommentResponse {
  comment_id: number
  presentation_id: string
  comment_text: string
  created_at: string
  timestamp_seconds: number
}

export interface AICommentList {
  total: number
  items: AICommentResponse[]
}

/**
 * AI 코멘트를 타임스탬프 이후로 조회
 * @param presentationId 발표 ID
 * @param timestampSeconds 타임스탬프 (초)
 * @returns AI 코멘트 목록
 */
export async function fetchAICommentsAfterTimestamp(
  presentationId: string,
  timestampSeconds: number
): Promise<AICommentResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/ai-comments/presentation/${encodeURIComponent(presentationId)}/after-timestamp?timestamp_seconds=${timestampSeconds}`
  )
  
  if (!response.ok) {
    if (response.status === 404) {
      return []
    }
    throw new Error(`AI 코멘트 조회 실패: ${response.status}`)
  }
  
  const data = await response.json() as AICommentList
  return data.items
}

// Human Evaluation Scores API Types
export interface HumanEvaluationScoreResponse {
  score_id: number
  presentation_id: string
  category: string
  score: number
  evaluator_id: string
  created_at: string
  updated_at: string | null
}

export interface HumanEvaluationScoreList {
  total: number
  items: HumanEvaluationScoreResponse[]
}

/**
 * 사람 평가 점수 조회
 * @param presentationId 발표 ID (옵션)
 * @returns 사람 평가 점수 목록
 */
export async function fetchHumanEvaluationScores(
  presentationId?: string
): Promise<HumanEvaluationScoreResponse[]> {
  const url = presentationId 
    ? `${API_BASE_URL}/seminar/api/human-evaluation-scores?presentation_id=${encodeURIComponent(presentationId)}`
    : `${API_BASE_URL}/seminar/api/human-evaluation-scores`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`사람 평가 점수 조회 실패: ${response.status}`)
  }
  
  const data = await response.json() as HumanEvaluationScoreList
  return data.items
}

// Combined Summary Data Type
export interface PresentationSummaryData {
  presentation_id: string
  presenter_name: string
  company: string
  topic: string
  ai_score: number
  human_score: number
  final_score: number
  detailed_scores: Record<string, number>
  summary_text?: string
  key_points?: string[]
}

// Category Rankings API Types
export interface CategoryRankingItem {
  rank: number
  presenter_id: string
  name: string
  company: string
  presentation_id: string
  topic: string
  score: number
}

export interface CategoryRankingList {
  ranking_type: string
  total: number
  items: CategoryRankingItem[]
}

export interface CategoryRankingsResponse {
  ai_category_rankings: CategoryRankingList[]
  human_category_rankings: CategoryRankingList[]
}

/**
 * 카테고리별 세부 랭킹 조회
 * @param sessionType 세션 타입 (세션1, 세션2)
 * @param limit 조회할 최대 개수
 * @returns 카테고리별 랭킹 정보
 */
export async function fetchCategoryRankings(
  sessionType: string,
  limit: number = 100
): Promise<CategoryRankingsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/rankings/${encodeURIComponent(sessionType)}/detail?limit=${limit}`
  )
  
  if (!response.ok) {
    throw new Error(`카테고리별 랭킹 조회 실패: ${response.status}`)
  }
  
  return await response.json() as CategoryRankingsResponse
}

// ============================================================================
// Session 1 & Session 2 Operation 관련 API
// ============================================================================

/**
 * AI 평가 결과 인터페이스
 */
export interface AIEvaluationResult {
  presentation_id: string
  image_count: number
  transcript_count: number
  feedback_count: number
  score_count: number
  evaluation_time: number
  raw_response: string
}

/**
 * [Session1] 발표 AI 평가 생성
 * @param presentationId 발표 ID
 * @returns AI 평가 결과
 */
export async function generateAIEvaluation(presentationId: string): Promise<AIEvaluationResult> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/presentations/${presentationId}/ai-evaluation`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI 평가 생성 실패: ${response.status} - ${errorText}`)
  }
  
  return response.json()
}

/**
 * 총점 계산 결과 인터페이스
 */
export interface PresentationSummaryResult {
  summary_id: string
  presentation_id: string
  total_score: number
  ai_score: number
  human_score: number
  calculation_details: {
    ai_evaluation: {
      score: number
      weights: Record<string, number>
      multiplier: number
    }
    human_evaluation: {
      score: number
      weights: Record<string, number>
      multiplier: number
    }
    total_calculation: {
      ai_weight: number
      human_weight: number
    }
  }
}

/**
 * [Session1] 발표 총점 계산 및 요약 생성
 * @param presentationId 발표 ID
 * @returns 총점 계산 결과
 */
export async function calculatePresentationSummary(presentationId: string): Promise<PresentationSummaryResult> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/presentation-summaries/calculate/${presentationId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`총점 계산 실패: ${response.status} - ${errorText}`)
  }
  
  return response.json()
}

/**
 * AI 질문 생성 결과 인터페이스
 */
export interface QnAGenerationResult {
  question_id: number
  presentation_id: string
  title: string | null
  keyword: string | null
  question_text: string
  answer_text: string | null
  created_by: number
  is_selected: boolean
  created_at: string
}

/**
 * 아바타 비디오 생성 입력 인터페이스
 */
export interface AvatarVideoInput {
  character_name: string
  text: string
  is_question: boolean
}

/**
 * 아바타 비디오 생성 결과 인터페이스
 */
export interface AvatarVideoResult {
  video_url: string
  character_name: string
  text: string
  is_question: boolean
  processing_time_seconds: number
  status: string
  error_message?: string
}

/**
 * [Session2] 아바타 비디오 생성
 * @param data 아바타 비디오 생성 데이터
 * @returns 생성된 비디오 정보
 */
export async function generateAvatarVideo(data: AvatarVideoInput): Promise<AvatarVideoResult> {
  const response = await fetch(
    `${API_BASE_URL}/seminar/api/avatar-video/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  )
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`아바타 비디오 생성 실패: ${response.status} - ${errorText}`)
  }
  
  return response.json()
}
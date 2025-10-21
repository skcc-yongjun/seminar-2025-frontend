# Seminar 2025 Frontend - 실시간 STT 통합 가이드

실시간 음성 인식(STT) 기능이 통합된 프론트엔드 가이드입니다.

## 📋 목차

- [개요](#개요)
- [주요 기능](#주요-기능)
- [설치 및 실행](#설치-및-실행)
- [사용법](#사용법)
- [Hook API](#hook-api)
- [컴포넌트 구조](#컴포넌트-구조)
- [커스터마이징](#커스터마이징)

## 🎯 개요

`/single-presenter` 페이지에서 실시간 음성 인식 기능을 사용할 수 있습니다. Web Audio API를 통해 마이크로부터 음성을 캡처하고, WebSocket으로 백엔드에 전송하여 실시간으로 텍스트로 변환합니다.

## ✨ 주요 기능

### 1. 실시간 음성 캡처
- **Web Audio API**: 브라우저 기반 오디오 처리
- **자동 리샘플링**: 16kHz로 자동 변환
- **PCM 변환**: CLOVA Speech API 호환 형식

### 2. WebSocket 스트리밍
- **양방향 통신**: 오디오 전송 및 결과 수신
- **자동 재연결**: 연결 끊김 시 자동 복구
- **상태 관리**: 연결, 녹음, 에러 상태 추적

### 3. UI 컴포넌트
- **실시간 트랜스크립트**: STT 결과 즉시 표시
- **신뢰도 표시**: 인식 정확도 시각화
- **상태 배지**: 녹음/연결 상태 표시
- **오디오 파형**: 시각적 피드백

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
cd seminar-2025-frontend
npm install
# 또는
pnpm install
```

### 2. 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
```

브라우저에서 `http://localhost:3000/single-presenter`를 열어 테스트합니다.

## 📱 사용법

### 1. 발표 진행 중 화면

페이지가 로드되면 자동으로 다음이 실행됩니다:
1. **마이크 권한 요청**: 브라우저가 마이크 접근 권한을 요청
2. **WebSocket 연결**: 백엔드 STT 서비스에 연결
3. **녹음 시작**: 음성 캡처 및 실시간 전송 시작

### 2. 실시간 트랜스크립트 확인

화면 하단의 카드에서 다음 정보를 확인할 수 있습니다:
- **녹음 상태**: 녹음 중 / 대기 중
- **연결 상태**: STT 연결됨
- **신뢰도**: 인식 정확도 (%)
- **텍스트**: 실시간 변환된 텍스트

### 3. 수동 제어

화면 우측 하단 버튼으로 수동 제어 가능:
- **녹음 중지**: 일시적으로 STT 중지
- **녹음 시작**: STT 재개
- **발표 종료**: 세션 완전 종료

## 🔧 Hook API

### `useSTT(sessionId, backendUrl)`

실시간 STT를 위한 커스텀 Hook입니다.

#### 파라미터

```typescript
sessionId: string     // 세션 고유 ID (예: "윤풍영_1729512345")
backendUrl?: string   // 백엔드 WebSocket URL (기본값: "ws://localhost:8000")
```

#### 반환값

```typescript
interface UseSTTReturn {
  // 상태
  isRecording: boolean      // 녹음 중 여부
  isConnected: boolean      // WebSocket 연결 여부
  transcript: string        // 현재 트랜스크립트 전체 텍스트
  confidence: number        // 최근 인식 신뢰도 (0~1)
  error: string | null      // 에러 메시지
  
  // 메서드
  startRecording: () => Promise<void>  // 녹음 시작
  stopRecording: () => void            // 녹음 중지
  clearTranscript: () => void          // 트랜스크립트 초기화
}
```

#### 사용 예시

```typescript
import { useSTT } from "@/hooks/use-stt"

function MyComponent() {
  const {
    isRecording,
    isConnected,
    transcript,
    confidence,
    error,
    startRecording,
    stopRecording,
  } = useSTT("session_123")

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        녹음 시작
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        녹음 중지
      </button>
      
      {isConnected && <span>✅ 연결됨</span>}
      {error && <div className="error">{error}</div>}
      
      <div className="transcript">
        <p>{transcript}</p>
        <small>신뢰도: {(confidence * 100).toFixed(0)}%</small>
      </div>
    </div>
  )
}
```

## 🏗 컴포넌트 구조

### `/app/single-presenter/page.tsx`

메인 발표자 뷰 컴포넌트입니다.

#### 주요 구성 요소

```tsx
<SinglePresenterView>
  {/* monitoring 단계 - 발표 진행 중 */}
  <div>
    {/* 중앙 마이크 아이콘 + 애니메이션 */}
    <Mic className="animated" />
    
    {/* 오디오 파형 시각화 */}
    <AudioWaveform />
    
    {/* 실시간 STT 결과 카드 */}
    <Card>
      {/* 상태 배지 */}
      <StatusBadges />
      
      {/* 트랜스크립트 표시 영역 */}
      <TranscriptDisplay>{transcript}</TranscriptDisplay>
    </Card>
    
    {/* 제어 버튼 */}
    <ControlButtons />
  </div>
  
  {/* completion 단계 - 발표 완료 */}
  <CompletionScreen />
  
  {/* qna 단계 - Q&A */}
  <QnAScreen />
</SinglePresenterView>
```

### `/hooks/use-stt.ts`

STT 로직을 캡슐화한 커스텀 Hook입니다.

#### 내부 구조

```typescript
useSTT()
├── WebSocket 관리
│   ├── connectWebSocket()      // 연결 수립
│   ├── 메시지 핸들러           // 서버 메시지 처리
│   └── 연결 상태 추적
│
├── 오디오 처리
│   ├── getUserMedia()          // 마이크 접근
│   ├── AudioContext 설정       // Web Audio API
│   ├── ScriptProcessorNode     // 실시간 오디오 처리
│   ├── resampleAudio()         // 16kHz로 리샘플링
│   └── convertToPCM()          // PCM 16-bit 변환
│
└── 상태 관리
    ├── isRecording             // 녹음 상태
    ├── isConnected             // 연결 상태
    ├── transcript              // 트랜스크립트
    ├── confidence              // 신뢰도
    └── error                   // 에러
```

## 🎨 커스터마이징

### 1. 백엔드 URL 변경

```typescript
// 다른 백엔드 서버 사용
const stt = useSTT("session_123", "wss://my-backend.com")
```

### 2. 오디오 설정 커스터마이징

`use-stt.ts`의 `startRecording()` 함수에서:

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    channelCount: 1,
    sampleRate: 16000,
    echoCancellation: true,      // 에코 제거
    noiseSuppression: true,      // 노이즈 억제
    autoGainControl: true,       // 자동 게인 조정
  },
})
```

### 3. UI 스타일링

트랜스크립트 카드 스타일 변경:

```tsx
<Card className="bg-black/60 backdrop-blur-md border border-white/10">
  {/* 커스텀 스타일 적용 */}
</Card>
```

### 4. 키워드 하이라이팅

특정 키워드를 강조 표시:

```typescript
function highlightKeywords(text: string, keywords: string[]) {
  let highlighted = text
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi')
    highlighted = highlighted.replace(regex, '<mark>$1</mark>')
  })
  return highlighted
}

// 사용
<div dangerouslySetInnerHTML={{
  __html: highlightKeywords(transcript, ['AI', 'SK', '비즈니스'])
}} />
```

## 🐛 문제 해결

### 1. 마이크 권한 에러

**문제**: "마이크 권한을 확인해주세요"

**해결**:
- 브라우저 설정에서 마이크 권한 확인
- HTTPS 연결 사용 (Chrome은 localhost 제외)
- 다른 애플리케이션이 마이크를 사용 중인지 확인

### 2. WebSocket 연결 실패

**문제**: "WebSocket 연결 오류가 발생했습니다"

**해결**:
```typescript
// 백엔드 서버 상태 확인
curl http://localhost:8000/seminar/api/health

// 올바른 URL 사용
const stt = useSTT("session_123", "ws://localhost:8000")  // ✅
// const stt = useSTT("session_123", "wss://localhost:8000")  // ❌ (로컬에서)
```

### 3. 오디오 품질 문제

**문제**: 인식률이 낮음

**해결**:
- 조용한 환경에서 테스트
- 마이크와 적절한 거리 유지
- 마이크 설정에서 입력 볼륨 확인
- `noiseSuppression`, `echoCancellation` 활성화

### 4. 지연(Latency) 문제

**문제**: STT 결과가 늦게 표시됨

**해결**:
```typescript
// 버퍼 크기 조정 (작을수록 낮은 지연, 높은 CPU 사용)
const bufferSize = 2048  // 기본값: 4096
const processor = audioContext.createScriptProcessor(bufferSize, 1, 1)
```

## 📊 성능 최적화

### 1. 메모리 관리

```typescript
// 컴포넌트 언마운트 시 자동 정리
useEffect(() => {
  return () => {
    if (isRecording) {
      stopRecording()
    }
  }
}, [isRecording, stopRecording])
```

### 2. 리샘플링 최적화

```typescript
// 선형 보간 사용으로 CPU 부하 최소화
const resampleAudio = (audioData, inputRate, outputRate) => {
  // ... 효율적인 리샘플링 알고리즘
}
```

### 3. WebSocket 재연결

```typescript
// 자동 재연결 로직
ws.onclose = () => {
  setTimeout(() => {
    if (shouldReconnect) {
      connectWebSocket()
    }
  }, 1000)
}
```

## 🔒 보안 고려사항

1. **HTTPS 사용**: 프로덕션에서는 HTTPS 필수
2. **권한 관리**: 마이크 접근 권한 적절히 처리
3. **데이터 암호화**: WebSocket Secure (WSS) 사용
4. **세션 검증**: 백엔드에서 세션 ID 검증

## 📱 브라우저 호환성

| 브라우저 | 지원 여부 | 비고 |
|---------|----------|------|
| Chrome | ✅ | 권장 |
| Firefox | ✅ | |
| Safari | ✅ | iOS 11+ |
| Edge | ✅ | Chromium 기반 |
| IE | ❌ | 미지원 |

## 📞 문의 및 지원

- **개발자**: SK 하이퍼오토메이션 팀
- **프로젝트**: Seminar 2025
- **날짜**: 2025-10-21

## 📄 라이선스

Copyright © 2025 SK Group. All rights reserved.


import { useState, useRef, useCallback, useEffect } from "react"

/**
 * STT 결과 인터페이스
 */
export interface STTResult {
  text: string
  position: number
  confidence: number
  full_text: string
  timestamp: string
}

/**
 * STT Hook 반환 타입
 */
export interface UseSTTReturn {
  isRecording: boolean
  isConnected: boolean
  transcript: string
  confidence: number
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearTranscript: () => void
}

/**
 * 실시간 STT를 위한 커스텀 Hook
 * 
 * @param sessionId - 세션 ID (발표자 식별용)
 * @param backendUrl - 백엔드 WebSocket URL (기본값: ws://localhost:8000)
 * @returns STT 관련 상태와 함수들
 */
export function useSTT(
  sessionId: string,
  // 로컬 개발: ws://localhost:8000
  // backendUrl: string = "ws://localhost:8000"
  // 배포 (HTTPS): wss://ceo-seminar-2025.skax.co.kr
  backendUrl: string = "wss://ceo-seminar-2025.skax.co.kr"
): UseSTTReturn {
  // 상태 관리
  const [isRecording, setIsRecording] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Ref로 관리할 객체들
  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const isRecordingRef = useRef<boolean>(false) // 클로저 문제 해결용 ref

  /**
   * WebSocket 연결 설정
   */
  const connectWebSocket = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      const wsUrl = `${backendUrl}/seminar/api/ws/stt/${sessionId}`
      const ws = new WebSocket(wsUrl)

      ws.binaryType = "arraybuffer"

      ws.onopen = () => {
        console.log("WebSocket 연결 성공")
        setIsConnected(true)
        setError(null)
        resolve(ws)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "connected") {
            console.log("STT 서비스 연결:", data.message)
          } else if (data.type === "transcription") {
            // STT 결과 업데이트
            setTranscript(data.full_text || data.text)
            setConfidence(data.confidence || 0)
          } else if (data.type === "completed") {
            console.log("STT 완료:", data.message)
          } else if (data.type === "error") {
            console.error("STT 오류:", data.message)
            setError(data.message)
          }
        } catch (err) {
          console.error("메시지 파싱 오류:", err)
        }
      }

      ws.onerror = (event) => {
        console.error("WebSocket 오류:", event)
        setError("WebSocket 연결 오류가 발생했습니다.")
        setIsConnected(false)
        reject(new Error("WebSocket 연결 실패"))
      }

      ws.onclose = () => {
        console.log("WebSocket 연결 종료")
        setIsConnected(false)
      }

      wsRef.current = ws
    })
  }, [sessionId, backendUrl])

  /**
   * 오디오를 PCM 형식으로 변환
   * CLOVA Speech API는 16kHz, 1 Channel, 16-bit PCM을 요구
   */
  const convertToPCM = (audioData: Float32Array): Int16Array => {
    const pcmData = new Int16Array(audioData.length)
    
    for (let i = 0; i < audioData.length; i++) {
      // Float32 (-1.0 ~ 1.0)를 Int16 (-32768 ~ 32767)로 변환
      const s = Math.max(-1, Math.min(1, audioData[i]))
      pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    
    return pcmData
  }

  /**
   * 오디오 샘플링 레이트 변환 (리샘플링)
   * 마이크의 샘플링 레이트를 16kHz로 변환
   */
  const resampleAudio = (
    audioData: Float32Array,
    inputSampleRate: number,
    outputSampleRate: number = 16000
  ): Float32Array => {
    if (inputSampleRate === outputSampleRate) {
      return audioData
    }

    const ratio = inputSampleRate / outputSampleRate
    const outputLength = Math.round(audioData.length / ratio)
    const result = new Float32Array(outputLength)

    for (let i = 0; i < outputLength; i++) {
      const position = i * ratio
      const index = Math.floor(position)
      const fraction = position - index

      // 선형 보간
      if (index + 1 < audioData.length) {
        result[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction
      } else {
        result[i] = audioData[index]
      }
    }

    return result
  }

  /**
   * 녹음 시작
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null)

      // 1. WebSocket 연결
      const ws = await connectWebSocket()

      // 2. 마이크 접근 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // 모노
          sampleRate: 16000, // 16kHz (CLOVA Speech API 요구사항)
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      mediaStreamRef.current = stream

      // 3. Web Audio API 설정
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000, // 16kHz
      })
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      sourceRef.current = source

      // 4. ScriptProcessorNode 생성 (오디오 데이터 처리)
      const bufferSize = 4096 // 버퍼 크기
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (event) => {
        // ref를 사용하여 최신 상태 확인 (클로저 문제 해결)
        if (!isRecordingRef.current || !ws || ws.readyState !== WebSocket.OPEN) {
          return
        }

        // 오디오 데이터 가져오기
        const inputData = event.inputBuffer.getChannelData(0)

        // 리샘플링 (필요한 경우)
        const resampledData = resampleAudio(
          inputData,
          audioContext.sampleRate,
          16000
        )

        // PCM 변환
        const pcmData = convertToPCM(resampledData)

        // WebSocket을 통해 백엔드로 전송
        try {
          ws.send(pcmData.buffer)
          // console.log(`🎤 오디오 전송: ${pcmData.length} samples`)
        } catch (err) {
          console.error("오디오 전송 오류:", err)
        }
      }

      // 5. 오디오 노드 연결
      source.connect(processor)
      processor.connect(audioContext.destination)

      // ref와 state 모두 업데이트
      isRecordingRef.current = true
      setIsRecording(true)
      console.log("녹음 시작")
    } catch (err) {
      console.error("녹음 시작 오류:", err)
      setError(
        err instanceof Error
          ? err.message
          : "녹음을 시작할 수 없습니다. 마이크 권한을 확인해주세요."
      )
      isRecordingRef.current = false
      setIsRecording(false)
    }
  }, [connectWebSocket])

  /**
   * 녹음 중지
   */
  const stopRecording = useCallback(() => {
    console.log("녹음 중지")

    // ref 업데이트 (오디오 전송 즉시 중단)
    isRecordingRef.current = false

    // WebSocket 종료 메시지 전송
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop" }))
      wsRef.current.close()
    }

    // 오디오 노드 정리
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }

    // 오디오 컨텍스트 종료
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // 미디어 스트림 정지
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    isRecordingRef.current = false
    setIsRecording(false)
    setIsConnected(false)
  }, [])

  /**
   * 트랜스크립트 초기화
   */
  const clearTranscript = useCallback(() => {
    setTranscript("")
    setConfidence(0)
  }, [])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording()
      }
    }
  }, [isRecording, stopRecording])

  return {
    isRecording,
    isConnected,
    transcript,
    confidence,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
  }
}


"use client"

/**
 * Live Q&A 실시간 플로어 질문 페이지
 *
 * 상태별 화면:
 * - intro: 도입 비디오 재생
 * - recording: 녹음 중 애니메이션
 * - generating: 답변 생성 중 (진행률 표시)
 * - playing: 답변 비디오 재생
 * - error: 에러 표시
 */

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Mic, ArrowLeft } from 'lucide-react'
import { getLiveQAStatus, endLiveQASession, type LiveQASessionState, type LiveQAStatus } from '@/lib/api'

export default function LiveQASessionPage() {
  const router = useRouter()

  const [sessionState, setSessionState] = useState<LiveQASessionState | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 1초마다 현재 활성 세션 상태 폴링
  useEffect(() => {
    console.log('📊 [LIVE QA] 폴링 시작 - 활성 세션 감지')

    const fetchStatus = async () => {
      try {
        const data = await getLiveQAStatus()
        console.log('✅ [LIVE QA] 상태 조회:', data)
        setSessionState(data)
        setError(null)
      } catch (err) {
        // 활성 세션이 없는 것은 에러가 아님
        if (err instanceof Error && err.message.includes('활성 세션이 없습니다')) {
          setSessionState(null)
          setError(null)
        } else {
          console.error('❌ [LIVE QA] 상태 조회 실패:', err)
          setError(err instanceof Error ? err.message : '상태 조회 실패')
        }
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 1000)

    return () => {
      console.log('🛑 [LIVE QA] 폴링 중지')
      clearInterval(interval)
    }
  }, [])

  const handleReturn = async () => {
    console.log('🔙 [LIVE QA] 카테고리로 돌아가기')
    if (sessionState?.session_id) {
      await endLiveQASession(sessionState.session_id)
    }
    router.push('/qna')
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f1f3a] to-[#0a1628] text-white">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">⚠️ {error}</p>
          <button
            onClick={handleReturn}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium"
          >
            카테고리로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (!sessionState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0f1f3a] to-[#0a1628] text-white">
        <div className="text-center">
          <Brain className="w-20 h-20 text-cyan-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold text-cyan-300 mb-4">세션 대기 중...</h2>
          <p className="text-gray-400 mb-8">
            운영자가 Live Q&A 세션을 시작하면<br />
            자동으로 화면이 전환됩니다.
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1f3a] to-[#0a1628] text-white p-8">
      <AnimatePresence mode="wait">
        {sessionState.status === 'intro' && <IntroScreen />}
        {sessionState.status === 'recording' && <RecordingScreen />}
        {sessionState.status === 'generating' && (
          <GeneratingScreen
            progress={sessionState.generation_progress}
            question={sessionState.question_text || ''}
          />
        )}
        {sessionState.status === 'playing' && (
          <PlayingScreen
            videoUrl={sessionState.answer_video_url || ''}
            question={sessionState.question_text || ''}
            answer={sessionState.answer_text || ''}
            onReturn={handleReturn}
          />
        )}
        {sessionState.status === 'error' && (
          <ErrorScreen error={sessionState.error_message || '오류가 발생했습니다'} onReturn={handleReturn} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ========== 화면 컴포넌트 ==========

function IntroScreen() {
  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen"
    >
      <div className="relative mb-8">
        <div className="absolute top-2 left-2 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
          LIVE
        </div>
        <video
          className="w-full max-w-4xl rounded-2xl shadow-2xl"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={process.env.NEXT_PUBLIC_LIVE_QA_INTRO_VIDEO || '/intro-video.mp4'} type="video/mp4" />
        </video>
      </div>
      <h1 className="text-5xl font-bold text-cyan-300 mb-4">질문이 있으신가요?</h1>
      <p className="text-xl text-gray-400">Operation 화면에서 녹음을 시작해주세요</p>
    </motion.div>
  )
}

function RecordingScreen() {
  return (
    <motion.div
      key="recording"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Mic className="w-32 h-32 text-red-500 mb-8" />
      </motion.div>
      <h2 className="text-4xl font-bold text-red-400 mb-4">녹음 중...</h2>
      <div className="flex space-x-2">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-16 bg-red-500 rounded-full"
            animate={{
              scaleY: [1, 2, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function GeneratingScreen({ progress, question }: { progress: number; question: string }) {
  return (
    <motion.div
      key="generating"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-8"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="mb-8"
      >
        <Brain className="w-32 h-32 text-cyan-400" />
      </motion.div>
      <h2 className="text-4xl font-bold text-cyan-300 mb-4">답변 생성 중...</h2>
      {question && (
        <p className="text-xl text-gray-300 mb-8 text-center max-w-2xl">"{question}"</p>
      )}
      <div className="w-full max-w-md bg-gray-700 rounded-full h-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-cyan-300 mt-4 text-xl font-medium">{progress}%</p>
    </motion.div>
  )
}

function PlayingScreen({
  videoUrl,
  question,
  answer,
  onReturn,
}: {
  videoUrl: string
  question: string
  answer: string
  onReturn: () => void
}) {
  return (
    <motion.div
      key="playing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-8"
    >
      <video
        className="w-full max-w-4xl rounded-2xl shadow-2xl mb-8"
        autoPlay
        controls
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      <div className="max-w-4xl w-full space-y-4 mb-8">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
          <h3 className="text-cyan-400 font-bold mb-2">질문:</h3>
          <p className="text-gray-300">{question}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
          <h3 className="text-cyan-400 font-bold mb-2">답변:</h3>
          <p className="text-gray-300">{answer}</p>
        </div>
      </div>

      <button
        onClick={onReturn}
        className="flex items-center space-x-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-bold text-lg transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
        <span>카테고리로 돌아가기</span>
      </button>
    </motion.div>
  )
}

function ErrorScreen({ error, onReturn }: { error: string; onReturn: () => void }) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen"
    >
      <div className="text-red-400 text-6xl mb-8">⚠️</div>
      <h2 className="text-4xl font-bold text-red-400 mb-4">오류 발생</h2>
      <p className="text-xl text-gray-300 mb-8">{error}</p>
      <button
        onClick={onReturn}
        className="flex items-center space-x-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-xl font-bold text-lg transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
        <span>카테고리로 돌아가기</span>
      </button>
    </motion.div>
  )
}

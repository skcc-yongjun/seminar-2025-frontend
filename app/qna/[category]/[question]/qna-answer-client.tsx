"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Home, List, Mic } from "lucide-react"
import { useState } from "react"

// Mock data for questions - in production, this would come from a database
const questionData: Record<
  string,
  Record<string, { id: string; title: string; answer: string; categoryName: string }>
> = {
  business: {
    strategy: {
      id: "Q1",
      title: "우리 회사의 핵심 비즈니스 전략은 무엇인가요?",
      answer:
        "SK그룹의 핵심 비즈니스 전략은 AI와 디지털 기술을 기반으로 한 지속가능한 성장입니다. 반도체, 배터리, 통신 등 핵심 사업에서 기술 리더십을 강화하고, 신사업 발굴을 통해 미래 성장 동력을 확보합니다. 또한 ESG 경영을 통해 사회적 가치를 창출하며, 글로벌 시장에서의 경쟁력을 지속적으로 높여나가고 있습니다.",
      categoryName: "비즈니스",
    },
    innovation: {
      id: "Q2",
      title: "디지털 혁신은 어떻게 추진하고 있나요?",
      answer:
        "SK그룹은 AI, 빅데이터, 클라우드 등 첨단 기술을 활용한 디지털 전환을 적극 추진하고 있습니다. 전사적 데이터 플랫폼을 구축하여 계열사 간 데이터를 통합하고, AI 기반 의사결정 시스템을 도입하여 업무 효율성을 극대화합니다. 또한 디지털 인재 양성 프로그램을 운영하여 조직 전체의 디지털 역량을 강화하고 있습니다.",
      categoryName: "비즈니스",
    },
    growth: {
      id: "Q3",
      title: "신규 사업 확장 계획은?",
      answer:
        "SK그룹은 미래 성장 동력 확보를 위해 친환경 에너지, 바이오헬스, AI 등 신산업 분야에 적극 투자하고 있습니다. 특히 수소 경제 생태계 구축, 차세대 배터리 기술 개발, AI 기반 헬스케어 서비스 등에 집중하며, 글로벌 파트너십을 통해 시장 진입을 가속화하고 있습니다.",
      categoryName: "비즈니스",
    },
    efficiency: {
      id: "Q4",
      title: "운영 효율성을 어떻게 개선하고 있나요?",
      answer:
        "AI와 자동화 기술을 활용하여 생산 공정을 최적화하고, 스마트 팩토리를 구축하여 생산성을 향상시키고 있습니다. 또한 업무 프로세스를 디지털화하여 의사결정 속도를 높이고, 데이터 기반 경영을 통해 자원 배분의 효율성을 극대화합니다. 지속적인 프로세스 혁신으로 비용을 절감하고 경쟁력을 강화하고 있습니다.",
      categoryName: "비즈니스",
    },
    customer: {
      id: "Q5",
      title: "고객 가치 창출 방안은?",
      answer:
        "고객 중심 경영을 핵심 가치로 삼고, 고객 데이터 분석을 통해 맞춤형 서비스를 제공합니다. AI 기반 고객 경험 플랫폼을 구축하여 고객 여정 전반에서 최적의 경험을 제공하며, 지속적인 고객 피드백 수렴을 통해 제품과 서비스를 개선합니다. 고객 만족도 향상이 곧 기업 가치 증대로 이어진다는 믿음으로 혁신을 추진합니다.",
      categoryName: "비즈니스",
    },
    partnership: {
      id: "Q6",
      title: "전략적 파트너십 계획은?",
      answer:
        "글로벌 기술 기업, 스타트업, 연구기관과의 전략적 제휴를 통해 혁신을 가속화합니다. 오픈 이노베이션 플랫폼을 운영하여 외부 혁신 자원을 적극 활용하고, 계열사 간 협력을 강화하여 그룹 차원의 시너지를 창출합니다. 특히 AI, 반도체, 배터리 등 핵심 기술 분야에서 글로벌 파트너와의 협력을 확대하고 있습니다.",
      categoryName: "비즈니스",
    },
  },
  group: {
    vision: {
      id: "Q1",
      title: "SK그룹의 비전과 미션은 무엇인가요?",
      answer:
        "SK그룹의 비전은 '지속가능한 행복'입니다. 경제적 가치와 사회적 가치를 동시에 추구하며, 모든 이해관계자의 행복을 증진시키는 것을 목표로 합니다. AI와 디지털 기술을 활용하여 사회 문제를 해결하고, 탄소중립을 실현하며, 포용적 성장을 이루어 더 나은 미래를 만들어갑니다.",
      categoryName: "그룹사",
    },
    synergy: {
      id: "Q2",
      title: "계열사 간 시너지는 어떻게 창출하나요?",
      answer:
        "SK그룹은 계열사 간 기술, 인력, 데이터를 공유하여 시너지를 창출합니다. 공동 R&D 프로젝트를 추진하고, 통합 플랫폼을 구축하여 효율성을 높입니다. 반도체-배터리-통신 등 핵심 사업 간 연계를 강화하여 밸류체인 전반의 경쟁력을 향상시키며, 그룹 차원의 전략적 의사결정을 통해 최적의 자원 배분을 실현합니다.",
      categoryName: "그룹사",
    },
    culture: {
      id: "Q3",
      title: "SK그룹의 조직 문화는?",
      answer:
        "SK그룹은 'SKMS(SK Management System)'를 기반으로 한 독특한 조직 문화를 가지고 있습니다. 구성원의 행복을 최우선으로 하며, 수평적 소통과 자율적 의사결정을 장려합니다. 실패를 두려워하지 않는 도전 정신, 지속적인 학습과 성장, 사회적 책임을 중시하는 문화를 통해 혁신을 추구합니다.",
      categoryName: "그룹사",
    },
    talent: {
      id: "Q4",
      title: "인재 육성 프로그램은?",
      answer:
        "SK그룹은 체계적인 리더십 개발 프로그램과 직무 전문성 강화 교육을 운영합니다. SK아카데미를 통해 AI, 데이터 사이언스 등 미래 핵심 역량을 교육하고, 글로벌 연수 프로그램으로 국제적 감각을 키웁니다. 또한 멘토링, 코칭 시스템을 통해 개인의 성장을 지원하며, 사내 벤처 프로그램으로 기업가 정신을 함양합니다.",
      categoryName: "그룹사",
    },
    esg: {
      id: "Q5",
      title: "ESG 경영 추진 현황은?",
      answer:
        "SK그룹은 ESG 경영을 핵심 전략으로 추진하고 있습니다. 2030년까지 탄소 배출량을 대폭 감축하고, 2050년 탄소중립을 목표로 합니다. 재생에너지 투자를 확대하고, 친환경 기술 개발에 집중하며, 사회적 가치 창출을 위한 다양한 프로그램을 운영합니다. 투명한 지배구조를 확립하고, 이해관계자와의 소통을 강화하여 지속가능한 성장을 실현합니다.",
      categoryName: "그룹사",
    },
    global: {
      id: "Q6",
      title: "글로벌 확장 전략은?",
      answer:
        "SK그룹은 북미, 유럽, 아시아 등 주요 시장에서 사업을 확대하고 있습니다. 현지 파트너십을 통해 시장 진입 장벽을 낮추고, 글로벌 M&A를 통해 기술과 시장을 확보합니다. 특히 반도체, 배터리, 바이오 등 핵심 사업에서 글로벌 경쟁력을 강화하며, 현지화 전략을 통해 각 시장의 특성에 맞는 제품과 서비스를 제공합니다.",
      categoryName: "그룹사",
    },
  },
  market: {
    trend: {
      id: "Q1",
      title: "현재 시장 트렌드는 어떻게 변화하고 있나요?",
      answer:
        "글로벌 시장은 AI, 친환경, 디지털 전환이 주요 트렌드로 자리잡고 있습니다. 특히 생성형 AI의 급속한 발전으로 산업 전반의 패러다임이 변화하고 있으며, 탄소중립 달성을 위한 친환경 기술 수요가 급증하고 있습니다. 또한 메타버스, Web3.0 등 새로운 디지털 생태계가 형성되면서 비즈니스 모델의 혁신이 가속화되고 있습니다.",
      categoryName: "시장",
    },
    competition: {
      id: "Q2",
      title: "경쟁 환경은 어떻게 분석하고 있나요?",
      answer:
        "글로벌 경쟁이 심화되는 가운데, 기술 혁신 속도와 고객 경험이 핵심 경쟁 요소로 부상하고 있습니다. 주요 경쟁사들의 전략을 면밀히 분석하고, 우리의 강점을 극대화할 수 있는 차별화 전략을 수립합니다. 특히 AI, 반도체, 배터리 등 핵심 기술 분야에서 선도적 위치를 확보하기 위해 지속적인 R&D 투자와 인재 확보에 주력하고 있습니다.",
      categoryName: "시장",
    },
    opportunity: {
      id: "Q3",
      title: "새로운 시장 기회는?",
      answer:
        "AI 반도체, 전기차 배터리, 수소 에너지, 바이오헬스 등 신산업 분야에서 큰 성장 기회가 있습니다. 특히 글로벌 탄소중립 정책으로 친환경 기술 시장이 급성장하고 있으며, 디지털 헬스케어 수요도 증가하고 있습니다. 신흥 시장에서의 중산층 확대와 디지털화 가속화도 새로운 기회를 제공하고 있습니다.",
      categoryName: "시장",
    },
    "customer-needs": {
      id: "Q4",
      title: "고객 니즈는 어떻게 변화하고 있나요?",
      answer:
        "고객들은 개인화된 경험, 지속가능성, 편의성을 중시하는 방향으로 변화하고 있습니다. AI 기반 맞춤형 서비스에 대한 기대가 높아지고, 친환경 제품에 대한 선호도가 증가하고 있습니다. 또한 옴니채널 경험과 즉각적인 서비스를 요구하며, 기업의 사회적 책임에 대한 관심도 커지고 있습니다.",
      categoryName: "시장",
    },
    regulation: {
      id: "Q5",
      title: "규제 환경 변화에 어떻게 대응하나요?",
      answer:
        "글로벌 규제 환경을 면밀히 모니터링하고, 선제적 대응 체계를 구축하고 있습니다. 특히 데이터 프라이버시, AI 윤리, 탄소 배출 규제 등에 대비하여 컴플라이언스 시스템을 강화하고 있습니다. 정부 및 규제 기관과의 협력을 통해 합리적인 규제 방향을 제시하고, 내부 리스크 관리 체계를 지속적으로 개선합니다.",
      categoryName: "시장",
    },
    forecast: {
      id: "Q6",
      title: "시장 전망과 예측은?",
      answer:
        "향후 5년간 AI, 반도체, 배터리 시장은 연평균 20% 이상 성장할 것으로 전망됩니다. 특히 생성형 AI 시장은 폭발적으로 성장하며, 전기차 보급 확대로 배터리 수요도 급증할 것입니다. 친환경 에너지 전환이 가속화되면서 수소, 태양광 등 신재생 에너지 시장도 크게 확대될 것으로 예상됩니다. 이러한 시장 변화에 선제적으로 대응하여 성장 기회를 선점하겠습니다.",
      categoryName: "시장",
    },
  },
}

export default function QnAAnswerClient({
  category,
  question,
}: {
  category: string
  question: string
}) {
  const categoryData = questionData[category]
  const data = categoryData?.[question]
  const [showAnswer, setShowAnswer] = useState(false)

  if (!data) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">질문을 찾을 수 없습니다</h1>
          <Link href={`/qna/${category}`} className="text-sk-red hover:underline">
            질문 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sk-red rounded flex items-center justify-center">
            <span className="text-white font-bold text-xl">SK</span>
          </div>
          <div>
            <div className="text-sm text-gray-400">SK GROUP</div>
            <div className="text-sm font-semibold">CEO 세미나</div>
          </div>
        </div>
        <div className="text-lg font-semibold">AI Biz.Model 구축 방향</div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
        {/* Question Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-16 h-16 rounded-full bg-sk-red flex items-center justify-center text-white font-bold text-xl mb-8 shadow-lg shadow-sk-red/50"
        >
          {data.id}
        </motion.div>

        {/* Question Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-medium text-center mb-16 max-w-3xl text-balance"
        >
          {data.title}
        </motion.h1>

        {/* Microphone Icon with Waveform */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-8 mb-12"
        >
          {/* Microphone */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sk-red to-red-700 flex items-center justify-center shadow-2xl shadow-sk-red/30">
            <Mic className="w-16 h-16 text-white" />
          </div>

          {/* Audio Waveform */}
          <div className="flex items-center gap-1 h-16">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-sk-red rounded-full"
                initial={{ height: 8 }}
                animate={{
                  height: [8, Math.random() * 48 + 16, 8],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.05,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Back to List Button */}
          <Link
            href={`/qna/${category}`}
            className="px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 transition-colors flex items-center gap-2"
          >
            <List className="w-5 h-5" />
            <span>목록으로</span>
          </Link>

          {/* View Answer Button */}
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-600/30"
          >
            실시간 생성한 답변 보기
          </button>
        </motion.div>

        {/* Answer Section (shown when button is clicked) */}
        {showAnswer && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 max-w-3xl w-full">
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
              <h2 className="text-xl font-semibold mb-4">답변 내용</h2>
              <p className="text-gray-300 leading-relaxed">{data.answer}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex items-center justify-between border-t border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="text-xs text-gray-500">© 2025 SK Group. All rights reserved.</div>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 transition-colors flex items-center gap-2 text-sm"
        >
          <Home className="w-4 h-4" />
          <span>홈으로</span>
        </Link>
      </div>
    </div>
  )
}

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Sample presentations data
// [Session 1] 발표자 목록 DTO
const presentations = [
  {
    id: "1",
    title: "Global Top-tier 대비 O/I 경쟁력 분석 및 개선방안",
    presenter: "윤풍영",
    company: "SK AX"
  },
  {
    id: "2",
    title: "AI Biz.Model 구축 방향",
    presenter: "김민수",
    company: "SK Telecom"
  },
  {
    id: "3",
    title: "5G 기반 AI 서비스 전략",
    presenter: "이지은",
    company: "SK Hynix"
  },
  {
    id: "4",
    title: "AI 기반 에너지 최적화",
    presenter: "박준호",
    company: "SK E&S"
  }
];

// Sample presentation analysis data
// [Session 1] 발표 분석 데이터 DTO (본 건은 목록인데, 실제는 단건으로 나와야 함)
const presentationAnalyses = {
  "1": {
    id: "1",
    title: "Global Top-tier 대비 O/I 경쟁력 분석 및 개선방안",
    presenter: "윤풍영",
    company: "SK AX",
    strengths: [
      "본원의 경쟁력과 인계가 잘 되어있으며, 기존 사업과의 시너지 효과를 명확하게 제시하였습니다.",
      "전략적 방향성이 명확하고 시장 분석을 통한 차별화 포인트가 구체적으로 드러났습니다.",
      "데이터 기반 분석이 체계적이며, 정량적 지표를 활용한 현황 진단이 설득력 있게 구성되었습니다."
    ],
    improvements: [
      "과제 목표 수준이 정량적으로 명시되지 않아 성과 측정 기준을 보다 구체화할 필요가 있습니다.",
      "명확한 수행 프로세스와 단계별 마일스톤이 드러나지 않아 실행 계획의 구체성을 보완해야 합니다.",
      "리스크 관리 방안과 대응 전략이 부족하여 예상 리스크에 대한 사전 대비책 마련이 필요합니다."
    ],
    summary: "전반적으로 우수한 발표였으며, 특히 본원적 경쟁력과의 연계성이 돋보였습니다. 다만 실행 계획의 구체성을 높이고 정량적 목표를 명확히 한다면 더욱 완성도 높은 과제가 될 것으로 판단됩니다.",
    aiScores: {
      "[O/I 수준 진단]": 8.5,
      "[과제 목표 수준]": 5.5,
      "[성과 지속 가능성]": 7.0,
      "[Process/System]": 5.0,
      "[본원적 경쟁력 연계]": 8.2,
      "[혁신성]": 7.5,
      "[실행 가능성]": 6.8,
      "[기대 효과]": 7.8
    },
    onSiteScores: {
      "[전략적 중요도]": 8.0,
      "[실행 가능성]": 6.5,
      "[발표 완성도]": 7.5
    }
  },
  "2": {
    id: "2",
    title: "AI Biz.Model 구축 방향",
    presenter: "김민수",
    company: "SK Telecom",
    strengths: [
      "AI 기술의 최신 트렌드를 반영한 혁신적인 비즈니스 모델을 제시하였습니다.",
      "시장 요구사항과 기술적 실현 가능성을 균형있게 고려한 접근 방식이 돋보입니다.",
      "구체적인 수익 모델과 ROI 계산이 명확하게 제시되어 설득력이 높습니다."
    ],
    improvements: [
      "경쟁사 대비 차별화 요소를 보다 구체적으로 명시할 필요가 있습니다.",
      "기술적 리스크와 대응 방안에 대한 상세한 분석이 부족합니다.",
      "단계적 실행 계획의 마일스톤과 성과 지표를 더욱 구체화해야 합니다."
    ],
    summary: "혁신적인 AI 비즈니스 모델이 잘 구성되어 있으며, 특히 수익성 분석이 인상적입니다. 경쟁 우위 요소를 더욱 강화하고 실행 계획을 보완한다면 매우 성공적인 프로젝트가 될 것으로 예상됩니다.",
    aiScores: {
      "[O/I 수준 진단]": 7.8,
      "[과제 목표 수준]": 8.2,
      "[성과 지속 가능성]": 7.5,
      "[Process/System]": 6.8,
      "[본원적 경쟁력 연계]": 7.2,
      "[혁신성]": 9.1,
      "[실행 가능성]": 7.0,
      "[기대 효과]": 8.5
    },
    onSiteScores: {
      "[전략적 중요도]": 8.8,
      "[실행 가능성]": 7.2,
      "[발표 완성도]": 8.0
    }
  },
  "3": {
    id: "3",
    title: "5G 기반 AI 서비스 전략",
    presenter: "이지은",
    company: "SK Hynix",
    strengths: [
      "5G와 AI의 융합을 통한 새로운 서비스 영역 발굴이 창의적입니다.",
      "기술적 타당성과 시장성을 동시에 고려한 균형잡힌 접근법이 우수합니다.",
      "파트너십 전략과 생태계 구축 방안이 구체적으로 제시되었습니다."
    ],
    improvements: [
      "5G 인프라 구축 현황과 연계한 현실적인 일정 계획이 필요합니다.",
      "고객 세그먼트별 서비스 차별화 전략이 더욱 세분화되어야 합니다.",
      "초기 투자 비용과 회수 계획에 대한 보다 정밀한 분석이 요구됩니다."
    ],
    summary: "5G와 AI의 시너지를 잘 활용한 혁신적인 서비스 전략입니다. 기술적 우수성과 더불어 시장 진입 전략을 보완한다면 큰 성과를 거둘 수 있을 것으로 판단됩니다.",
    aiScores: {
      "[O/I 수준 진단]": 8.0,
      "[과제 목표 수준]": 7.5,
      "[성과 지속 가능성]": 8.3,
      "[Process/System]": 7.2,
      "[본원적 경쟁력 연계]": 8.8,
      "[혁신성]": 8.7,
      "[실행 가능성]": 6.5,
      "[기대 효과]": 8.2
    },
    onSiteScores: {
      "[전략적 중요도]": 9.0,
      "[실행 가능성]": 6.8,
      "[발표 완성도]": 7.8
    }
  },
  "4": {
    id: "4",
    title: "AI 기반 에너지 최적화",
    presenter: "박준호",
    company: "SK E&S",
    strengths: [
      "에너지 효율성 향상을 위한 AI 활용 방안이 매우 실용적입니다.",
      "ESG 경영과 연계한 지속가능한 사업 모델이 시의적절합니다.",
      "기존 에너지 인프라와의 호환성을 고려한 점진적 도입 전략이 현실적입니다."
    ],
    improvements: [
      "AI 알고리즘의 정확도와 신뢰성 검증 방안이 구체화되어야 합니다.",
      "에너지 절약 효과의 정량적 측정 기준과 모니터링 체계가 필요합니다.",
      "규제 환경 변화에 대한 대응 전략과 리스크 관리 방안이 보완되어야 합니다."
    ],
    summary: "ESG 트렌드에 부합하는 혁신적인 에너지 최적화 솔루션입니다. 기술적 완성도를 높이고 성과 측정 체계를 보완한다면 사회적 가치와 경제적 성과를 동시에 달성할 수 있을 것입니다.",
    aiScores: {
      "[O/I 수준 진단]": 7.5,
      "[과제 목표 수준]": 8.0,
      "[성과 지속 가능성]": 9.2,
      "[Process/System]": 7.8,
      "[본원적 경쟁력 연계]": 8.5,
      "[혁신성]": 7.8,
      "[실행 가능성]": 8.2,
      "[기대 효과]": 8.8
    },
    onSiteScores: {
      "[전략적 중요도]": 8.5,
      "[실행 가능성]": 8.0,
      "[발표 완성도]": 8.2
    }
  }
};

// QnA category data (from frontend)
// [Session 2] Q&A 카테고리 데이터 DTO, 여기도 카테고리 별로 질문 목록이 나와야 함. (화면이 카테고리별로 분리되어 있음)
const categoryData = {
  business: {
    title: "비즈니스",
    subtitle: "Business",
    questions: [
      { id: "strategy", question: "우리 회사의 핵심 비즈니스 전략은 무엇인가요?", description: "장기 비전과 전략적 방향성" },
      { id: "innovation", question: "디지털 혁신은 어떻게 추진하고 있나요?", description: "디지털 전환과 기술 혁신 계획" },
      { id: "growth", question: "신규 사업 확장 계획은?", description: "새로운 성장 동력 발굴" },
      { id: "customer", question: "고객 가치 창출 방안은?", description: "고객 중심 경영과 서비스 혁신" },
    ],
  },
  group: {
    title: "그룹사",
    subtitle: "SK Group",
    questions: [
      { id: "vision", question: "SK그룹의 비전과 미션은 무엇인가요?", description: "그룹의 핵심 가치와 목표" },
      { id: "synergy", question: "계열사 간 시너지는 어떻게 창출하나요?", description: "그룹 차원의 협력과 통합" },
      { id: "culture", question: "SK그룹의 조직 문화는?", description: "기업 문화와 핵심 가치" },
      { id: "esg", question: "ESG 경영 추진 현황은?", description: "지속가능경영과 사회적 책임" },
    ],
  },
  market: {
    title: "시장",
    subtitle: "Market",
    questions: [
      { id: "trend", question: "현재 시장 트렌드는 어떻게 변화하고 있나요?", description: "산업 동향과 시장 변화" },
      { id: "competition", question: "경쟁 환경은 어떻게 분석하고 있나요?", description: "경쟁사 분석과 시장 포지셔닝" },
      { id: "opportunity", question: "새로운 시장 기회는?", description: "시장과 성장 가능성" },
      { id: "customer-needs", question: "고객 니즈는 어떻게 변화하고 있나요?", description: "소비자 행동과 수요 변화" },
      { id: "regulation", question: "규제 환경 변화에 어떻게 대응하나요?", description: "법규 준수와 리스크 관리" },
      { id: "forecast", question: "시장 전망과 예측은?", description: "미래 시장 예측과 대응 전략" },
    ],
  },
};

// GET /presentations endpoint
app.get('/api/presentations', (req, res) => {
  console.log('GET /presentations requested');
  res.json(presentations);
});

// GET /presentations/:id endpoint
app.get('/api/presentations/:id', (req, res) => {
  const id = req.params.id;
  const presentation = presentations.find(p => p.id === id);
  
  if (!presentation) {
    return res.status(404).json({ error: 'Presentation not found' });
  }
  
  res.json(presentation);
});

// GET /presentations/:id/analysis endpoint
app.get('/api/presentations/:id/analysis', (req, res) => {
  const id = req.params.id;
  const analysis = presentationAnalyses[id];
  
  if (!analysis) {
    return res.status(404).json({ error: 'Presentation analysis not found' });
  }
  
  console.log(`GET /presentations/${id}/analysis requested`);
  res.json(analysis);
});

// Question data for individual questions
const questionData = {
  business: {
    strategy: {
      id: "Q1",
      title: "우리 회사의 핵심 비즈니스 전략은 무엇인가요?",
      answer: "SK그룹의 핵심 비즈니스 전략은 AI와 디지털 기술을 기반으로 한 지속가능한 성장입니다. 반도체, 배터리, 통신 등 핵심 사업에서 기술 리더십을 강화하고, 신사업 발굴을 통해 미래 성장 동력을 확보합니다. 또한 ESG 경영을 통해 사회적 가치를 창출하며, 글로벌 시장에서의 경쟁력을 지속적으로 높여나가고 있습니다.",
      categoryName: "비즈니스",
    },
    innovation: {
      id: "Q2",
      title: "디지털 혁신은 어떻게 추진하고 있나요?",
      answer: "SK그룹은 AI, 빅데이터, 클라우드 등 첨단 기술을 활용한 디지털 전환을 적극 추진하고 있습니다. 전사적 데이터 플랫폼을 구축하여 계열사 간 데이터를 통합하고, AI 기반 의사결정 시스템을 도입하여 업무 효율성을 극대화합니다. 또한 디지털 인재 양성 프로그램을 운영하여 조직 전체의 디지털 역량을 강화하고 있습니다.",
      categoryName: "비즈니스",
    },
    growth: {
      id: "Q3",
      title: "신규 사업 확장 계획은?",
      answer: "SK그룹은 미래 성장 동력 확보를 위해 친환경 에너지, 바이오헬스, AI 등 신산업 분야에 적극 투자하고 있습니다. 특히 수소 경제 생태계 구축, 차세대 배터리 기술 개발, AI 기반 헬스케어 서비스 등에 집중하며, 글로벌 파트너십을 통해 시장 진입을 가속화하고 있습니다.",
      categoryName: "비즈니스",
    },
    customer: {
      id: "Q4",
      title: "고객 가치 창출 방안은?",
      answer: "고객 중심 경영을 핵심 가치로 삼고, 고객 데이터 분석을 통해 맞춤형 서비스를 제공합니다. AI 기반 고객 경험 플랫폼을 구축하여 고객 여정 전반에서 최적의 경험을 제공하며, 지속적인 고객 피드백 수렴을 통해 제품과 서비스를 개선합니다. 고객 만족도 향상이 곧 기업 가치 증대로 이어진다는 믿음으로 혁신을 추진합니다.",
      categoryName: "비즈니스",
    },
  },
  group: {
    vision: {
      id: "Q1",
      title: "SK그룹의 비전과 미션은 무엇인가요?",
      answer: "SK그룹의 비전은 '지속가능한 행복'입니다. 경제적 가치와 사회적 가치를 동시에 추구하며, 모든 이해관계자의 행복을 증진시키는 것을 목표로 합니다. AI와 디지털 기술을 활용하여 사회 문제를 해결하고, 탄소중립을 실현하며, 포용적 성장을 이루어 더 나은 미래를 만들어갑니다.",
      categoryName: "그룹사",
    },
    synergy: {
      id: "Q2",
      title: "계열사 간 시너지는 어떻게 창출하나요?",
      answer: "SK그룹은 계열사 간 기술, 인력, 데이터를 공유하여 시너지를 창출합니다. 공동 R&D 프로젝트를 추진하고, 통합 플랫폼을 구축하여 효율성을 높입니다. 반도체-배터리-통신 등 핵심 사업 간 연계를 강화하여 밸류체인 전반의 경쟁력을 향상시키며, 그룹 차원의 전략적 의사결정을 통해 최적의 자원 배분을 실현합니다.",
      categoryName: "그룹사",
    },
    culture: {
      id: "Q3",
      title: "SK그룹의 조직 문화는?",
      answer: "SK그룹은 'SKMS(SK Management System)'를 기반으로 한 독특한 조직 문화를 가지고 있습니다. 구성원의 행복을 최우선으로 하며, 수평적 소통과 자율적 의사결정을 장려합니다. 실패를 두려워하지 않는 도전 정신, 지속적인 학습과 성장, 사회적 책임을 중시하는 문화를 통해 혁신을 추구합니다.",
      categoryName: "그룹사",
    },
    esg: {
      id: "Q4",
      title: "ESG 경영 추진 현황은?",
      answer: "SK그룹은 ESG 경영을 핵심 전략으로 추진하고 있습니다. 2030년까지 탄소 배출량을 대폭 감축하고, 2050년 탄소중립을 목표로 합니다. 재생에너지 투자를 확대하고, 친환경 기술 개발에 집중하며, 사회적 가치 창출을 위한 다양한 프로그램을 운영합니다. 투명한 지배구조를 확립하고, 이해관계자와의 소통을 강화하여 지속가능한 성장을 실현합니다.",
      categoryName: "그룹사",
    },
  },
  market: {
    trend: {
      id: "Q1",
      title: "현재 시장 트렌드는 어떻게 변화하고 있나요?",
      answer: "글로벌 시장은 AI, 친환경, 디지털 전환이 주요 트렌드로 자리잡고 있습니다. 특히 생성형 AI의 급속한 발전으로 산업 전반의 패러다임이 변화하고 있으며, 탄소중립 달성을 위한 친환경 기술 수요가 급증하고 있습니다. 또한 메타버스, Web3.0 등 새로운 디지털 생태계가 형성되면서 비즈니스 모델의 혁신이 가속화되고 있습니다.",
      categoryName: "시장",
    },
    competition: {
      id: "Q2",
      title: "경쟁 환경은 어떻게 분석하고 있나요?",
      answer: "글로벌 경쟁이 심화되는 가운데, 기술 혁신 속도와 고객 경험이 핵심 경쟁 요소로 부상하고 있습니다. 주요 경쟁사들의 전략을 면밀히 분석하고, 우리의 강점을 극대화할 수 있는 차별화 전략을 수립합니다. 특히 AI, 반도체, 배터리 등 핵심 기술 분야에서 선도적 위치를 확보하기 위해 지속적인 R&D 투자와 인재 확보에 주력하고 있습니다.",
      categoryName: "시장",
    },
    opportunity: {
      id: "Q3",
      title: "새로운 시장 기회는?",
      answer: "AI 반도체, 전기차 배터리, 수소 에너지, 바이오헬스 등 신산업 분야에서 큰 성장 기회가 있습니다. 특히 글로벌 탄소중립 정책으로 친환경 기술 시장이 급성장하고 있으며, 디지털 헬스케어 수요도 증가하고 있습니다. 신흥 시장에서의 중산층 확대와 디지털화 가속화도 새로운 기회를 제공하고 있습니다.",
      categoryName: "시장",
    },
    "customer-needs": {
      id: "Q4",
      title: "고객 니즈는 어떻게 변화하고 있나요?",
      answer: "고객들은 개인화된 경험, 지속가능성, 편의성을 중시하는 방향으로 변화하고 있습니다. AI 기반 맞춤형 서비스에 대한 기대가 높아지고, 친환경 제품에 대한 선호도가 증가하고 있습니다. 또한 옴니채널 경험과 즉각적인 서비스를 요구하며, 기업의 사회적 책임에 대한 관심도 커지고 있습니다.",
      categoryName: "시장",
    },
    regulation: {
      id: "Q5",
      title: "규제 환경 변화에 어떻게 대응하나요?",
      answer: "글로벌 규제 환경을 면밀히 모니터링하고, 선제적 대응 체계를 구축하고 있습니다. 특히 데이터 프라이버시, AI 윤리, 탄소 배출 규제 등에 대비하여 컴플라이언스 시스템을 강화하고 있습니다. 정부 및 규제 기관과의 협력을 통해 합리적인 규제 방향을 제시하고, 내부 리스크 관리 체계를 지속적으로 개선합니다.",
      categoryName: "시장",
    },
    forecast: {
      id: "Q6",
      title: "시장 전망과 예측은?",
      answer: "향후 5년간 AI, 반도체, 배터리 시장은 연평균 20% 이상 성장할 것으로 전망됩니다. 특히 생성형 AI 시장은 폭발적으로 성장하며, 전기차 보급 확대로 배터리 수요도 급증할 것입니다. 친환경 에너지 전환이 가속화되면서 수소, 태양광 등 신재생 에너지 시장도 크게 확대될 것으로 예상됩니다. 이러한 시장 변화에 선제적으로 대응하여 성장 기회를 선점하겠습니다.",
      categoryName: "시장",
    },
  },
};

// GET /api/category/:category endpoint
app.get('/api/category/:category', (req, res) => {
  const { category } = req.params;
  const data = categoryData[category];
  if (!data) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(data);
});

// GET /api/question/:category/:question endpoint
app.get('/api/question/:category/:question', (req, res) => {
  const { category, question } = req.params;
  const categoryQuestions = questionData[category];
  if (!categoryQuestions) {
    return res.status(404).json({ error: 'Category not found' });
  }
  const questionDetail = categoryQuestions[question];
  if (!questionDetail) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.json(questionDetail);
});

app.listen(port, () => {
  console.log(`API Server running at http://localhost:${port}`);
  console.log(`Presentations endpoint: http://localhost:${port}/api/presentations`);
  console.log(`Analysis endpoint: http://localhost:${port}/api/presentations/:id/analysis`);
  console.log(`Category endpoints: http://localhost:${port}/api/category/{business|group|market}`);
  console.log(`Category Question endpoints: http://localhost:${port}/api/question/:category/:question`);
});

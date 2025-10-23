const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Sample presentations data
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

app.listen(port, () => {
  console.log(`API Server running at http://localhost:${port}`);
  console.log(`Presentations endpoint: http://localhost:${port}/api/presentations`);
  console.log(`Analysis endpoint: http://localhost:${port}/api/presentations/:id/analysis`);
});

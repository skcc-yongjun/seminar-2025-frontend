import { Suspense } from "react"
import QnAAnswerClient from "./qna-answer-client"

export default async function QnAAnswer({
  params,
}: {
  params: Promise<{ category: string; question: string }>
}) {
  const { category, question } = await params

  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <QnAAnswerClient category={category} question={question} />
    </Suspense>
  )
}

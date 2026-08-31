import { getAllWrongAnswers, removeWrongAnswer, upsertWrongAnswer, type WrongAnswerRow } from "@/lib/db/db";

export type { WrongAnswerRow };
export { getAllWrongAnswers, removeWrongAnswer };

/** MCQ test submit hone ke baad ek attempt ke wrong/correct answers ko bank me record karta hai. */
export async function syncWrongAnswerBank(
  topicId: string,
  questions: Array<{ id: string; question_text: string; options: string[]; correct_option: number; explanation?: string }>,
  selectedAnswers: Record<number, number>
) {
  await Promise.all(
    questions.map(async (q, idx) => {
      const id = `${topicId}::${q.id}`;
      const userAns = selectedAnswers[idx];
      if (userAns === undefined) return; // attempt hi nahi kiya — bank me na daalo na hatao
      if (userAns === q.correct_option) {
        // Ab sahi kar liya — bank se hata do agar pehle wahan tha
        await removeWrongAnswer(id).catch(() => {});
      } else {
        await upsertWrongAnswer({
          id,
          topicId,
          questionId: q.id,
          questionText: q.question_text,
          options: q.options,
          correctOption: q.correct_option,
          explanation: q.explanation,
        });
      }
    })
  );
}

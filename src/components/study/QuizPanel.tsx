import { useState, useMemo } from 'preact/hooks';
import { renderInline } from '../../utils/render';
import type { TopicData, Problem } from '../types';

interface Props {
  topics: TopicData[];
}

interface Question {
  partNum: number;
  topicTitle: string;
  examRef: string;
  answer: string;
  answerHtml: string;
  choices: string[];
  choiceHtmls: string[];
  parameters: string;
  paramsHtml: string;
}

export default function QuizPanel({ topics }: Props) {
  const [partFilter, setPartFilter] = useState('all');
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ q: number; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  const parts = useMemo(() => {
    const set = new Set(topics.map(t => t.part));
    return ['all', ...Array.from(set)];
  }, [topics]);

  const questions: Question[] = useMemo(() => {
    const filtered = partFilter === 'all'
      ? topics
      : topics.filter(t => t.part === partFilter);

    const qs: Question[] = [];
    for (const topic of filtered) {
      for (const prob of topic.problems) {
        for (const part of prob.parts) {
          if (part.answer) {
            const allAnswers = filtered.flatMap(t =>
              t.problems.flatMap(p => p.parts.map(pt => pt.answer))
            ).filter(Boolean);
            const others = allAnswers.filter(a => a !== part.answer);
            const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 4);
            const choices = [...shuffled, part.answer].sort(() => Math.random() - 0.5);

            qs.push({
              partNum: part.partNum,
              topicTitle: topic.title.replace(/\[.*?\]/g, '').trim(),
              examRef: prob.examRef,
              answer: part.answer,
              answerHtml: renderInline(part.answer),
              choices,
              choiceHtmls: choices.map(c => renderInline(c)),
              parameters: part.parameters.slice(0, 200),
              paramsHtml: renderInline(part.parameters.slice(0, 200)),
            });
          }
        }
      }
    }

    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }

    return qs.slice(0, 10);
  }, [partFilter, topics]);

  const handleAnswer = (choiceIdx: number) => {
    if (selected !== null) return;
    setSelected(choiceIdx);
    setShowResult(true);
    const isCorrect = questions[currentQ].choices[choiceIdx] === questions[currentQ].answer;
    if (isCorrect) setScore(prev => prev + 1);
    setAnswers(prev => [...prev, { q: currentQ, correct: isCorrect }]);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setFinished(false);
    setStarted(false);
  };

  if (!started && !finished) {
    return (
      <div class="qz-start">
        <h2>Configure Quiz</h2>
        <label>Part:
          <select value={partFilter} onChange={e => setPartFilter((e.target as HTMLSelectElement).value)}>
            {parts.map(p => <option value={p}>{p === 'all' ? 'All Parts' : p}</option>)}
          </select>
        </label>
        <p>{questions.length} questions available</p>
        <button class="pr-btn" onClick={() => setStarted(true)}>Start Quiz</button>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div class="qz-result">
        <h2>Quiz Complete!</h2>
        <div class="qz-score">{score} / {questions.length} ({pct}%)</div>
        <div class="qz-breakdown">
          {answers.map((a, i) => (
            <div class={`qz-item ${a.correct ? 'qz-correct' : 'qz-wrong'}`}>
              Q{i + 1}: {a.correct ? '✓' : '✗'}
            </div>
          ))}
        </div>
        <button class="pr-btn" onClick={restart}>Try Again</button>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div class="qz-root">
      <div class="qz-header">
        <span>Question {currentQ + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>
      <div class="qz-question">
        <div class="qz-meta">{q.examRef} — {q.topicTitle}</div>
        <div class="qz-params" dangerouslySetInnerHTML={{ __html: q.paramsHtml }} />
        <div class="qz-choices">
          {q.choices.map((choice, i) => {
            let cls = 'qz-choice';
            if (showResult) {
              if (choice === q.answer) cls += ' qz-correct';
              else if (i === selected) cls += ' qz-wrong';
              else cls += ' qz-dimmed';
            }
            return (
              <button class={cls} onClick={() => handleAnswer(i)} disabled={showResult}>
                <span class="qz-letter">{String.fromCharCode(65 + i)}</span>
                <span class="qz-text" dangerouslySetInnerHTML={{ __html: q.choiceHtmls[i] }} />
              </button>
            );
          })}
        </div>
        {showResult && (
          <button class="pr-btn" onClick={nextQuestion}>
            {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}

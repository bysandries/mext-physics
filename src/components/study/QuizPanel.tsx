import { useState, useMemo } from 'preact/hooks';
import { renderInline } from '../../utils/render';
import type { TopicData, QuestionBank } from '../types';

interface Props {
  topics: TopicData[];
  banks: QuestionBank[];
}

interface Question {
  id: string;
  source: string;
  topicTitle: string;
  part: string;
  questionHtml: string;
  choiceHtmls: string[];
  correctIndex: number;
  explanationHtml: string;
}

export default function QuizPanel({ topics, banks }: Props) {
  const [partFilter, setPartFilter] = useState('all');
  const [started, setStarted] = useState(false);
  const [seed, setSeed] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ q: number; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  const topicById = useMemo(() => {
    const map = new Map<string, TopicData>();
    for (const t of topics) map.set(t.id, t);
    return map;
  }, [topics]);

  const parts = useMemo(() => {
    const set = new Set(
      banks.map(b => topicById.get(b.topicId)?.part).filter(Boolean) as string[]
    );
    return ['all', ...Array.from(set)];
  }, [banks, topicById]);

  const pool: Question[] = useMemo(() => {
    const qs: Question[] = [];
    for (const bank of banks) {
      const topic = topicById.get(bank.topicId);
      if (!topic) continue;
      if (partFilter !== 'all' && topic.part !== partFilter) continue;
      for (const q of bank.questions) {
        qs.push({
          id: q.id,
          source: q.source,
          topicTitle: topic.title.replace(/\[.*?\]/g, '').trim(),
          part: topic.part,
          questionHtml: renderInline(q.question),
          choiceHtmls: q.choices.map(c => renderInline(c)),
          correctIndex: q.correctIndex,
          explanationHtml: renderInline(q.explanation),
        });
      }
    }
    return qs;
  }, [partFilter, banks, topicById]);

  const questions: Question[] = useMemo(() => {
    const qs = [...pool];
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }
    return qs.slice(0, 10);
  }, [pool, seed]);

  const handleAnswer = (choiceIdx: number) => {
    if (selected !== null) return;
    setSelected(choiceIdx);
    setShowResult(true);
    const isCorrect = choiceIdx === questions[currentQ].correctIndex;
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
    setSeed(s => s + 1);
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
        <p>{pool.length} questions available — you'll get {Math.min(10, pool.length)} at random</p>
        <button class="pr-btn" onClick={() => setStarted(true)} disabled={pool.length === 0}>Start Quiz</button>
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
        <div class="qz-meta">{q.topicTitle}{q.source !== 'original' ? ` — ${q.source}` : ''}</div>
        <div class="qz-params" dangerouslySetInnerHTML={{ __html: q.questionHtml }} />
        <div class="qz-choices">
          {q.choiceHtmls.map((choiceHtml, i) => {
            let cls = 'qz-choice';
            if (showResult) {
              if (i === q.correctIndex) cls += ' qz-correct';
              else if (i === selected) cls += ' qz-wrong';
              else cls += ' qz-dimmed';
            }
            return (
              <button class={cls} onClick={() => handleAnswer(i)} disabled={showResult}>
                <span class="qz-letter">{String.fromCharCode(97 + i)}</span>
                <span class="qz-text" dangerouslySetInnerHTML={{ __html: choiceHtml }} />
              </button>
            );
          })}
        </div>
        {showResult && (
          <div class="qz-explanation" dangerouslySetInnerHTML={{ __html: q.explanationHtml }} />
        )}
        {showResult && (
          <button class="pr-btn" onClick={nextQuestion}>
            {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}

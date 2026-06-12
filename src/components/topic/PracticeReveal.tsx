import { useState } from 'preact/hooks';
import { renderInline } from '../../utils/render';

interface PracticeQuestion {
  id: string;
  source: string;
  question: string;
  answer: string;
}

interface Props {
  questions: PracticeQuestion[];
}

export default function PracticeReveal({ questions }: Props) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const revealAll = () => setRevealed(new Set(questions.map(q => q.id)));
  const collapseAll = () => setRevealed(new Set());

  return (
    <div class="pq-root">
      <div class="pq-toolbar">
        <button class="pr-btn" onClick={revealAll}>Reveal All Answers</button>
        <button class="pr-btn" onClick={collapseAll}>Collapse All</button>
      </div>

      {questions.map((q, i) => {
        const isOpen = revealed.has(q.id);
        return (
          <div class="pq-item" key={q.id}>
            <div class="pq-header">
              <span class="pq-num">Q{i + 1}</span>
              <span class="pq-source">{q.source}</span>
            </div>
            <div
              class="pq-question"
              dangerouslySetInnerHTML={{ __html: renderInline(q.question) }}
            />
            <button
              class={`pr-btn pq-toggle ${isOpen ? '' : 'pr-btn-primary'}`}
              onClick={() => toggle(q.id)}
            >
              {isOpen ? 'Hide Answer' : 'Show Answer'}
            </button>
            {isOpen && (
              <div
                class="pq-answer"
                dangerouslySetInnerHTML={{ __html: renderInline(q.answer) }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

import { useState, useMemo } from 'preact/hooks';
import { renderInline, renderLatex } from '../../utils/render';
import type { TopicData, Formula } from '../types';

interface Props {
  topics: TopicData[];
}

interface Card {
  front: string;
  back: string;
  frontHtml: boolean;
  backHtml: boolean;
  topicNum: number;
  topicTitle: string;
}

type Difficulty = 'again' | 'hard' | 'good' | 'easy';

export default function FlashcardDeck({ topics }: Props) {
  const [partFilter, setPartFilter] = useState('all');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  const parts = useMemo(() => {
    const set = new Set(topics.map(t => t.part));
    return ['all', ...Array.from(set)];
  }, [topics]);

  const cards: Card[] = useMemo(() => {
    const filtered = partFilter === 'all'
      ? topics
      : topics.filter(t => t.part === partFilter);

    const result: Card[] = [];
    for (const topic of filtered) {
      const cleanTitle = topic.title.replace(/\[.*?\]/g, '').trim();

      // Formula cards
      for (const f of topic.formulas) {
        if (f.latex) {
          result.push({
            front: `Formula: ${f.description || topic.title}`,
            back: renderLatex(f.latex, true),
            frontHtml: false,
            backHtml: true,
            topicNum: topic.number,
            topicTitle: cleanTitle,
          });
        }
      }

      // Framework steps as cards
      for (const step of topic.framework) {
        result.push({
          front: `Framework step (Topic ${topic.number}): What comes next?`,
          back: renderInline(step),
          frontHtml: false,
          backHtml: true,
          topicNum: topic.number,
          topicTitle: cleanTitle,
        });
      }

      // Problem answers as cards (question → answer)
      for (const prob of topic.problems) {
        for (const part of prob.parts) {
          if (part.answer) {
            result.push({
              front: `${prob.examRef} Part (${part.partNum})`,
              back: renderInline(part.answer),
              frontHtml: false,
              backHtml: true,
              topicNum: topic.number,
              topicTitle: cleanTitle,
            });
          }
        }
      }
    }

    // Shuffle
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }, [partFilter, topics]);

  const currentCard = cards[currentIdx];

  const handleRate = (difficulty: Difficulty) => {
    if (currentIdx < cards.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setFlipped(false);
    } else {
      setShowSettings(true);
      setCurrentIdx(0);
      setFlipped(false);
    }
  };

  if (showSettings) {
    return (
      <div class="fc-settings">
        <h2>Start a Session</h2>
        <label>
          Part:
          <select value={partFilter} onChange={e => setPartFilter((e.target as HTMLSelectElement).value)}>
            {parts.map(p => <option value={p}>{p === 'all' ? 'All Parts' : p}</option>)}
          </select>
        </label>
        <p class="fc-card-count">{cards.length} cards generated</p>
        <button class="fc-btn fc-btn-primary" onClick={() => { setShowSettings(false); setCurrentIdx(0); setFlipped(false); }}>
          Start Session
        </button>
      </div>
    );
  }

  if (cards.length === 0) {
    return <div class="fc-empty">No cards for this selection. Try a different part.</div>;
  }

  return (
    <div class="fc-root">
      <div class="fc-progress">
        <div class="fc-progress-bar" style={`width: ${((currentIdx) / cards.length) * 100}%`} />
        <span class="fc-progress-text">{currentIdx + 1} / {cards.length}</span>
      </div>

      <div class="fc-card" onClick={() => setFlipped(!flipped)}>
        <div class="fc-card-inner">
          <div class={`fc-side ${flipped ? 'fc-back' : 'fc-front'}`}>
            {flipped ? (
              <div class="fc-back-content">
                <div class="fc-back-label">Answer</div>
                <div class="fc-back-text" dangerouslySetInnerHTML={currentCard && currentCard.backHtml ? { __html: currentCard.back } : undefined}>
                  {currentCard && !currentCard.backHtml ? currentCard.back : null}
                </div>
              </div>
            ) : (
              <div class="fc-front-content">
                <div class="fc-front-label">Question</div>
                <div class="fc-front-text" dangerouslySetInnerHTML={currentCard && currentCard.frontHtml ? { __html: currentCard.front } : undefined}>
                  {currentCard && !currentCard.frontHtml ? currentCard.front : null}
                </div>
                <div class="fc-front-meta">Topic {currentCard?.topicNum} — {currentCard?.topicTitle}</div>
              </div>
            )}
          </div>
        </div>
        <div class="fc-hint">{flipped ? 'Tap to flip back' : 'Tap to reveal answer'}</div>
      </div>

      {flipped && (
        <div class="fc-actions">
          <button class="fc-btn fc-again" onClick={() => handleRate('again')}>Again</button>
          <button class="fc-btn fc-hard" onClick={() => handleRate('hard')}>Hard</button>
          <button class="fc-btn fc-good" onClick={() => handleRate('good')}>Good</button>
          <button class="fc-btn fc-easy" onClick={() => handleRate('easy')}>Easy</button>
        </div>
      )}
    </div>
  );
}

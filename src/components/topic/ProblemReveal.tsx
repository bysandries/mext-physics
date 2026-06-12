import { useState } from 'preact/hooks';
import { renderInline } from '../../utils/render';

interface Part {
  partNum: number;
  title?: string;
  parameters: string;
  formulas: string;
  calculations: string;
  answer: string;
  conclusion: string;
}

interface Props {
  parts: Part[];
}

type RevealLevel = 'none' | 'parameters' | 'formulas' | 'calculations' | 'answer' | 'conclusion';

export default function ProblemReveal({ parts }: Props) {
  const [revealStates, setRevealStates] = useState<Record<number, RevealLevel>>({});

  const getLevel = (partNum: number): RevealLevel => revealStates[partNum] || 'none';

  const reveal = (partNum: number, level: RevealLevel) => {
    setRevealStates(prev => ({ ...prev, [partNum]: level }));
  };

  const revealAll = (level: RevealLevel) => {
    const next: Record<number, RevealLevel> = {};
    parts.forEach(p => { next[p.partNum] = level; });
    setRevealStates(next);
  };

  const revealNext = (partNum: number) => {
    const levels: RevealLevel[] = ['none', 'parameters', 'formulas', 'calculations', 'answer', 'conclusion'];
    const current = getLevel(partNum);
    const idx = levels.indexOf(current);
    if (idx < levels.length - 1) reveal(partNum, levels[idx + 1]);
  };

  const canReveal = (partNum: number, target: RevealLevel) => {
    const levels: RevealLevel[] = ['none', 'parameters', 'formulas', 'calculations', 'answer', 'conclusion'];
    return levels.indexOf(getLevel(partNum)) >= levels.indexOf(target) - 1 && levels.indexOf(getLevel(partNum)) < levels.indexOf(target);
  };

  return (
    <div class="pr-root">
      <div class="pr-toolbar">
        <button class="pr-btn" onClick={() => revealAll('parameters')}>Reveal All Parameters</button>
        <button class="pr-btn" onClick={() => revealAll('calculations')}>Reveal All Calculations</button>
        <button class="pr-btn" onClick={() => revealAll('answer')}>Reveal All Answers</button>
        <button class="pr-btn" onClick={() => setRevealStates({})}>Collapse All</button>
      </div>

      {parts.map(part => {
        const level = getLevel(part.partNum);
        return (
          <div class="pr-part" onClick={() => revealNext(part.partNum)}>
            <div class="pr-part-header">
              <span class="pr-part-num">
                Part ({part.partNum}){part.title ? ` — ${part.title}` : ''}
              </span>
              <span class="pr-part-status">
                {level === 'none' && 'Click to reveal'}
                {level === 'conclusion' && '✓ Complete'}
                {level !== 'none' && level !== 'conclusion' && 'Revealing…'}
              </span>
            </div>

            <div class="pr-content">
              {level === 'none' && <div class="pr-hidden">Click to start revealing this part</div>}

              {(level === 'parameters' || level === 'formulas' || level === 'calculations' || level === 'answer' || level === 'conclusion') && part.parameters && (
                <div class="pr-section">
                  <span class="pr-label">Parameters</span>
                  <div class="pr-text" dangerouslySetInnerHTML={{ __html: renderInline(part.parameters) }} />
                </div>
              )}

              {(level === 'formulas' || level === 'calculations' || level === 'answer' || level === 'conclusion') && part.formulas && (
                <div class="pr-section">
                  <span class="pr-label">Formulas</span>
                  <div class="pr-text" dangerouslySetInnerHTML={{ __html: renderInline(part.formulas) }} />
                </div>
              )}

              {(level === 'calculations' || level === 'answer' || level === 'conclusion') && part.calculations && (
                <div class="pr-section">
                  <span class="pr-label">Calculations</span>
                  <div class="pr-text" dangerouslySetInnerHTML={{ __html: renderInline(part.calculations) }} />
                </div>
              )}

              {(level === 'answer' || level === 'conclusion') && part.answer && (
                <div class="pr-section pr-answer">
                  <span class="pr-label">Answer</span>
                  <div class="pr-answer-text" dangerouslySetInnerHTML={{ __html: renderInline(part.answer) }} />
                </div>
              )}

              {level === 'conclusion' && part.conclusion && (
                <div class="pr-section">
                  <span class="pr-label">Conclusion</span>
                  <div class="pr-text" dangerouslySetInnerHTML={{ __html: renderInline(part.conclusion) }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

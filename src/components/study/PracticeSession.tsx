import { useState, useMemo } from 'preact/hooks';
import { renderInline } from '../../utils/render';
import type { TopicData } from '../types';

interface Props {
  topics: TopicData[];
}

type RevealLevel = 'none' | 'parameters' | 'formulas' | 'calculations' | 'answer' | 'conclusion';

export default function PracticeSession({ topics }: Props) {
  const [partFilter, setPartFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [started, setStarted] = useState(false);
  const [currentProb, setCurrentProb] = useState(0);
  const [revealStates, setRevealStates] = useState<Record<string, RevealLevel>>({});

  const parts = useMemo(() => ['all', ...new Set(topics.map(t => t.part))], [topics]);

  const availableTopics = useMemo(() => {
    const filtered = partFilter === 'all' ? topics : topics.filter(t => t.part === partFilter);
    return filtered.filter(t => t.problems.length > 0);
  }, [partFilter, topics]);

  const problems = useMemo(() => {
    const filtered = topicFilter === 'all' ? availableTopics : availableTopics.filter(t => t.id === topicFilter);
    return filtered.flatMap(t =>
      t.problems.map(p => ({ ...p, topicTitle: t.title.replace(/\[.*?\]/g, '').trim() }))
    );
  }, [availableTopics, topicFilter]);

  const current = problems[currentProb];

  const getRevealLevel = (key: string): RevealLevel => revealStates[key] || 'none';
  const setLevel = (key: string, level: RevealLevel) => setRevealStates(prev => ({ ...prev, [key]: level }));
  const reveal = (key: string) => {
    const levels: RevealLevel[] = ['none', 'parameters', 'formulas', 'calculations', 'answer', 'conclusion'];
    const current = getRevealLevel(key);
    const idx = levels.indexOf(current);
    if (idx < levels.length - 1) setLevel(key, levels[idx + 1]);
  };

  const revealAll = (level: RevealLevel) => {
    const next: Record<string, RevealLevel> = {};
    if (!current) return;
    for (const part of current.parts) {
      next[`${currentProb}-${part.partNum}`] = level;
    }
    setRevealStates(prev => ({ ...prev, ...next }));
  };

  const nextProblem = () => {
    if (currentProb < problems.length - 1) {
      setCurrentProb(prev => prev + 1);
      setRevealStates({});
    }
  };

  if (!started) {
    return (
      <div class="ps-setup">
        <h2>Practice Session Setup</h2>
        <label>Part:
          <select value={partFilter} onChange={e => setPartFilter((e.target as HTMLSelectElement).value)}>
            {parts.map(p => <option value={p}>{p === 'all' ? 'All Parts' : p}</option>)}
          </select>
        </label>
        <label>Topic:
          <select value={topicFilter} onChange={e => setTopicFilter((e.target as HTMLSelectElement).value)}>
            <option value="all">All Topics ({availableTopics.length})</option>
            {availableTopics.map(t => (
              <option value={t.id}>Topic {t.number} — {t.title.replace(/\[.*?\]/g, '').trim()}</option>
            ))}
          </select>
        </label>
        <p>{problems.length} problems available</p>
        <button class="pr-btn" onClick={() => setStarted(true)}>Start Practice</button>
      </div>
    );
  }

  if (!current) {
    return <div>No problems available. Try a different selection.</div>;
  }

  return (
    <div class="ps-root">
      <div class="ps-header">
        <span>{current.examRef} — {current.topicTitle}</span>
        <span>{currentProb + 1} / {problems.length}</span>
      </div>

      <div class="ps-toolbar">
        <button class="pr-btn" onClick={() => revealAll('parameters')}>Show All Parameters</button>
        <button class="pr-btn" onClick={() => revealAll('calculations')}>Show All Calculations</button>
        <button class="pr-btn" onClick={() => revealAll('answer')}>Show All Answers</button>
        <button class="pr-btn" onClick={() => setRevealStates({})}>Collapse All</button>
      </div>

      {current.parts.map(part => {
        const key = `${currentProb}-${part.partNum}`;
        const level = getRevealLevel(key);
        return (
          <div class="ps-part" onClick={() => reveal(key)}>
            <div class="ps-part-header">
              <span>Part ({part.partNum})</span>
              <span>{level === 'none' ? 'Click to reveal' : level === 'conclusion' ? '✓ Complete' : '…'}</span>
            </div>
            {level !== 'none' && (
              <div class="ps-content">
                {(level === 'parameters' || level === 'formulas' || level === 'calculations' || level === 'answer' || level === 'conclusion') && part.parameters && (
                  <div class="ps-section"><strong>Parameters:</strong> <span dangerouslySetInnerHTML={{ __html: renderInline(part.parameters) }} /></div>
                )}
                {(level === 'formulas' || level === 'calculations' || level === 'answer' || level === 'conclusion') && part.formulas && (
                  <div class="ps-section"><strong>Formulas:</strong> <span dangerouslySetInnerHTML={{ __html: renderInline(part.formulas) }} /></div>
                )}
                {(level === 'calculations' || level === 'answer' || level === 'conclusion') && part.calculations && (
                  <div class="ps-section"><strong>Calculations:</strong> <span dangerouslySetInnerHTML={{ __html: renderInline(part.calculations) }} /></div>
                )}
                {(level === 'answer' || level === 'conclusion') && part.answer && (
                  <div class="ps-section ps-answer"><strong>Answer:</strong> <span dangerouslySetInnerHTML={{ __html: renderInline(part.answer) }} /></div>
                )}
                {level === 'conclusion' && part.conclusion && (
                  <div class="ps-section"><strong>Conclusion:</strong> <span dangerouslySetInnerHTML={{ __html: renderInline(part.conclusion) }} /></div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {currentProb < problems.length - 1 && (
        <button class="pr-btn ps-next" onClick={nextProblem}>Next Problem →</button>
      )}
    </div>
  );
};

import { useState, useMemo } from 'preact/hooks';
import type { TopicData } from '../types';

interface Props {
  topics: TopicData[];
}

export default function SearchPage({ topics }: Props) {
  const [query, setQuery] = useState('');
  const [partFilter, setPartFilter] = useState('all');

  const parts = useMemo(() => {
    const set = new Set(topics.map(t => t.part));
    return ['all', ...Array.from(set)];
  }, [topics]);

  const results = useMemo(() => {
    let filtered = topics;
    if (partFilter !== 'all') {
      filtered = filtered.filter(t => t.part === partFilter);
    }
    if (!query.trim()) return filtered.slice(0, 20);

    const q = query.toLowerCase();
    return filtered.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.theory?.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }, [query, partFilter, topics]);

  return (
    <div class="search-root">
      <div class="search-controls">
        <input
          type="search"
          class="search-input"
          placeholder="Search topics, concepts, formulas…"
          value={query}
          onInput={e => setQuery((e.target as HTMLInputElement).value)}
          autofocus
        />
        <select
          class="search-select"
          value={partFilter}
          onChange={e => setPartFilter((e.target as HTMLSelectElement).value)}
        >
          {parts.map(p => (
            <option value={p}>{p === 'all' ? 'All Parts' : p}</option>
          ))}
        </select>
      </div>

      <div class="search-results">
        {results.length === 0 && (
          <div class="search-empty">No topics found matching "{query}"</div>
        )}
        {results.map(t => (
          <a href={`/topic/${t.id}`} class="search-result-item">
            <div class="sr-header">
              <span class="sr-part" style={`color: ${getPartColor(t.part)}`}>{t.part}</span>
              <span class="sr-number">Topic {t.number}</span>
              {t.theoryOnly && <span class="badge">theory</span>}
            </div>
            <div class="sr-title">{t.title.replace(/\[.*?\]/g, '').trim()}</div>
            {t.theory && <div class="sr-preview">{stripMath(t.theory).slice(0, 150)}…</div>}
          </a>
        ))}
      </div>
    </div>
  );
}

function getPartColor(part: string): string {
  const colors: Record<string, string> = {
    'Mechanics': '#3b82f6',
    'Thermodynamics': '#ef4444',
    'Waves & Sound': '#22c55e',
    'Electricity & Magnetism': '#f59e0b',
    'Optics': '#a855f7',
  };
  return colors[part] || '#666';
}

function stripMath(text: string): string {
  return text.replace(/\$.*?\$/g, '').replace(/\*+/g, '').trim();
}

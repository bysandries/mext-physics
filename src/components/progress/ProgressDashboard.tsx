import { useState, useEffect, useMemo } from 'preact/hooks';
import type { TopicData } from '../types';

interface Props {
  topics: TopicData[];
}

interface TopicProgress {
  status: 'new' | 'studying' | 'reviewing' | 'mastered';
  flashcardsReviewed: number;
  quizCorrect: number;
  quizAttempts: number;
  lastStudied: string | null;
}

interface ProgressData {
  topics: Record<string, TopicProgress>;
  settings: { theme: string };
}

const STORAGE_KEY = 'mext-physics-progress';

function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { topics: {}, settings: { theme: 'light' } };
  } catch { return { topics: {}, settings: { theme: 'light' } }; }
}

function getDefaultProgress(): TopicProgress {
  return { status: 'new', flashcardsReviewed: 0, quizCorrect: 0, quizAttempts: 0, lastStudied: null };
}

export default function ProgressDashboard({ topics }: Props) {
  const [progress, setProgress] = useState<ProgressData>({ topics: {}, settings: { theme: 'light' } });
  const [showImportExport, setShowImportExport] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const stats = useMemo(() => {
    const total = topics.length;
    const mastered = topics.filter(t => progress.topics[t.id]?.status === 'mastered').length;
    const studying = topics.filter(t => progress.topics[t.id]?.status === 'studying' || progress.topics[t.id]?.status === 'reviewing').length;
    const newTopics = total - mastered - studying;

    const totalQuiz = Object.values(progress.topics).reduce((s, p) => s + p.quizAttempts, 0);
    const totalCorrect = Object.values(progress.topics).reduce((s, p) => s + p.quizCorrect, 0);

    return { total, mastered, studying, newTopics, totalQuiz, totalCorrect, quizPct: totalQuiz > 0 ? Math.round((totalCorrect / totalQuiz) * 100) : 0 };
  }, [topics, progress]);

  const markTopic = (id: string, status: TopicProgress['status']) => {
    const updated = {
      ...progress,
      topics: {
        ...progress.topics,
        [id]: { ...(progress.topics[id] || getDefaultProgress()), status, lastStudied: new Date().toISOString() },
      },
    };
    setProgress(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mext-physics-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (data.topics) {
            setProgress(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
        } catch { alert('Invalid progress file'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const parts = useMemo(() => {
    const map = new Map<string, TopicData[]>();
    for (const t of topics) {
      if (!map.has(t.part)) map.set(t.part, []);
      map.get(t.part)!.push(t);
    }
    return Array.from(map.entries());
  }, [topics]);

  return (
    <div class="pd-root">
      <div class="pd-stats">
        <div class="pd-stat"><div class="pd-stat-val">{stats.total}</div><div>Topics</div></div>
        <div class="pd-stat"><div class="pd-stat-val" style="color:#22c55e">{stats.mastered}</div><div>Mastered</div></div>
        <div class="pd-stat"><div class="pd-stat-val" style="color:#f59e0b">{stats.studying}</div><div>Studying</div></div>
        <div class="pd-stat"><div class="pd-stat-val" style="color:#94a3b8">{stats.newTopics}</div><div>New</div></div>
      </div>
      <div class="pd-stats">
        <div class="pd-stat"><div class="pd-stat-val">{stats.totalQuiz}</div><div>Quiz Attempts</div></div>
        <div class="pd-stat"><div class="pd-stat-val">{stats.quizPct}%</div><div>Accuracy</div></div>
      </div>

      <div class="pd-parts">
        {parts.map(([partName, partTopics]) => {
          const partMastered = partTopics.filter(t => progress.topics[t.id]?.status === 'mastered').length;
          const pct = Math.round((partMastered / partTopics.length) * 100);
          return (
            <div class="pd-part">
              <div class="pd-part-header">{partName} ({partMastered}/{partTopics.length})</div>
              <div class="pd-bar"><div class="pd-bar-fill" style={`width: ${pct}%`} /></div>
              <div class="pd-topics">
                {partTopics.sort((a, b) => a.number - b.number).map(t => {
                  const p = progress.topics[t.id];
                  const status = p?.status || 'new';
                  return (
                    <div class={`pd-topic pd-topic-${status}`} onClick={() => {
                      const next: Record<string, TopicProgress['status']> = { new: 'studying', studying: 'reviewing', reviewing: 'mastered', mastered: 'new' };
                      markTopic(t.id, next[status]);
                    }}>
                      <span class="pd-topic-num">{t.number}</span>
                      <span class="pd-topic-title">{t.title.replace(/\[.*?\]/g, '').trim()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div class="pd-actions">
        <button class="pr-btn" onClick={() => setShowImportExport(!showImportExport)}>
          {showImportExport ? 'Hide' : 'Import/Export Progress'}
        </button>
        {showImportExport && (
          <div class="pd-io">
            <button class="pr-btn" onClick={exportData}>Export Progress</button>
            <button class="pr-btn" onClick={importData}>Import Progress</button>
            <button class="pr-btn" onClick={() => {
              if (confirm('Clear all progress data?')) {
                localStorage.removeItem(STORAGE_KEY);
                setProgress({ topics: {}, settings: { theme: 'light' } });
              }
            }} style="color:#ef4444">Clear All Data</button>
          </div>
        )}
      </div>
    </div>
  );
}

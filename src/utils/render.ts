import katex from 'katex';

function renderBlock(text: string): string {
  let result = text.replace(/\$\$(.+?)\$\$/gs, (_, expr) => {
    try { return katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false }); }
    catch (e) { console.warn('KaTeX display error:', e, expr); return `<span class="katex-error">${expr}</span>`; }
  });
  result = result.replace(/\$(.+?)\$/g, (_, expr) => {
    try { return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false }); }
    catch (e) { console.warn('KaTeX inline error:', e, expr); return `<span class="katex-error">${expr}</span>`; }
  });
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return result;
}

export function renderLatex(text: string, displayMode = false): string {
  if (!text) return '';
  try {
    return katex.renderToString(text, { displayMode, throwOnError: false });
  } catch (e) {
    console.warn('KaTeX latex error:', e, text);
    return `<code>${text}</code>`;
  }
}

export function renderInlineMath(text: string): string {
  if (!text) return '';
  let result = renderBlock(text);
  result = `<p>${result.replace(/\n\n+/g, '</p><p>')}</p>`;
  result = result.replace(/\n/g, ' ');
  result = result.replace(/<p>\s*<\/p>/g, '');
  return result;
}

export function renderInline(text: string): string {
  if (!text) return '';
  return renderBlock(text);
}

/** Turn "Topic 4" / "Topics 12–13" mentions into links to the topic pages. */
export function linkTopicRefs(html: string): string {
  if (!html) return '';
  return html.replace(/Topics?\s+\d+(?:\s*[–-]\s*\d+)?/g, (m) =>
    m.replace(/\d+/g, (n) => {
      const num = parseInt(n);
      if (num < 1 || num > 46) return n;
      return `<a href="/topic/t${String(num).padStart(2, '0')}">${n}</a>`;
    })
  );
}

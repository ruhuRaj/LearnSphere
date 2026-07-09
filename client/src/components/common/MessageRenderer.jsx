import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MessageRenderer({ content }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Process the content to render LaTeX formulas
    const processLatex = (text) => {
      // Handle display math ($$...$$ or \[...\])
      text = text.replace(/\$\$(.*?)\$\$/gs, (match, formula) => {
        try {
          const html = katex.renderToString(formula, { displayMode: true, throwOnError: true });
          return `<div class="math-display">${html}</div>`;
        } catch {
          return match;
        }
      });

      // Handle inline math ($...$ or \(...\))
      text = text.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
        try {
          const html = katex.renderToString(formula, { displayMode: false, throwOnError: true });
          return `<span class="math-inline">${html}</span>`;
        } catch {
          return match;
        }
      });

      return text;
    };

    const processedHtml = processLatex(content);

    // Parse markdown-like formatting
    let html = processedHtml
      // Headers
      .replace(/^### (.*?)$/gm, '<h3 class="font-bold text-lg mt-3 mb-2">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 class="font-bold text-xl mt-3 mb-2">$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1 class="font-bold text-2xl mt-3 mb-2">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/__([^_]+?)__/g, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/_([^_]+?)_/g, '<em class="italic">$1</em>')
      // Lists
      .replace(/^\* (.*?)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4">$2</li>')
      // Code
      .replace(/`([^`]+?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">$1</code>')
      // Line breaks for paragraphs
      .replace(/\n\n/g, '</p><p class="mb-3">');

    // Wrap in paragraph tags
    html = `<p class="mb-3">${html}</p>`;

    containerRef.current.innerHTML = html;

    // Re-render any KaTeX that might have been missed
    Array.from(containerRef.current.querySelectorAll('.math-display, .math-inline')).forEach(el => {
      if (!el.classList.contains('katex')) {
        try {
          const formula = el.textContent;
          const isDisplay = el.classList.contains('math-display');
          const html = katex.renderToString(formula, { 
            displayMode: isDisplay, 
            throwOnError: true 
          });
          el.innerHTML = html;
        } catch {
          // Keep original if rendering fails
        }
      }
    });
  }, [content]);

  return (
    <div 
      ref={containerRef}
      className="prose prose-sm max-w-none dark:prose-invert"
      style={{
        color: 'inherit',
        fontSize: 'inherit',
      }}
    />
  );
}

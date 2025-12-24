'use client';

import React from 'react';

interface LessonContentProps {
  content: string;
}

export function LessonContent({ content }: LessonContentProps) {
  // Simple Markdown-like rendering
  const renderContent = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeLanguage = '';

    lines.forEach((line, index) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.replace('```', '').trim();
          codeLines = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <pre
              key={`code-${index}`}
              className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"
            >
              <code className={`language-${codeLanguage}`}>
                {codeLines.join('\n')}
              </code>
            </pre>
          );
          codeLines = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-2xl font-bold mt-6 mb-3">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl font-bold mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      // Lists
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-6 my-1">
            {line.replace(/^[*-] /, '')}
          </li>
        );
      }
      // Inline code
      else if (line.includes('`')) {
        const parts = line.split('`');
        const formatted = parts.map((part, i) =>
          i % 2 === 1 ? (
            <code
              key={i}
              className="bg-gray-100 text-red-600 px-2 py-0.5 rounded text-sm font-mono"
            >
              {part}
            </code>
          ) : (
            part
          )
        );
        elements.push(
          <p key={index} className="my-3 leading-relaxed">
            {formatted}
          </p>
        );
      }
      // Regular paragraphs
      else if (line.trim()) {
        elements.push(
          <p key={index} className="my-3 leading-relaxed">
            {line}
          </p>
        );
      }
      // Empty lines
      else {
        elements.push(<div key={index} className="h-2" />);
      }
    });

    return elements;
  };

  return (
    <div className="prose prose-lg max-w-none">
      {renderContent(content)}
    </div>
  );
}

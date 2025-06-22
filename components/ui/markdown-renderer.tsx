'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Function to convert markdown-like text to formatted HTML
  const formatContent = (text: string): string => {
    // Remove any markdown artifacts and clean up the text
    let formatted = text
      // Remove leading/trailing whitespace
      .trim()
      // Remove markdown code block indicators
      .replace(/```[\s\S]*?```/g, (match) => {
        const code = match.slice(3, -3).trim();
        const language = code.split('\n')[0];
        const codeContent = code.split('\n').slice(1).join('\n');
        return `<pre><code>${escapeHtml(codeContent || code)}</code></pre>`;
      })
      // Handle inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Handle bold text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Handle italic text
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Handle bullet points
      .replace(/^[\s]*[-*]\s+(.+)$/gm, '<li>$1</li>')
      // Handle numbered lists
      .replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li>$1</li>')
      // Handle headings
      .replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
      .replace(/^#{2}\s+(.+)$/gm, '<h3>$1</h3>')
      .replace(/^#{1}\s+(.+)$/gm, '<h3>$1</h3>')
      // Handle line breaks
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br />');

    // Wrap list items in ul tags
    formatted = formatted.replace(/(<li>.*<\/li>)/s, (match) => {
      const items = match.match(/<li>.*?<\/li>/g) || [];
      if (items.length > 0) {
        return `<ul>${items.join('')}</ul>`;
      }
      return match;
    });

    // Wrap in paragraph tags if not already wrapped
    if (!formatted.startsWith('<') || formatted.startsWith('<li>')) {
      formatted = `<p>${formatted}</p>`;
    }

    return formatted;
  };

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string): string => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  const formattedContent = formatContent(content);

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
      style={{
        lineHeight: '1.6',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
      }}
    />
  );
}

export default MarkdownRenderer;
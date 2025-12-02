import { useMemo, type ReactNode, type ReactElement } from 'react';
import { cn } from '@/lib/utils';

interface RuleContentProps {
  content: string;
  className?: string;
}

/**
 * Simple markdown-like renderer for rule content
 * Supports: headers (##, ###), bold (**), lists (-, *), line breaks
 */
export function RuleContent({ content, className }: RuleContentProps) {
  const rendered = useMemo(() => {
    const lines = content.split('\n');
    const elements: ReactElement[] = [];
    let currentListItems: string[] = [];
    let listKey = 0;

    const flushList = () => {
      if (currentListItems.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-1 text-slate-300 mb-4 ml-2">
            {currentListItems.map((item, i) => (
              <li key={i}>{processInlineFormatting(item)}</li>
            ))}
          </ul>
        );
        currentListItems = [];
      }
    };

    const processInlineFormatting = (text: string): ReactNode[] => {
      const parts: ReactNode[] = [];
      let remaining = text;
      let keyIndex = 0;

      // Process bold text (**text**)
      while (remaining.includes('**')) {
        const startIndex = remaining.indexOf('**');
        const endIndex = remaining.indexOf('**', startIndex + 2);

        if (endIndex === -1) break;

        // Text before bold
        if (startIndex > 0) {
          parts.push(remaining.substring(0, startIndex));
        }

        // Bold text
        const boldText = remaining.substring(startIndex + 2, endIndex);
        parts.push(
          <strong key={keyIndex++} className="text-white font-semibold">
            {boldText}
          </strong>
        );

        remaining = remaining.substring(endIndex + 2);
      }

      // Add remaining text
      if (remaining) {
        parts.push(remaining);
      }

      return parts.length > 0 ? parts : [text];
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Empty line
      if (!trimmedLine) {
        flushList();
        return;
      }

      // H2 header (##)
      if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-xl font-bold text-white mt-6 mb-3 first:mt-0">
            {trimmedLine.substring(3)}
          </h2>
        );
        return;
      }

      // H3 header (###)
      if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">
            {trimmedLine.substring(4)}
          </h3>
        );
        return;
      }

      // List item (- or *)
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        currentListItems.push(trimmedLine.substring(2));
        return;
      }

      // Numbered list (1. 2. etc.)
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        currentListItems.push(numberedMatch[2]);
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={index} className="text-slate-300 mb-3 leading-relaxed">
          {processInlineFormatting(trimmedLine)}
        </p>
      );
    });

    // Flush any remaining list items
    flushList();

    return elements;
  }, [content]);

  return (
    <div className={cn('prose prose-invert max-w-none', className)}>
      {rendered}
    </div>
  );
}

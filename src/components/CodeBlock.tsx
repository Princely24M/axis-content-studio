import { useMemo } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const keywords = new Set([
  'import', 'export', 'from', 'default', 'const', 'let', 'var', 'function', 'return',
  'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'class',
  'extends', 'new', 'this', 'super', 'try', 'catch', 'finally', 'throw', 'typeof',
  'instanceof', 'in', 'of', 'async', 'await', 'yield', 'delete', 'void', 'null',
  'undefined', 'true', 'false', 'interface', 'type', 'enum', 'public', 'private',
  'protected', 'readonly', 'static', 'get', 'set', 'namespace', 'using', 'def',
  'self', 'None', 'True', 'False', 'and', 'or', 'not', 'with', 'as', 'lambda',
  'CREATE', 'TABLE', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE',
  'INTO', 'VALUES', 'SET', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'NOT',
  'NULL', 'DEFAULT', 'INDEX', 'ON', 'AND', 'OR', 'ORDER', 'BY', 'GROUP', 'HAVING',
  'package', 'func', 'go', 'defer', 'chan', 'struct', 'map', 'range', 'fallthrough',
  'data', 'instanceof', 'implements', 'throws', 'abstract', 'final', 'synchronized',
  'volatile', 'transient', 'native', 'strictfp', 'assert', 'val', 'var', 'when',
  'object', 'companion', 'init', 'by', 'is', 'as', 'in', 'out', 'reified',
]);

export function CodeBlock({ code, language = 'javascript' }: CodeBlockProps) {
  const highlighted = useMemo(() => highlightCode(code), [code]);

  return (
    <pre className="code-block overflow-x-auto p-4 rounded-xl bg-ink-950 text-ink-100 text-sm leading-relaxed">
      <code dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  );
}

function highlightCode(code: string): string {
  // Escape HTML
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments (single line)
  html = html.replace(/(\/\/[^\n]*)/g, '<span class="token-comment">$1</span>');
  // Comments (multi-line and # for python/sql)
  html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="token-comment">$1</span>');
  html = html.replace(/(^|\n)(#[^\n]*)/g, '$1<span class="token-comment">$2</span>');
  // Strings (double and single quoted)
  html = html.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="token-string">$1</span>');
  // Numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="token-number">$1</span>');
  // Keywords
  html = html.replace(/\b([a-zA-Z_]+)\b/g, (match, word) => {
    if (keywords.has(word)) {
      return `<span class="token-keyword">${word}</span>`;
    }
    // Function calls
    if (/^[A-Z]/.test(word)) {
      return `<span class="token-function">${word}</span>`;
    }
    return match;
  });

  return html;
}

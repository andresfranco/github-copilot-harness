import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
  content: string
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-6 text-xl font-bold text-gray-900 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-5 text-base font-semibold text-gray-800 first:mt-0 flex items-center gap-2">
      <span className="inline-block h-0.5 w-4 rounded bg-blue-500" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-4 text-sm font-semibold text-gray-700">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 text-sm leading-relaxed text-gray-700">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 space-y-1.5 pl-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-sm text-gray-700">
      <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  code: ({ children, className }) => {
    const lang = className?.replace('language-', '') ?? ''
    const isBlock = !!className?.startsWith('language-')
    if (isBlock) {
      return (
        <div className="my-4 overflow-hidden rounded-lg border border-[#3c3c3c] shadow-lg">
          <div className="flex items-center justify-between border-b border-[#3c3c3c] bg-[#1e1e1e] px-4 py-2">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-[#858585]">
                {lang || 'code'}
              </span>
            </div>
          <SyntaxHighlighter
            language={lang || 'text'}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              padding: '1.25rem',
              fontSize: '0.8125rem',
              lineHeight: '1.6',
              background: '#1e1e1e',
            }}
            showLineNumbers={lang === 'python' || lang === 'bash' || lang === 'sh'}
            lineNumberStyle={{ color: '#858585', minWidth: '2.5em' }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      )
    }
    return (
      <code className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs text-blue-700 ring-1 ring-blue-200">
        {children}
      </code>
    )
  },
  pre: ({ children }) => <>{children}</>,
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-600">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-blue-400 bg-blue-50 py-2 pl-4 pr-3 text-sm text-blue-900">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-gray-200" />,
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-custom">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

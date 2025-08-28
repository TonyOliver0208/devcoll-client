"use client";

import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';

// Configure lowlight for code highlighting (same as editor)
const lowlight = createLowlight();
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);
lowlight.register('css', css);
lowlight.register('html', html);

interface TiptapContentRendererProps {
  content: any; // Tiptap JSON object
  className?: string;
}

const TiptapContentRenderer = ({ content, className = "" }: TiptapContentRendererProps) => {
  if (!content || !content.content) {
    return null;
  }

  try {
    // Use Tiptap's official HTML generator with the same extensions as editor
    const html = generateHTML(content, [
      StarterKit.configure({
        codeBlock: false, // We'll use the lowlight version
      }),
      Link.configure({
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg bg-gray-50 border border-gray-200 p-4 my-3 font-mono text-sm overflow-x-auto',
        },
      }),
    ]);

    return (
      <>
        <div 
          className={`tiptap-content prose prose-sm max-w-none ${className}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <style jsx>{`
          .tiptap-content {
            line-height: 1.6;
          }
          
          .tiptap-content p {
            margin-bottom: 1rem;
            line-height: 1.6;
          }
          
          .tiptap-content strong {
            font-weight: 700;
          }
          
          .tiptap-content em {
            font-style: italic;
          }
          
          .tiptap-content code {
            background-color: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 0.25rem;
            padding: 0.125rem 0.375rem;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
            color: #1e293b;
          }
          
          .tiptap-content pre {
            margin: 1rem 0;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1rem;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
            line-height: 1.5;
          }
          
          .tiptap-content pre code {
            background: none;
            border: none;
            padding: 0;
            color: inherit;
          }
          
          .tiptap-content ul, .tiptap-content ol {
            margin: 1rem 0;
            padding-left: 2rem;
          }
          
          .tiptap-content ul {
            list-style-type: disc;
          }
          
          .tiptap-content ol {
            list-style-type: decimal;
          }
          
          .tiptap-content li {
            margin: 0.25rem 0;
            display: list-item;
          }
          
          .tiptap-content blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: #6b7280;
            background-color: #f9fafb;
            padding: 0.75rem 1rem;
            border-radius: 0.25rem;
          }
          
          .tiptap-content h1, .tiptap-content h2, .tiptap-content h3, 
          .tiptap-content h4, .tiptap-content h5, .tiptap-content h6 {
            font-weight: 700;
            line-height: 1.2;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
          }
          
          .tiptap-content h1 {
            font-size: 2rem;
          }
          
          .tiptap-content h2 {
            font-size: 1.5rem;
          }
          
          .tiptap-content h3 {
            font-size: 1.25rem;
          }
        `}</style>
      </>
    );
  } catch (error) {
    console.error('Error rendering Tiptap content:', error);
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Error rendering content
      </div>
    );
  }
};

export default TiptapContentRenderer;

"use client";

import { ReactNode } from 'react';

interface TiptapContentRendererProps {
  content: any; // Tiptap JSON object
  className?: string;
}

const TiptapContentRenderer = ({ content, className = "" }: TiptapContentRendererProps) => {
  if (!content || !content.content) {
    return null;
  }

  const renderNode = (node: any, key: number): ReactNode => {
    if (!node) return null;

    switch (node.type) {
      case 'paragraph':
        // Render paragraph children
        const paragraphChildren = node.content ? node.content : [];
        const renderedParagraphChildren = paragraphChildren
          .map((child: any, i: number) => renderNode(child, i));

        // Don't render empty paragraphs
        if (renderedParagraphChildren.length === 0 || 
            (renderedParagraphChildren.length === 1 && !renderedParagraphChildren[0])) {
          return null;
        }

        return (
          <p key={key} className="mb-4 leading-6">
            {renderedParagraphChildren}
          </p>
        );

      case 'text':
        // Don't filter brackets here - let the paragraph filter handle it contextually
        let textElement: ReactNode = node.text || '';
        
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            switch (mark.type) {
              case 'bold':
                textElement = <strong key={`bold-${key}`}>{textElement}</strong>;
                break;
              case 'italic':
                textElement = <em key={`italic-${key}`}>{textElement}</em>;
                break;
              case 'code':
                textElement = (
                  <code 
                    key={`code-${key}`}
                    className="bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 text-sm font-mono"
                  >
                    {textElement}
                  </code>
                );
                break;
              case 'link':
                textElement = (
                  <a 
                    key={`link-${key}`}
                    href={mark.attrs?.href || '#'}
                    className="text-blue-600 underline hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {textElement}
                  </a>
                );
                break;
            }
          });
        }
        
        return textElement;

      case 'heading':
        const level = node.attrs?.level || 1;
        const HeadingComponent = ({ children, ...props }: any) => {
          const baseClasses = "font-bold mb-3 mt-6";
          const levelClasses = {
            1: "text-2xl",
            2: "text-xl", 
            3: "text-lg",
            4: "text-base",
            5: "text-sm",
            6: "text-sm"
          };
          const className = `${baseClasses} ${levelClasses[level as keyof typeof levelClasses] || levelClasses[1]}`;
          
          switch (level) {
            case 1: return <h1 {...props} className={className}>{children}</h1>;
            case 2: return <h2 {...props} className={className}>{children}</h2>;
            case 3: return <h3 {...props} className={className}>{children}</h3>;
            case 4: return <h4 {...props} className={className}>{children}</h4>;
            case 5: return <h5 {...props} className={className}>{children}</h5>;
            case 6: return <h6 {...props} className={className}>{children}</h6>;
            default: return <h1 {...props} className={className}>{children}</h1>;
          }
        };
        
        return (
          <HeadingComponent key={key}>
            {node.content ? node.content.map((child: any, i: number) => renderNode(child, i)) : null}
          </HeadingComponent>
        );

      case 'codeBlock':
        const language = node.attrs?.language || '';
        return (
          <div key={key} className="my-4">
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
              {language && (
                <div className="text-xs text-gray-500 mb-2 uppercase font-semibold">
                  {language}
                </div>
              )}
              <code className="font-mono text-sm leading-relaxed">
                {node.content ? node.content.map((child: any) => child.text || '').join('') : ''}
              </code>
            </pre>
          </div>
        );

      case 'blockquote':
        return (
          <blockquote key={key} className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700 bg-gray-50 py-2 rounded-r">
            {node.content ? node.content.map((child: any, i: number) => renderNode(child, i)) : null}
          </blockquote>
        );

      case 'bulletList':
        return (
          <ul key={key} className="list-disc pl-6 my-4 space-y-1">
            {node.content ? node.content.map((child: any, i: number) => renderNode(child, i)) : null}
          </ul>
        );

      case 'orderedList':
        return (
          <ol key={key} className="list-decimal pl-6 my-4 space-y-1">
            {node.content ? node.content.map((child: any, i: number) => renderNode(child, i)) : null}
          </ol>
        );

      case 'listItem':
        return (
          <li key={key} className="leading-6">
            {node.content ? node.content.map((child: any, i: number) => renderNode(child, i)) : null}
          </li>
        );

      case 'hardBreak':
        return <br key={key} />;

      case 'image':
        // Tiptap image node
        const { src, alt, title } = node.attrs || {};
        return (
          <div key={key} className="my-4">
            <img
              src={src}
              alt={alt || title || ''}
              title={title || undefined}
              className="max-w-full h-auto border border-gray-200 rounded"
            />
          </div>
        );

      default:
        // For unknown node types, try to render children
        if (node.content) {
          return (
            <div key={key}>
              {node.content.map((child: any, i: number) => renderNode(child, i))}
            </div>
          );
        }
        return null;
    }
  };

  try {
    return (
      <div className={`tiptap-content prose prose-sm max-w-none ${className}`}>
        {content.content.map((node: any, i: number) => renderNode(node, i))}
      </div>
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

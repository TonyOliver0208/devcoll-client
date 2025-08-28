"use client";

import TiptapContentRenderer from './TiptapContentRenderer';

interface ContentDisplayProps {
  content?: string;
  contentJson?: any; // Tiptap JSON format
  className?: string;
}

const ContentDisplay = ({ content, contentJson, className = "" }: ContentDisplayProps) => {
  // If we have Tiptap JSON, use the new renderer
  if (contentJson) {
    return <TiptapContentRenderer content={contentJson} className={className} />;
  }
  
  // Fallback to legacy markdown renderer for backwards compatibility
  if (!content) return null;
  const renderMarkdown = (text: string) => {
    // Split content by code blocks first
    const parts = text.split(/(```[\s\S]*?```)/);
    
    return parts.map((part, index) => {
      // Handle code blocks
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.slice(3, -3);
        const [language, ...codeParts] = codeContent.split('\n');
        const code = codeParts.join('\n');
        
        return (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded p-4 my-4 font-mono text-sm overflow-x-auto">
            {language && language.trim() && (
              <div className="text-xs text-gray-500 mb-2 uppercase">{language.trim()}</div>
            )}
            <pre className="whitespace-pre-wrap break-words sm:whitespace-pre">
              {code || language}
            </pre>
          </div>
        );
      }
      
      // Handle regular text with inline formatting
      return (
        <div key={index} className="mb-4">
          {part.split('\n').map((line, lineIndex) => {
            if (!line.trim()) return <br key={lineIndex} />;
            
            // Process inline formatting
            let processedLine = line;
            const elements: React.ReactNode[] = [];
            let lastIndex = 0;
            
            // Match inline code first (highest priority)
            const inlineCodeRegex = /`([^`]+)`/g;
            let match;
            
            while ((match = inlineCodeRegex.exec(processedLine)) !== null) {
              // Add text before the match
              if (match.index > lastIndex) {
                elements.push(processedLine.slice(lastIndex, match.index));
              }
              
              // Add the inline code
              elements.push(
                <code key={`code-${lineIndex}-${match.index}`} className="bg-gray-100 px-1 py-0.5 rounded text-sm break-words">
                  {match[1]}
                </code>
              );
              
              lastIndex = match.index + match[0].length;
            }
            
            // Add remaining text
            if (lastIndex < processedLine.length) {
              elements.push(processedLine.slice(lastIndex));
            }
            
            // If no inline code was found, process other formatting
            if (elements.length === 0) {
              // Handle bold text
              if (line.includes('**')) {
                const boldParts = line.split(/(\*\*[^*]+\*\*)/);
                elements.push(
                  ...boldParts.map((boldPart, boldIndex) => {
                    if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                      return <strong key={`bold-${lineIndex}-${boldIndex}`}>{boldPart.slice(2, -2)}</strong>;
                    }
                    return boldPart;
                  })
                );
              }
              // Handle italic text
              else if (line.includes('*')) {
                const italicParts = line.split(/(\*[^*]+\*)/);
                elements.push(
                  ...italicParts.map((italicPart, italicIndex) => {
                    if (italicPart.startsWith('*') && italicPart.endsWith('*')) {
                      return <em key={`italic-${lineIndex}-${italicIndex}`}>{italicPart.slice(1, -1)}</em>;
                    }
                    return italicPart;
                  })
                );
              }
              // Handle links
              else if (line.includes('[') && line.includes('](')) {
                const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                let linkProcessed = line;
                const linkElements: React.ReactNode[] = [];
                let linkLastIndex = 0;
                let linkMatch;
                
                while ((linkMatch = linkRegex.exec(line)) !== null) {
                  // Add text before the link
                  if (linkMatch.index > linkLastIndex) {
                    linkElements.push(line.slice(linkLastIndex, linkMatch.index));
                  }
                  
                  // Add the link
                  linkElements.push(
                    <a 
                      key={`link-${lineIndex}-${linkMatch.index}`}
                      href={linkMatch[2]} 
                      className="text-blue-600 hover:text-blue-800 underline" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {linkMatch[1]}
                    </a>
                  );
                  
                  linkLastIndex = linkMatch.index + linkMatch[0].length;
                }
                
                // Add remaining text
                if (linkLastIndex < line.length) {
                  linkElements.push(line.slice(linkLastIndex));
                }
                
                if (linkElements.length > 0) {
                  elements.push(...linkElements);
                }
              }
              // Handle blockquotes
              else if (line.startsWith('> ')) {
                elements.push(
                  <blockquote key={`quote-${lineIndex}`} className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-2">
                    {line.slice(2)}
                  </blockquote>
                );
              }
              // Handle lists
              else if (line.match(/^[\s]*[-*+]\s/)) {
                const listItem = line.replace(/^[\s]*[-*+]\s/, '');
                elements.push(
                  <div key={`list-${lineIndex}`} className="flex items-start my-1">
                    <span className="mr-2">•</span>
                    <span>{listItem}</span>
                  </div>
                );
              }
              // Handle ordered lists
              else if (line.match(/^[\s]*\d+\.\s/)) {
                const listItem = line.replace(/^[\s]*\d+\.\s/, '');
                const number = line.match(/^[\s]*(\d+)\./)?.[1];
                elements.push(
                  <div key={`ordered-list-${lineIndex}`} className="flex items-start my-1">
                    <span className="mr-2">{number}.</span>
                    <span>{listItem}</span>
                  </div>
                );
              }
              // Handle images
              else if (line.includes('![') && line.includes('](')) {
                const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
                let imageMatch;
                
                while ((imageMatch = imageRegex.exec(line)) !== null) {
                  elements.push(
                    <img 
                      key={`image-${lineIndex}-${imageMatch.index}`}
                      src={imageMatch[2]} 
                      alt={imageMatch[1]} 
                      className="max-w-full h-auto my-4 border border-gray-200 rounded" 
                    />
                  );
                }
              }
              // Handle headers
              else if (line.startsWith('#')) {
                const headerLevel = Math.min(line.match(/^#+/)?.[0].length || 1, 6);
                const headerText = line.replace(/^#+\s*/, '');
                
                const headerClasses = {
                  1: "text-2xl font-bold mt-6 mb-4",
                  2: "text-xl font-bold mt-5 mb-3",
                  3: "text-lg font-bold mt-4 mb-2",
                  4: "text-base font-bold mt-3 mb-2",
                  5: "text-sm font-bold mt-2 mb-1",
                  6: "text-sm font-bold mt-2 mb-1"
                };
                
                const HeaderElement = ({ children, className }: { children: React.ReactNode; className: string }) => {
                  switch (headerLevel) {
                    case 1: return <h1 className={className}>{children}</h1>;
                    case 2: return <h2 className={className}>{children}</h2>;
                    case 3: return <h3 className={className}>{children}</h3>;
                    case 4: return <h4 className={className}>{children}</h4>;
                    case 5: return <h5 className={className}>{children}</h5>;
                    case 6: return <h6 className={className}>{children}</h6>;
                    default: return <h1 className={className}>{children}</h1>;
                  }
                };
                
                elements.push(
                  <HeaderElement key={`header-${lineIndex}`} className={headerClasses[headerLevel as keyof typeof headerClasses]}>
                    {headerText}
                  </HeaderElement>
                );
              }
              // Plain text
              else {
                elements.push(line);
              }
            }
            
            return (
              <p key={lineIndex} className="mb-2 leading-6">
                {elements.length > 0 ? elements : line}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className={`prose max-w-none ${className}`}>
      <div className="text-gray-800 leading-6 sm:leading-7 text-sm sm:text-base">
        {renderMarkdown(content)}
      </div>
    </div>
  );
};

export default ContentDisplay;

// BlogContentParser.jsx - Simplified and more robust parser
import React from 'react';

const BlogContentParser = ({ content, isAiGenerated = false }) => {
  
  if (!content) return null;

  // For non-AI generated content, simple formatting
  if (!isAiGenerated) {
    return (
      <div className="space-y-4">
        {content.split('\n').filter(p => p.trim()).map((paragraph, index) => (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {paragraph.trim()}
          </p>
        ))}
      </div>
    );
  }

  // For AI-generated content with HTML tags
  const processContent = () => {
    let processedContent = content
      .replace(/\\n/g, '\n') // Convert \n to actual line breaks
      .trim();

    // Split into lines and process each
    const lines = processedContent.split('\n').filter(line => line.trim());
    const elements = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) return;

      // Handle H1 tags
      if (trimmedLine.match(/<h1>.*?<\/h1>/)) {
        const text = trimmedLine.replace(/<\/?h1>/g, '');
        elements.push(
          <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">
            {text}
          </h1>
        );
        return;
      }

      // Handle H2 tags
      if (trimmedLine.match(/<h2>.*?<\/h2>/)) {
        const text = trimmedLine.replace(/<\/?h2>/g, '');
        elements.push(
          <h2 key={index} className="text-2xl font-semibold text-gray-900 mb-4 mt-7">
            {text}
          </h2>
        );
        return;
      }

      // Handle H3 tags
      if (trimmedLine.match(/<h3>.*?<\/h3>/)) {
        const text = trimmedLine.replace(/<\/?h3>/g, '');
        elements.push(
          <h3 key={index} className="text-xl font-semibold text-gray-900 mb-3 mt-6">
            {text}
          </h3>
        );
        return;
      }

      // Handle H4 tags
      if (trimmedLine.match(/<h4>.*?<\/h4>/)) {
        const text = trimmedLine.replace(/<\/?h4>/g, '');
        elements.push(
          <h4 key={index} className="text-lg font-semibold text-gray-900 mb-3 mt-5">
            {text}
          </h4>
        );
        return;
      }

      // Handle bullet points starting with *
      if (trimmedLine.match(/^\s*\*\s+\*\*.*?\*\*/)) {
        const text = trimmedLine.replace(/^\s*\*\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        elements.push(
          <div key={index} className="mb-4">
            <p className="text-gray-700 leading-relaxed flex">
              <span className="mr-3 text-gray-500">•</span>
              <span dangerouslySetInnerHTML={{ __html: text }} />
            </p>
          </div>
        );
        return;
      }

      // Handle numbered lists
      if (trimmedLine.match(/^\d+\./)) {
        const text = trimmedLine.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        elements.push(
          <div key={index} className="mb-4">
            <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
          </div>
        );
        return;
      }

      // Handle medical disclaimer
      if (trimmedLine.toLowerCase().includes('medical disclaimer') || 
          trimmedLine.toLowerCase().includes('disclaimer') ||
          trimmedLine.toLowerCase().includes('important:')) {
        const text = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        elements.push(
          <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
          </div>
        );
        return;
      }

      // Regular paragraphs
      const text = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
      elements.push(
        <p key={index} className="text-gray-700 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
      );
    });

    return elements;
  };

  return (
    <div className="prose prose-lg max-w-none">
      {processContent()}
    </div>
  );
};

export default BlogContentParser;
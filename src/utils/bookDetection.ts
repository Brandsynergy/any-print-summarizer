// Helper functions for book cover detection and information extraction

export interface BookCoverDetection {
  isBookCover: boolean;
  title?: string;
  author?: string;
  confidence: number;
  extractedLines: string[];
}

export function detectBookCover(text: string): BookCoverDetection {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Look for common book cover patterns
  const bookIndicators = [
    /\b(novel|story|tales?|memoir|biography|autobiography)\b/i,
    /\b(bestseller|award.?winning|new york times)\b/i,
    /\b(fiction|non.?fiction|mystery|romance|thriller|fantasy|sci-fi|science fiction)\b/i,
    /\b(author|writer|by)\s+[A-Za-z\s]+/i,
    /\b(book|volume|edition|published|publisher|press)\b/i,
    /\b(isbn|copyright|©)\b/i,
    /\b(chapter|page)\b/i,
    /\$(\d+\.)?\d+/,  // Price indicator
    /\d{10,13}/  // ISBN-like numbers
  ];

  // Look for typical book cover text patterns
  const authorPatterns = [
    /^by\s+(.+)$/i,
    /^(.+)\s+(author|writer)$/i,
    /^\s*([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$/,
  ];

  let confidence = 0;
  let detectedTitle = '';
  let detectedAuthor = '';

  // Check for book indicators
  const textToCheck = text.toLowerCase();
  bookIndicators.forEach(pattern => {
    if (pattern.test(textToCheck)) {
      confidence += 0.15;
    }
  });

  // Analyze line structure for title/author patterns
  const significantLines = lines.filter(line => 
    line.length > 3 && 
    line.length < 100 && 
    !/^\d+$/.test(line) && // Not just numbers
    !/^[^a-zA-Z]*$/.test(line) // Contains letters
  );

  // Look for title (usually the longest or most prominent line)
  if (significantLines.length > 0) {
    // Sort by length and prominence
    const titleCandidates = significantLines
      .filter(line => line.length > 5)
      .sort((a, b) => {
        // Prefer lines that are all caps or title case
        const aScore = (/^[A-Z\s]+$/.test(a) ? 2 : 0) + (/^[A-Z][a-z\s]*$/.test(a) ? 1 : 0);
        const bScore = (/^[A-Z\s]+$/.test(b) ? 2 : 0) + (/^[A-Z][a-z\s]*$/.test(b) ? 1 : 0);
        
        if (aScore !== bScore) return bScore - aScore;
        return b.length - a.length;
      });

    if (titleCandidates.length > 0) {
      detectedTitle = titleCandidates[0];
      confidence += 0.2;
    }
  }

  // Look for author patterns
  for (const line of significantLines) {
    for (const pattern of authorPatterns) {
      const match = line.match(pattern);
      if (match) {
        detectedAuthor = match[1] || match[0];
        confidence += 0.25;
        break;
      }
    }
    
    // Also check if line looks like an author name (First Last format)
    if (!detectedAuthor && /^[A-Z][a-z]+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?$/.test(line.trim())) {
      detectedAuthor = line.trim();
      confidence += 0.15;
    }
  }

  // Boost confidence if we have both title and author
  if (detectedTitle && detectedAuthor) {
    confidence += 0.2;
  }

  // Check text structure (book covers usually have short, centered text)
  if (significantLines.length >= 2 && significantLines.length <= 8) {
    confidence += 0.1;
  }

  // Final confidence adjustment
  confidence = Math.min(confidence, 1.0);

  // Lower threshold for better detection
  const isBookCover = confidence > 0.2; // Lowered threshold for book detection

  return {
    isBookCover,
    title: detectedTitle || undefined,
    author: detectedAuthor || undefined,
    confidence,
    extractedLines: significantLines
  };
}

export function cleanBookTitle(title: string): string {
  return title
    .replace(/^["']|["']$/g, '') // Remove quotes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

export function cleanAuthorName(author: string): string {
  return author
    .replace(/^(by\s+|author:?\s*)/i, '') // Remove "by" prefix
    .replace(/\s+(author|writer)$/i, '') // Remove "author" suffix
    .replace(/[^\w\s.-]/g, '') // Remove special characters except dots and hyphens
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
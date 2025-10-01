import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, author } = await request.json();

    if (!title) {
      return NextResponse.json({ 
        success: false, 
        error: 'Book title is required' 
      }, { status: 400 });
    }

    // Construct search query
    let searchQuery = `intitle:"${title}"`;
    if (author) {
      searchQuery += ` inauthor:"${author}"`;
    }

    console.log('Searching for book:', { title, author, searchQuery });

    // Search Google Books API
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5&orderBy=relevance`;
    
    const response = await fetch(googleBooksUrl);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      // Try a broader search with just the title
      const fallbackUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=5&orderBy=relevance`;
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      
      if (!fallbackData.items || fallbackData.items.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Book not found in Google Books database'
        }, { status: 404 });
      }
      
      data.items = fallbackData.items;
    }

    // Process the first (most relevant) book result
    const book = data.items[0];
    const volumeInfo = book.volumeInfo;

    // Get detailed information
    const bookInfo = {
      id: book.id,
      title: volumeInfo.title || 'Unknown Title',
      authors: volumeInfo.authors || ['Unknown Author'],
      publishedDate: volumeInfo.publishedDate || 'Unknown',
      publisher: volumeInfo.publisher || 'Unknown Publisher',
      description: volumeInfo.description || 'No description available',
      pageCount: volumeInfo.pageCount || 'Unknown',
      categories: volumeInfo.categories || ['General'],
      averageRating: volumeInfo.averageRating || null,
      ratingsCount: volumeInfo.ratingsCount || null,
      thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || null,
      previewLink: volumeInfo.previewLink || null,
      infoLink: volumeInfo.infoLink || null,
      language: volumeInfo.language || 'en'
    };

    // Try to get additional content if available
    let additionalContent = '';
    if (book.searchInfo?.textSnippet) {
      additionalContent += book.searchInfo.textSnippet + '\n\n';
    }

    console.log('Found book:', bookInfo.title, 'by', bookInfo.authors.join(', '));

    return NextResponse.json({
      success: true,
      book: bookInfo,
      additionalContent,
      searchQuery
    });

  } catch (error: any) {
    console.error('Book search error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to search for book: ${error.message}` 
    }, { status: 500 });
  }
}
import React, { useState } from 'react';
import './App.css';

const API_URL = 'https://www.googleapis.com/books/v1/volumes';
const LOADING_GIF = require('./KOOB.gif');

const App = () => {
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchGenre, setSearchGenre] = useState('');
  const [books, setBooks] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBooks = async () => {
    setIsLoading(true);

    try {
      const titleQuery = searchTitle ? `intitle:${searchTitle}` : '';
      const authorQuery = searchAuthor ? `inauthor:${searchAuthor}` : '';
      const genreQuery = searchGenre ? `subject:${searchGenre}` : '';
      const query = `?q=${titleQuery}+${authorQuery}+${genreQuery}&maxResults=40`;

      const response = await fetch(`${API_URL}${query}`);
      const data = await response.json();
      const fetchedBooks = data.items.map((item) => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ['Unknown Author'],
        genres: item.volumeInfo.categories || ['Unknown Genre'],
      }));

      let filteredBooks = fetchedBooks;

      if (searchTitle) {
        const uniqueTitles = new Set();
        filteredBooks = filteredBooks.filter((book) => {
          const title = book.title.toLowerCase();
          if (uniqueTitles.has(title)) {
            return false;
          }
          uniqueTitles.add(title);
          return true;
        });
      }

      if (searchAuthor) {
        filteredBooks = fetchedBooks.filter((book) => {
          return book.authors.some(
            (author) => author.toLowerCase() === searchAuthor.toLowerCase()
          );
        });
      }

      if (searchGenre) {
        filteredBooks = filteredBooks.filter((book) => {
          return book.genres.some(
            (genre) => genre.toLowerCase().includes(searchGenre.toLowerCase())
          );
        });
      }

      setBooks(filteredBooks);

      
      setTimeout(() => {
        setShowResults(true);
        setIsLoading(false);
      }, 6000);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
      setShowResults(true);
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setShowResults(false);
    await fetchBooks();
  };

  const handleBack = () => {
    setShowResults(false);
    setSearchTitle('');
    setSearchAuthor('');
    setSearchGenre('');
  };

  return (
    <div className="App">
      <div className={showResults ? 'second-screen' : 'first-screen'}>
        {showResults ? (
          <h1 className="fancy-title">Search results</h1>
        ) : (
          <h1 className="fancy-title App-logo">The Super Avarage and Improvised Book Search Engine</h1>
        )}
        {isLoading && (
          <div className="loading-overlay">
            <img src={LOADING_GIF} alt="Loading" className="loading-gif" />
          </div>
        )}
        {!showResults && !isLoading && (
          <div className="fancy-search-bar">
            <input
              type="text"
              placeholder="Search Title"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Search Author"
              value={searchAuthor}
              onChange={(e) => setSearchAuthor(e.target.value)}
            />
            <input
              type="text"
              placeholder="Search Genre"
              value={searchGenre}
              onChange={(e) => setSearchGenre(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        )}
        {showResults && (
          <div className="book-list">
            <button className="back-button" onClick={handleBack}>
              Back
            </button>
            {books.length === 0 && (searchTitle || searchAuthor || searchGenre) && (
              <p className="no-results bigger-text">No books found.</p>
            )}
            {books.length > 0 && (
              <div className="books">
                {books.map((book) => (
                  <div className="book-item" key={book.id}>
                    <h3>{book.title}</h3>
                    <p>Authors: {book.authors.join(', ')}</p>
                    <p>Genres: {book.genres.join(', ')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

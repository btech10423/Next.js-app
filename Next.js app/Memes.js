import  { useState, useEffect, useRef } from 'react';
import './Memes.css';
import { PhotoSwipe } from 'react-photoswipe-2';
import 'react-photoswipe-2/lib/photoswipe.css';

const Memes = () => {
  const [memes, setMemes] = useState([]);
  const [after, setAfter] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const [photoSwipeOpen, setPhotoSwipeOpen] = useState(false);
  const [photoSwipeIndex, setPhotoSwipeIndex] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`https://www.reddit.com/r/memes.json${after ? `?after=${after}` : ''}`);
      const data = await response.json();

      const newMemes = data.data.children.map(child => ({
        title: child.data.title,
        imageUrl: child.data.url,
      }));

      setMemes(prevMemes => [...prevMemes, ...newMemes]);
      setAfter(data.data.after);
    } catch (error) {
      console.error('Error fetching data from Reddit API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (container && container.scrollHeight - container.scrollTop === container.clientHeight && !loading) {
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [after]);

  const openPhotoSwipe = (index) => {
    setPhotoSwipeIndex(index);
    setPhotoSwipeOpen(true);
  };

  const closePhotoSwipe = () => {
    setPhotoSwipeOpen(false);
  };

  return (
    <div className="reddit-container">
      <header className="reddit-header">
        <nav className="navbar">
          <a href="/" className="navbar-link">Home</a>
          <a href="/user" className="navbar-link">User</a>
        </nav>
        <h1 className="reddit-title">Reddit Memes</h1>
      </header>
      <div className="reddit-content" ref={containerRef}>
        <div className="memes-container">
          {memes.map((meme, index) => (
            <div
              key={index}
              className="meme-item"
              onClick={() => openPhotoSwipe(index)}
            >
              <h2 className="meme-title">{meme.title}</h2>
              <img src={meme.imageUrl} alt={meme.title} className="meme-image" />
            </div>
          ))}
        </div>
      </div>

      {photoSwipeOpen && (
        <PhotoSwipe
          isOpen={photoSwipeOpen}
          items={memes.map(meme => ({ src: meme.imageUrl, w: 0, h: 0 }))}
          options={{ index: photoSwipeIndex }}
          onClose={closePhotoSwipe}
        />
      )}
    </div>
  );
};

export default Memes;
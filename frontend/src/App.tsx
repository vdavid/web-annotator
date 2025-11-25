import { useEffect, useState } from 'react';
import { Popup } from './components/Popup';
import { isArticleURL } from './utils/articleDetector';

function App() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isArticle, setIsArticle] = useState<boolean | null>(null);

  useEffect(() => {
    // Get the current tab URL from Chrome extension API
    if (chrome?.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url) {
          const url = tabs[0].url;
          setCurrentUrl(url);
          setIsArticle(isArticleURL(url));
        }
      });
    } else {
      // Fallback for development/testing
      const url = window.location.href;
      setCurrentUrl(url);
      setIsArticle(isArticleURL(url));
    }
  }, []);

  if (isArticle === null) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isArticle) {
    return (
      <div className="p-6 max-w-md">
        <h1 className="text-xl font-bold mb-4">Web Annotator</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800 text-sm">
            Ratings are only available for articles.
          </p>
        </div>
      </div>
    );
  }

  return <Popup currentUrl={currentUrl} />;
}

export default App;

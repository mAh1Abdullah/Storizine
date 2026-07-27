import React, { useState } from 'react';
import { X, Plus, BookOpen, Layers, Send } from 'lucide-react';
import { PublishedBook, UpcomingBook, WritingStage } from '../types';

interface AddPublishedBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPublished: (book: PublishedBook) => void;
  onAddUpcoming: (book: UpcomingBook) => void;
}

export const AddPublishedBookModal: React.FC<AddPublishedBookModalProps> = ({
  isOpen,
  onClose,
  onAddPublished,
  onAddUpcoming,
}) => {
  const [bookType, setBookType] = useState<'published' | 'upcoming'>('published');

  // Form states for published
  const [title, setTitle] = useState('');
  const [series, setSeries] = useState('');
  const [seriesNumber, setSeriesNumber] = useState('');
  const [genre, setGenre] = useState('Speculative Fiction');
  const [coverUrl, setCoverUrl] = useState('');
  const [publisher, setPublisher] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [blurb, setBlurb] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [vendorName, setVendorName] = useState('Amazon');
  const [vendorUrl, setVendorUrl] = useState('');
  const [price, setPrice] = useState('$16.99');
  
  // Upcoming state
  const [writingStage, setWritingStage] = useState<WritingStage>('Drafting');
  const [progressPercentage, setProgressPercentage] = useState(60);
  const [teaserQuote, setTeaserQuote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !blurb) return;

    const defaultCover = coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

    if (bookType === 'published') {
      const newBook: PublishedBook = {
        id: `pub-${Date.now()}`,
        title,
        series: series || undefined,
        seriesNumber: seriesNumber ? parseInt(seriesNumber) : undefined,
        genre,
        coverUrl: defaultCover,
        publisher: publisher || 'Self-Published / Independent',
        releaseDate: releaseDate || '2026',
        blurb,
        excerpt: excerpt || 'Excerpt sample coming soon!',
        buyLinks: vendorUrl ? [{ vendor: vendorName, url: vendorUrl, price }] : [],
        praise: [{ quote: 'A compelling addition to the author portfolio.', source: 'Early Reader' }],
        rating: 4.8,
        pages: 350,
        formats: ['Hardcover', 'Paperback', 'Ebook'],
      };
      onAddPublished(newBook);
    } else {
      const newUpcoming: UpcomingBook = {
        id: `up-${Date.now()}`,
        title,
        series: series || undefined,
        genre,
        coverUrl: defaultCover,
        expectedRelease: releaseDate || 'Autumn 2026',
        writingStage,
        progressPercentage,
        blurb,
        teaserQuote: teaserQuote || blurb.slice(0, 80),
        preorderLinks: vendorUrl ? [{ vendor: vendorName, url: vendorUrl }] : [],
      };
      onAddUpcoming(newUpcoming);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#d4a373]" />
            <h3 className="font-serif font-normal text-xl">Add Book to Author Portfolio</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#2a2724]/40 hover:text-[#2a2724] dark:text-[#f5f2e6]/40 dark:hover:text-[#f5f2e6]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Type selector */}
          <div className="flex items-center space-x-2 p-1 bg-[#f5f1e3] dark:bg-[#25221e] rounded-xl border border-[#ebd9c5] dark:border-[#38332c]">
            <button
              type="button"
              onClick={() => setBookType('published')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                bookType === 'published' ? 'bg-[#2a2724] text-[#d4a373] shadow-xs' : 'text-[#2a2724]/60 dark:text-[#f5f2e6]/60'
              }`}
            >
              Published Work
            </button>
            <button
              type="button"
              onClick={() => setBookType('upcoming')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                bookType === 'upcoming' ? 'bg-[#2a2724] text-[#d4a373] shadow-xs' : 'text-[#2a2724]/60 dark:text-[#f5f2e6]/60'
              }`}
            >
              Upcoming Release
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold mb-1">Book Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Chronos Whisperer"
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Series Name (Optional)</label>
              <input
                type="text"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                placeholder="e.g. Chronos Saga"
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>

            {bookType === 'published' && (
              <div>
                <label className="block font-bold mb-1">Series Number</label>
                <input
                  type="number"
                  value={seriesNumber}
                  onChange={(e) => setSeriesNumber(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                />
              </div>
            )}

            <div>
              <label className="block font-bold mb-1">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Speculative Sci-Fi"
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Cover Image URL</label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none font-mono"
              />
            </div>

            {bookType === 'published' ? (
              <>
                <div>
                  <label className="block font-bold mb-1">Publisher</label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="e.g. Aetheria Press"
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Release Date</label>
                  <input
                    type="text"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    placeholder="e.g. October 14, 2024"
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block font-bold mb-1">Writing Stage</label>
                  <select
                    value={writingStage}
                    onChange={(e) => setWritingStage(e.target.value as WritingStage)}
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                  >
                    <option value="Outlining">Outlining</option>
                    <option value="Drafting">Drafting</option>
                    <option value="Revision">Revision</option>
                    <option value="Editing">Editing</option>
                    <option value="Proofreading">Proofreading</option>
                    <option value="ARC Review">ARC Review</option>
                    <option value="Print Ready">Print Ready</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Progress ({progressPercentage}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(parseInt(e.target.value))}
                    className="w-full accent-[#d4a373]"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block font-bold mb-1">Book Blurb / Summary *</label>
            <textarea
              rows={3}
              required
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              placeholder="Provide a compelling synopsis for readers..."
              className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
            />
          </div>

          {bookType === 'published' ? (
            <div>
              <label className="block font-bold mb-1">Sample Excerpt (Chapter 1)</label>
              <textarea
                rows={4}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Paste sample chapter text for the interactive reader modal..."
                className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none font-serif"
              />
            </div>
          ) : (
            <div>
              <label className="block font-bold mb-1">Teaser Quote</label>
              <input
                type="text"
                value={teaserQuote}
                onChange={(e) => setTeaserQuote(e.target.value)}
                placeholder='e.g. "Every second is a keyhole..."'
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>
          )}

          <div className="pt-2 border-t border-[#ebd9c5] dark:border-[#38332c] grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold mb-1">Vendor Name</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-bold mb-1">Buy / Pre-order Link</label>
              <input
                type="url"
                value={vendorUrl}
                onChange={(e) => setVendorUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl font-bold bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] shadow-md"
            >
              Save Book to Portfolio
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

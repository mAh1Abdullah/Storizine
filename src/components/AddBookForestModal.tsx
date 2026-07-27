import React, { useState, useEffect } from 'react';
import { X, Star, Library, Plus, Check } from 'lucide-react';
import { BookForestEntry, ReadingStatus, BookFormat, CollectionLocation } from '../types';

interface AddBookForestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: BookForestEntry) => void;
  initialEntry?: BookForestEntry | null;
}

const ALL_FORMATS: BookFormat[] = [
  'Hardcover',
  'Paperback',
  "Collector's Edition",
  'Signed Copy',
  'First Edition',
  'Kindle/Ebook',
  'Audiobook',
];

const ALL_LOCATIONS: CollectionLocation[] = [
  'Physical Main Bookshelf',
  'Physical Special Shelf',
  'Kindle Library',
  'Audible',
  'Wishlist / Not Owned',
];

export const AddBookForestModal: React.FC<AddBookForestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [coverUrl, setCoverUrl] = useState('');
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>('want-to-read');
  const [userRating, setUserRating] = useState<number>(5);
  const [currentProgressPages, setCurrentProgressPages] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(350);
  const [reviewComments, setReviewComments] = useState('');
  const [quotes, setQuotes] = useState<string>('');
  const [tagsStr, setTagsStr] = useState('Sci-Fi, Favorites');
  
  // Physical / Digital Collection state
  const [ownedFormats, setOwnedFormats] = useState<BookFormat[]>(['Paperback']);
  const [collectionLocation, setCollectionLocation] = useState<CollectionLocation>('Physical Main Bookshelf');
  const [editionDetails, setEditionDetails] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');

  useEffect(() => {
    if (initialEntry) {
      setTitle(initialEntry.title);
      setAuthor(initialEntry.author);
      setGenre(initialEntry.genre);
      setCoverUrl(initialEntry.coverUrl);
      setReadingStatus(initialEntry.readingStatus);
      setUserRating(initialEntry.userRating || 5);
      setCurrentProgressPages(initialEntry.currentProgressPages || 0);
      setTotalPages(initialEntry.totalPages || 350);
      setReviewComments(initialEntry.reviewComments || '');
      setQuotes(initialEntry.quotesSaved?.join('\n') || '');
      setTagsStr(initialEntry.tags?.join(', ') || '');
      setOwnedFormats(initialEntry.ownedFormats || ['Paperback']);
      setCollectionLocation(initialEntry.collectionLocation || 'Physical Main Bookshelf');
      setEditionDetails(initialEntry.editionDetails || '');
      setPurchasePrice(initialEntry.purchasePrice ? String(initialEntry.purchasePrice) : '');
    } else {
      setTitle('');
      setAuthor('');
      setGenre('Fantasy');
      setCoverUrl('');
      setReadingStatus('want-to-read');
      setUserRating(5);
      setCurrentProgressPages(0);
      setTotalPages(350);
      setReviewComments('');
      setQuotes('');
      setTagsStr('Favorites');
      setOwnedFormats(['Hardcover']);
      setCollectionLocation('Physical Main Bookshelf');
      setEditionDetails('');
      setPurchasePrice('');
    }
  }, [initialEntry, isOpen]);

  if (!isOpen) return null;

  const toggleFormat = (fmt: BookFormat) => {
    if (ownedFormats.includes(fmt)) {
      setOwnedFormats(ownedFormats.filter((f) => f !== fmt));
    } else {
      setOwnedFormats([...ownedFormats, fmt]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;

    const defaultCover = coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

    const entryToSave: BookForestEntry = {
      id: initialEntry ? initialEntry.id : `bf-${Date.now()}`,
      title,
      author,
      coverUrl: defaultCover,
      genre: genre || 'Fiction',
      readingStatus,
      userRating: readingStatus === 'read' ? userRating : 0,
      currentProgressPages: readingStatus === 'currently-reading' ? currentProgressPages : undefined,
      totalPages: totalPages || 350,
      dateAdded: initialEntry ? initialEntry.dateAdded : new Date().toISOString().split('T')[0],
      dateFinished: readingStatus === 'read' ? new Date().toISOString().split('T')[0] : undefined,
      reviewComments,
      quotesSaved: quotes ? quotes.split('\n').filter(q => q.trim().length > 0) : [],
      tags: tagsStr ? tagsStr.split(',').map((t) => t.trim()) : [],
      ownedFormats,
      collectionLocation,
      editionDetails: editionDetails || undefined,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      readCount: readingStatus === 'read' ? 1 : 0,
    };

    onSave(entryToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Library className="w-5 h-5 text-[#d4a373]" />
            <h3 className="font-serif font-normal text-xl">
              {initialEntry ? 'Edit BookForest Record' : 'Add Book to BookForest'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#2a2724]/40 hover:text-[#2a2724] dark:text-[#f5f2e6]/40 dark:hover:text-[#f5f2e6]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Book Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dune"
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Author *</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Frank Herbert"
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Sci-Fi Classic"
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
          </div>

          {/* Reading Status & Progress */}
          <div className="p-3 bg-[#f5f1e3] dark:bg-[#25221e] rounded-xl border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm">
                  Reading Status
                </label>
                <select
                  value={readingStatus}
                  onChange={(e) => setReadingStatus(e.target.value as ReadingStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] font-semibold outline-none"
                >
                  <option value="want-to-read">Want to Read</option>
                  <option value="currently-reading">Currently Reading</option>
                  <option value="read">Finished Reading</option>
                  <option value="did-not-finish">Did Not Finish</option>
                </select>
              </div>

              {readingStatus === 'read' && (
                <div>
                  <label className="block font-bold mb-1 text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm">
                    Your Star Rating
                  </label>
                  <div className="flex items-center space-x-1 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= userRating
                              ? 'text-[#d4a373] fill-[#d4a373]'
                              : 'text-[#ebd9c5] dark:text-[#38332c]'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-xs">{userRating} / 5</span>
                  </div>
                </div>
              )}

              {readingStatus === 'currently-reading' && (
                <div>
                  <label className="block font-bold mb-1 text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm">
                    Current Reading Progress
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={currentProgressPages}
                      onChange={(e) => setCurrentProgressPages(parseInt(e.target.value) || 0)}
                      placeholder="Page"
                      className="w-24 px-2 py-1.5 rounded-lg border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] font-mono"
                    />
                    <span>/</span>
                    <input
                      type="number"
                      value={totalPages}
                      onChange={(e) => setTotalPages(parseInt(e.target.value) || 350)}
                      placeholder="Total"
                      className="w-24 px-2 py-1.5 rounded-lg border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] font-mono"
                    />
                    <span className="text-xs font-bold text-[#d4a373]">
                      ({Math.round(((currentProgressPages || 0) / (totalPages || 1)) * 100)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Physical / Digital Collection & Edition Management */}
          <div className="p-3 bg-[#f5f1e3]/80 dark:bg-[#25221e]/80 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
            <h4 className="font-bold text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm uppercase tracking-wider">
              Collection & Physical / Virtual Edition Owned
            </h4>

            <div>
              <label className="block font-semibold mb-1">Format(s) Owned in Collection:</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_FORMATS.map((fmt) => {
                  const isSel = ownedFormats.includes(fmt);
                  return (
                    <button
                      type="button"
                      key={fmt}
                      onClick={() => toggleFormat(fmt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center space-x-1 ${
                        isSel
                          ? 'bg-[#2a2724] text-[#d4a373] border-[#2a2724] shadow-xs'
                          : 'bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] border-[#ebd9c5] dark:border-[#38332c]'
                      }`}
                    >
                      {isSel && <Check className="w-3 h-3 text-[#d4a373]" />}
                      <span>{fmt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold mb-1">Collection Location</label>
                <select
                  value={collectionLocation}
                  onChange={(e) => setCollectionLocation(e.target.value as CollectionLocation)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                >
                  {ALL_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Edition Notes (Optional)</label>
                <input
                  type="text"
                  value={editionDetails}
                  onChange={(e) => setEditionDetails(e.target.value)}
                  placeholder="e.g. Illumicrate Special Sprayed Edges & Signed"
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Personal Review & Comments */}
          <div>
            <label className="block font-bold mb-1">Personal Comments & Review</label>
            <textarea
              rows={3}
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder="What did you think of the story, worldbuilding, characters, or writing style?"
              className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Favorite Quotes Saved (One per line)</label>
            <textarea
              rows={2}
              value={quotes}
              onChange={(e) => setQuotes(e.target.value)}
              placeholder='e.g. "Fear is the mind-killer..."'
              className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none font-serif"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Tags (Comma separated)</label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="e.g. Sci-Fi, Award Winner, Audio Gold"
              className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-[#ebd9c5] dark:border-[#38332c]">
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
              Save to BookForest
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

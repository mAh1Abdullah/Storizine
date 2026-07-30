export interface GutenbergBook {
  id: string;
  gutenbergId: number;
  title: string;
  author: string;
  year: string;
  genre: string;
  coverUrl: string;
  pages: number;
  description: string;
  excerptText: string;
  fullGutenbergUrl: string;
  language: string;
  featuredQuote: string;
}

export const GUTENBERG_CLASSICS: GutenbergBook[] = [
  {
    id: 'gut-1',
    gutenbergId: 84,
    title: 'Frankenstein; or, The Modern Prometheus',
    author: 'Mary Wollstonecraft Shelley',
    year: '1818',
    genre: 'Gothic Horror & Sci-Fi',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800',
    pages: 280,
    description: 'A masterpiece of Gothic science fiction. Victor Frankenstein creates a living creature in an unorthodox scientific experiment, only to recoil from his creation in horror.',
    excerptText: `It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet. It was already one in the morning; the rain pattered dismally against the panes, and my candle was nearly burnt out, when, by the glimmer of the half-extinguished light, I saw the dull yellow eye of the creature open; it breathed hard, and a convulsive motion agitated its limbs.

How can I describe my emotions at this catastrophe, or how delineate the wretch whom with such infinite pains and care I had endeavoured to form? His limbs were in proportion, and I had selected his features as beautiful. Beautiful! Great God!`,
    fullGutenbergUrl: 'https://www.gutenberg.org/ebooks/84',
    language: 'English',
    featuredQuote: 'Beware; for I am fearless, and therefore powerful.',
  },
  {
    id: 'gut-2',
    gutenbergId: 1342,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: '1813',
    genre: 'Classic Literature & Romance',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    pages: 432,
    description: 'The romantic clash between the opinionated Elizabeth Bennet and her proud suitor, Mr. Darcy, set in Regency-era England.',
    excerptText: `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"`,
    fullGutenbergUrl: 'https://www.gutenberg.org/ebooks/1342',
    language: 'English',
    featuredQuote: 'I declare after all there is no enjoyment like reading! How much sooner one tires of any thing than of a book!',
  },
  {
    id: 'gut-3',
    gutenbergId: 35,
    title: 'The Time Machine',
    author: 'H. G. Wells',
    year: '1895',
    genre: 'Classic Sci-Fi & Time Travel',
    coverUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=800',
    pages: 144,
    description: 'The foundational speculative novella introducing time travel as a mechanical invention, traveling to the far future year 802,701 AD.',
    excerptText: `The Time Traveller (for so it will be convenient to call him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burned brightly, and the soft radiance of the incandescent lights in the lilies of silver caught the bubbles that flashed and passed in our glasses.

"You must follow me carefully. I shall have to controvert one or two ideas that are almost universally accepted. The geometry, for instance, that they taught you in schools is founded on a misconception."`,
    fullGutenbergUrl: 'https://www.gutenberg.org/ebooks/35',
    language: 'English',
    featuredQuote: 'Nature never appeals to intelligence until habit and instinct are useless.',
  },
  {
    id: 'gut-4',
    gutenbergId: 1661,
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    year: '1892',
    genre: 'Detective Fiction & Mystery',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    pages: 307,
    description: 'Twelve classic detective short stories starring the legendary consulting detective Sherlock Holmes and Dr. John Watson.',
    excerptText: `To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.

He was, I take it, the most perfect reasoning and observing machine that the world has seen.`,
    fullGutenbergUrl: 'https://www.gutenberg.org/ebooks/1661',
    language: 'English',
    featuredQuote: 'You see, but you do not observe. The distinction is clear.',
  },
  {
    id: 'gut-5',
    gutenbergId: 345,
    title: 'Dracula',
    author: 'Bram Stoker',
    year: '1897',
    genre: 'Gothic Horror',
    coverUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=800',
    pages: 418,
    description: 'The iconic epistolary vampire novel detailing Count Dracula’s attempt to move from Transylvania to England to find new blood and spread his undead curse.',
    excerptText: `3 May. Bistritz.—Left Munich at 8:35 P. M., on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late. Buda-Pesth seems a wonderful place, from the glimpse which I got of it from the train and the little I could walk through the streets.

The impression I had was that we were leaving the West and entering the East; the most western of splendid bridges over the Danube, which is here of noble width and depth, took us among the traditions of Turkish rule.`,
    fullGutenbergUrl: 'https://www.gutenberg.org/ebooks/345',
    language: 'English',
    featuredQuote: 'Listen to them—the children of the night. What music they make!',
  },
  {
    id: 'gut-6',
    gutenbergId: 164,
    title: 'Twenty Thousand Leagues Under the Sea',
    author: 'Jules Verne',
    year: '1870',
    genre: 'Adventure & Proto Sci-Fi',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    pages: 384,
    description: 'Captain Nemo commands the futuristic submarine Nautilus on a daring undersea journey across the globe.',
    excerptText: `The year 1866 was signalized by a remarkable incident, a mysterious and puzzling phenomenon, which doubtless no one has yet forgotten. Not to mention rumors which agitated the maritime population and excited the public mind in interior continents, seafaring men were particularly excited.

Merchants, common sailors, captains of vessels, skippers, both of Europe and America, naval officers of all countries, were deeply stirred by the mystery.`,
    fullGutenbergUrl: 'https://www.gutenberg.org/ebooks/164',
    language: 'English',
    featuredQuote: 'The sea is everything. It covers seven-tenths of the terrestrial globe.',
  },
];

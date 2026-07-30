export interface ChoiceAwardCategory {
  id: string;
  name: string;
  description: string;
  winnerId: string;
  nominees: ChoiceAwardBook[];
}

export interface ChoiceAwardBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  votes: number;
  rating: number;
  pages: number;
  blurb: string;
  isWinner?: boolean;
}

export interface GoodreadsQuote {
  id: string;
  quote: string;
  author: string;
  bookTitle: string;
  likes: number;
  tags: string[];
  coverUrl?: string;
}

export const GOODREADS_CHOICE_AWARDS: ChoiceAwardCategory[] = [
  {
    id: 'fiction',
    name: 'Best Fiction',
    description: 'The year’s most celebrated works of general and literary fiction.',
    winnerId: 'gca-fic-1',
    nominees: [
      {
        id: 'gca-fic-1',
        title: 'The Midnight Library',
        author: 'Matt Haig',
        coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
        votes: 142090,
        rating: 4.8,
        pages: 304,
        blurb: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
        isWinner: true,
      },
      {
        id: 'gca-fic-[#2]',
        title: 'Tomorrow, and Tomorrow, and Tomorrow',
        author: 'Gabrielle Zevin',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
        votes: 98410,
        rating: 4.7,
        pages: 416,
        blurb: 'In this exhilarating novel, two friends—often in love, but never lovers—come together as creative partners in the world of video game design.',
      },
      {
        id: 'gca-fic-3',
        title: 'Anxious People',
        author: 'Fredrik Backman',
        coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
        votes: 75230,
        rating: 4.6,
        pages: 352,
        blurb: 'A poignant comedy about a bank robbery that goes wrong and the hostage situation that follows.',
      },
    ],
  },
  {
    id: 'scifi-fantasy',
    name: 'Best Sci-Fi & Fantasy',
    description: 'Mind-bending speculative fiction, space epics, and magical realms.',
    winnerId: 'gca-sf-1',
    nominees: [
      {
        id: 'gca-sf-1',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        coverUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=800',
        votes: 185400,
        rating: 4.9,
        pages: 496,
        blurb: 'Ryland Grace is the sole survivor on a desperate, last-chance mission to save humanity from an extinction-level solar threat.',
        isWinner: true,
      },
      {
        id: 'gca-sf-2',
        title: 'Dune Messiah & Speculative Chronicles',
        author: 'Frank Herbert',
        coverUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
        votes: 112000,
        rating: 4.7,
        pages: 336,
        blurb: 'Dune Messiah continues the story of Paul Atreides, twelve years after his ascent to the throne.',
      },
      {
        id: 'gca-sf-3',
        title: 'Klara and the Sun',
        author: 'Kazuo Ishiguro',
        coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        votes: 89300,
        rating: 4.5,
        pages: 320,
        blurb: 'A thrilling novel that looks at our rapidly changing modern world through the eyes of an unforgettable Artificial Friend.',
      },
    ],
  },
  {
    id: 'mystery',
    name: 'Best Mystery & Thriller',
    description: 'Gripping whodunits, psychological suspense, and detective procedurals.',
    winnerId: 'gca-[#mys]-1',
    nominees: [
      {
        id: 'gca-[#mys]-1',
        title: 'The Thursday Murder Club',
        author: 'Richard Osman',
        coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
        votes: 124500,
        rating: 4.7,
        pages: 384,
        blurb: 'In a peaceful retirement village, four unlikely friends meet weekly to investigate unsolved crimes.',
        isWinner: true,
      },
      {
        id: 'gca-mys-2',
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
        votes: 118200,
        rating: 4.8,
        pages: 336,
        blurb: 'A woman’s act of violence against her husband, and the therapist obsessed with uncovering her motive.',
      },
    ],
  },
];

export const GOODREADS_QUOTES: GoodreadsQuote[] = [
  {
    id: 'quote-1',
    quote: 'A reader lives a thousand lives before he dies. The man who never reads lives only one.',
    author: 'George R.R. Martin',
    bookTitle: 'A Dance with Dragons',
    likes: 42180,
    tags: ['Reading', 'Books', 'Wisdom'],
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'quote-2',
    quote: 'It is our choices, Harry, that show what we truly are, far more than our abilities.',
    author: 'J.K. Rowling',
    bookTitle: 'Harry Potter and the Chamber of Secrets',
    likes: 38920,
    tags: ['Choices', 'Inspiration', 'Magic'],
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'quote-3',
    quote: 'Words are, in my not-so-humble opinion, our most inexhaustible source of magic.',
    author: 'J.K. Rowling',
    bookTitle: 'Harry Potter and the Deathly Hallows',
    likes: 31050,
    tags: ['Words', 'Magic', 'Literature'],
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'quote-4',
    quote: 'Not all those who wander are lost.',
    author: 'J.R.R. Tolkien',
    bookTitle: 'The Fellowship of the Ring',
    likes: 56400,
    tags: ['Travel', 'Poetry', 'Adventure'],
    coverUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'quote-5',
    quote: 'There is no friend as loyal as a book.',
    author: 'Ernest Hemingway',
    bookTitle: 'Selected Writings',
    likes: 29400,
    tags: ['Friendship', 'Books'],
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'quote-6',
    quote: 'Until I feared I would lose it, I never loved reading. One does not love breathing.',
    author: 'Harper Lee',
    bookTitle: 'To Kill a Mockingbird',
    likes: 41200,
    tags: ['Reading', 'Classics', 'Love'],
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
  },
];

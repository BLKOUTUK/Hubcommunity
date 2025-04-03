import { logError } from './errorLogging';
import airtableClient from '../integrations/airtable/client';

/**
 * Types for the content curation system
 */

export interface DailyInspiration {
  id: string;
  imageUrl: string;
  quote: string;
  author: string;
  authorYears?: string;
  category: 'solidarity' | 'community' | 'self-esteem' | 'purpose' | 'love' | 'resilience' | 'empowerment' | 'hope';
  publishDate: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyQuiz {
  id: string;
  title: string;
  description: string;
  questions: {
    id: string;
    text: string;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
    }[];
    explanation?: string;
  }[];
  publishDate: string;
  expiryDate: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all daily inspirations
 */
export const getDailyInspirations = async (): Promise<DailyInspiration[]> => {
  try {
    const records = await airtableClient.getRecords('DailyInspirations', {
      sort: [{ field: 'PublishDate', direction: 'desc' }]
    });

    return records.map((record: any) => ({
      id: record.id,
      imageUrl: record.get('ImageUrl') as string,
      quote: record.get('Quote') as string,
      author: record.get('Author') as string,
      authorYears: record.get('AuthorYears') as string,
      category: record.get('Category') as DailyInspiration['category'],
      publishDate: record.get('PublishDate') as string,
      isPublished: record.get('IsPublished') as boolean,
      createdAt: record.get('CreatedAt') as string,
      updatedAt: record.get('UpdatedAt') as string
    }));
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching daily inspirations');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Get today's inspiration or the most recent one
 */
export const getTodaysInspiration = async (): Promise<DailyInspiration | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const records = await airtableClient.getRecords('DailyInspirations', {
      filterByFormula: `AND({PublishDate}='${today}', {IsPublished}=TRUE())`,
      maxRecords: 1
    });

    if (records.length === 0) {
      // If no inspiration for today, get the most recent one
      const recentRecords = await airtableClient.getRecords('DailyInspirations', {
        filterByFormula: '{IsPublished}=TRUE()',
        sort: [{ field: 'PublishDate', direction: 'desc' }],
        maxRecords: 1
      });

      if (recentRecords.length === 0) return null;
      
      const record = recentRecords[0];
      return {
        id: record.id,
        imageUrl: record.get('ImageUrl') as string,
        quote: record.get('Quote') as string,
        author: record.get('Author') as string,
        authorYears: record.get('AuthorYears') as string,
        category: record.get('Category') as DailyInspiration['category'],
        publishDate: record.get('PublishDate') as string,
        isPublished: record.get('IsPublished') as boolean,
        createdAt: record.get('CreatedAt') as string,
        updatedAt: record.get('UpdatedAt') as string
      };
    }

    const record = records[0];
    return {
      id: record.id,
      imageUrl: record.get('ImageUrl') as string,
      quote: record.get('Quote') as string,
      author: record.get('Author') as string,
      authorYears: record.get('AuthorYears') as string,
      category: record.get('Category') as DailyInspiration['category'],
      publishDate: record.get('PublishDate') as string,
      isPublished: record.get('IsPublished') as boolean,
      createdAt: record.get('CreatedAt') as string,
      updatedAt: record.get('UpdatedAt') as string
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching today\'s inspiration');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Create a new daily inspiration
 */
export const createDailyInspiration = async (
  data: Omit<DailyInspiration, 'id' | 'createdAt' | 'updatedAt'>
): Promise<DailyInspiration> => {
  try {
    const now = new Date().toISOString();
    
    const record = await airtableClient.createRecord('DailyInspirations', {
      ImageUrl: data.imageUrl,
      Quote: data.quote,
      Author: data.author,
      AuthorYears: data.authorYears || '',
      Category: data.category,
      PublishDate: data.publishDate,
      IsPublished: data.isPublished,
      CreatedAt: now,
      UpdatedAt: now
    });

    return {
      id: record.id,
      imageUrl: data.imageUrl,
      quote: data.quote,
      author: data.author,
      authorYears: data.authorYears,
      category: data.category,
      publishDate: data.publishDate,
      isPublished: data.isPublished,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error creating daily inspiration');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Get all weekly quizzes
 */
export const getWeeklyQuizzes = async (): Promise<WeeklyQuiz[]> => {
  try {
    const records = await airtableClient.getRecords('WeeklyQuizzes', {
      sort: [{ field: 'PublishDate', direction: 'desc' }]
    });

    return records.map((record: any) => ({
      id: record.id,
      title: record.get('Title') as string,
      description: record.get('Description') as string,
      questions: JSON.parse(record.get('Questions') || '[]'),
      publishDate: record.get('PublishDate') as string,
      expiryDate: record.get('ExpiryDate') as string,
      isPublished: record.get('IsPublished') as boolean,
      createdAt: record.get('CreatedAt') as string,
      updatedAt: record.get('UpdatedAt') as string
    }));
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching weekly quizzes');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Get current active quiz
 */
export const getCurrentQuiz = async (): Promise<WeeklyQuiz | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const records = await airtableClient.getRecords('WeeklyQuizzes', {
      filterByFormula: `AND({PublishDate}<='${today}', {ExpiryDate}>='${today}', {IsPublished}=TRUE())`,
      maxRecords: 1
    });

    if (records.length === 0) return null;
    
    const record = records[0];
    return {
      id: record.id,
      title: record.get('Title') as string,
      description: record.get('Description') as string,
      questions: JSON.parse(record.get('Questions') || '[]'),
      publishDate: record.get('PublishDate') as string,
      expiryDate: record.get('ExpiryDate') as string,
      isPublished: record.get('IsPublished') as boolean,
      createdAt: record.get('CreatedAt') as string,
      updatedAt: record.get('UpdatedAt') as string
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error fetching current quiz');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Create a new weekly quiz
 */
export const createWeeklyQuiz = async (
  data: Omit<WeeklyQuiz, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WeeklyQuiz> => {
  try {
    const now = new Date().toISOString();
    
    const record = await airtableClient.createRecord('WeeklyQuizzes', {
      Title: data.title,
      Description: data.description,
      Questions: JSON.stringify(data.questions),
      PublishDate: data.publishDate,
      ExpiryDate: data.expiryDate,
      IsPublished: data.isPublished,
      CreatedAt: now,
      UpdatedAt: now
    });

    return {
      id: record.id,
      title: data.title,
      description: data.description,
      questions: data.questions,
      publishDate: data.publishDate,
      expiryDate: data.expiryDate,
      isPublished: data.isPublished,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error creating weekly quiz');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * The Blackout Gaze quotes data for daily inspiration
 */
export const blackoutGazeQuotes = [
  {
    quote: "We are powerful because we have survived.",
    author: "Audre Lorde",
    authorYears: "1934–1992",
    category: "solidarity"
  },
  {
    quote: "Solidarity means standing together, even when the world tries to tear us apart.",
    author: "Alexis Pauline Gumbs",
    authorYears: "1980-",
    category: "solidarity"
  },
  {
    quote: "When we stand together, we rewrite the narrative of exclusion.",
    author: "Zanele Muholi",
    authorYears: "1972-",
    category: "solidarity"
  },
  {
    quote: "Our love and happiness are radical acts of resistance.",
    author: "Danez Smith",
    authorYears: "1991-",
    category: "solidarity"
  },
  {
    quote: "Freedom is collective; none of us can be truly free until all of us are free.",
    author: "James Baldwin",
    authorYears: "1924–1987",
    category: "solidarity"
  },
  {
    quote: "Queer love in diaspora is about creating safe spaces for joy and belonging.",
    author: "Adannay",
    authorYears: "1980-",
    category: "community"
  },
  {
    quote: "Community care blossoms amidst chaos; we survive and thrive together.",
    author: "Audre Lorde",
    authorYears: "1934–1992",
    category: "community"
  },
  {
    quote: "Black love is resistance against systems that try to erase us.",
    author: "Alexis Pauline Gumbs",
    authorYears: "1980-",
    category: "community"
  },
  {
    quote: "We create home wherever we gather in love and solidarity.",
    author: "Diriye Osman",
    authorYears: "1983-",
    category: "community"
  },
  {
    quote: "Inclusion is not assimilation; it's about building spaces for all to belong.",
    author: "Tendai Huchu",
    authorYears: "1982-",
    category: "community"
  },
  {
    quote: "Caring for myself is not self-indulgence; it is self-preservation, an act of political warfare.",
    author: "Audre Lorde",
    authorYears: "1934–1992",
    category: "self-esteem"
  },
  {
    quote: "I am built this way for a reason; I embrace my truth unapologetically.",
    author: "Zanele Muholi",
    authorYears: "1972-",
    category: "self-esteem"
  },
  {
    quote: "Self-love is a daily act of defiance against colonial narratives of shame.",
    author: "Alexis Pauline Gumbs",
    authorYears: "1980-",
    category: "self-esteem"
  },
  {
    quote: "We are stronger, smarter, talented, beautiful, and more resilient than we were told.",
    author: "Dior Vargas",
    authorYears: "1988-",
    category: "self-esteem"
  },
  {
    quote: "To define ourselves for ourselves is essential for liberation.",
    author: "Audre Lorde",
    authorYears: "1934–1992",
    category: "self-esteem"
  },
  {
    quote: "Not everything faced can be changed; but nothing can be changed until it is faced.",
    author: "James Baldwin",
    authorYears: "1924–1987",
    category: "purpose"
  },
  {
    quote: "Our stories are revolutionary acts that lead to understanding and transcendence.",
    author: "Janet Mock",
    authorYears: "1983-",
    category: "purpose"
  },
  {
    quote: "Purpose begins with recognizing our worth and claiming our space unapologetically.",
    author: "Zanele Muholi",
    authorYears: "1972-",
    category: "purpose"
  },
  {
    quote: "Queer Africans resist colonial narratives by reclaiming their identities unapologetically.",
    author: "Tendai Huchu",
    authorYears: "1982-",
    category: "purpose"
  },
  {
    quote: "Revolutionary love begins with knowing yourself deeply and sharing that truth with the world.",
    author: "Danez Smith",
    authorYears: "1991-",
    category: "purpose"
  },
  {
    quote: "Love takes off the masks we fear we cannot live without and know we cannot live within.",
    author: "James Baldwin",
    authorYears: "1924–1987",
    category: "love"
  },
  {
    quote: "Queer love is about creating spaces where vulnerability thrives without fear or judgment.",
    author: "Tendai Huchu",
    authorYears: "1982-",
    category: "love"
  },
  {
    quote: "Love out loud; it's a radical act in a world that tells us to hide.",
    author: "Adannay",
    authorYears: "1980-",
    category: "love"
  },
  {
    quote: "Love him and let him love you; nothing else under heaven really matters.",
    author: "James Baldwin",
    authorYears: "1924–1987",
    category: "love"
  },
  {
    quote: "Love is bigger than easy; it's about mapping and learning its edges together.",
    author: "Alexis Pauline Gumbs",
    authorYears: "1980-",
    category: "love"
  },
  {
    quote: "Survival means embracing our differences as vehicles for creative change.",
    author: "Audre Lorde",
    authorYears: "1934–1992",
    category: "resilience"
  },
  {
    quote: "Resilience doesn't mean life is easy; it means reclaiming joy despite challenges.",
    author: "Adannay",
    authorYears: "1980-",
    category: "resilience"
  },
  {
    quote: "Resilience begins with self-love and ends with collective liberation.",
    author: "Alexis Pauline Gumbs",
    authorYears: "1980-",
    category: "resilience"
  },
  {
    quote: "We are stronger than the systems that seek to erase us; our existence is resistance.",
    author: "Danez Smith",
    authorYears: "1991-",
    category: "resilience"
  },
  {
    quote: "Queer Africans thrive because they refuse to be erased by colonial structures of power.",
    author: "Diriye Osman",
    authorYears: "1983-",
    category: "resilience"
  },
  {
    quote: "Visibility transforms oppression into power and pride into protest.",
    author: "Zanele Muholi",
    authorYears: "1972-",
    category: "empowerment"
  },
  {
    quote: "Empowerment starts with reclaiming joy as a right, not a privilege.",
    author: "Dior Vargas",
    authorYears: "1988-",
    category: "empowerment"
  },
  {
    quote: "Self-determination makes us dangerous to colonialism; embody courageous love daily and nightly.",
    author: "June Jordan",
    authorYears: "1936–2002",
    category: "empowerment"
  },
  {
    quote: "Empowerment means creating spaces where everyone belongs, regardless of identity or origin.",
    author: "Tendai Huchu",
    authorYears: "1982-",
    category: "empowerment"
  },
  {
    quote: "We accomplish incredible things when we reclaim our right to joy and creativity.",
    author: "Alexis Pauline Gumbs",
    authorYears: "1980-",
    category: "empowerment"
  },
  {
    quote: "Hold fast to dreams, for if dreams die, life is a broken-winged bird that cannot fly.",
    author: "Langston Hughes",
    authorYears: "1902–1967",
    category: "hope"
  },
  {
    quote: "Being visible means refusing invisibility imposed by shame or fear.",
    author: "Sylvia Rivera",
    authorYears: "1951–2002",
    category: "hope"
  },
  {
    quote: "Our crowns shine brilliantly today because of the queens who came before us.",
    author: "Mercedes Lucero",
    authorYears: "",
    category: "hope"
  },
  {
    quote: "History has shown us that courage can be contagious, and hope can take on a life of its own.",
    author: "Marsha P Johnson",
    authorYears: "1945-1992",
    category: "hope"
  },
  {
    quote: "When a man starts out to build a world, he starts first with himself.",
    author: "Langston Hughes",
    authorYears: "1902–1967",
    category: "hope"
  }
];

// Default BlackoutGaze images
export const blackoutGazeDefaultImages = [
  '/content/blackout-gaze/blackout-gaze-1.jpg',
  '/content/blackout-gaze/blackout-gaze-2.jpg',
  '/content/blackout-gaze/blackout-gaze-3.jpg',
  '/content/blackout-gaze/blackout-gaze-4.jpg',
  '/content/blackout-gaze/blackout-gaze-5.jpg',
  '/content/blackout-gaze/blackout-gaze-6.jpg',
  '/content/blackout-gaze/blackout-gaze-7.jpg',
  '/content/blackout-gaze/blackout-gaze-8.jpg'
];

/**
 * Generate daily inspirations for the next 30 days
 */
export const generateDailyInspirations = async (startDate?: string): Promise<DailyInspiration[]> => {
  try {
    // Use provided start date or tomorrow
    const start = startDate 
      ? new Date(startDate) 
      : new Date(new Date().setDate(new Date().getDate() + 1));
    
    const createdInspirations: DailyInspiration[] = [];
    
    // Generate 30 days of inspirations
    for (let i = 0; i < 30; i++) {
      const publishDate = new Date(start);
      publishDate.setDate(start.getDate() + i);
      const dateString = publishDate.toISOString().split('T')[0];
      
      // Select quote (cycle through the array)
      const quoteData = blackoutGazeQuotes[i % blackoutGazeQuotes.length];
      
      // Select image (cycle through the array)
      const imageUrl = blackoutGazeDefaultImages[i % blackoutGazeDefaultImages.length];
      
      // Create the inspiration
      const inspiration = await createDailyInspiration({
        imageUrl,
        quote: quoteData.quote,
        author: quoteData.author,
        authorYears: quoteData.authorYears,
        category: quoteData.category as DailyInspiration['category'],
        publishDate: dateString,
        isPublished: true
      });
      
      createdInspirations.push(inspiration);
    }
    
    return createdInspirations;
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error generating daily inspirations');
    logError(errorObj);
    throw errorObj;
  }
};

export default {
  getDailyInspirations,
  getTodaysInspiration,
  createDailyInspiration,
  getWeeklyQuizzes,
  getCurrentQuiz,
  createWeeklyQuiz,
  blackoutGazeQuotes,
  blackoutGazeDefaultImages,
  generateDailyInspirations
};
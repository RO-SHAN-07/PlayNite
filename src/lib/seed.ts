import {
  collection,
  writeBatch,
  serverTimestamp,
  doc,
  Firestore,
} from 'firebase/firestore';

// This is a placeholder video URL.
// In a real application, you would use a service like Cloudinary, Mux, or AWS S3.
const sampleVideoUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

// Embedded video URL for adult content
const embeddedVideoUrl = 'https://www.pornhub.com/view_video.php?viewkey=0ef399b63a72d0e4ab57';

const videosToSeed = [
    {
      id: 'tech-review-1',
      title: 'The Future of AI: A Deep Dive into GPT-5',
      description: 'Join us as we explore the potential capabilities of the next generation of language models and what they mean for humanity.',
      creator: 'AI Explained',
      creatorId: 'dev-user',
      duration: '15:42',
      thumbnailUrl: 'https://picsum.photos/seed/tech-1/400/225',
      videoUrl: sampleVideoUrl,
      views: 120543,
      categoryId: 'sci-fi'
    },
    {
      id: 'comedy-skit-1',
      title: 'If Programmers Were Honest',
      description: 'A hilarious take on the daily struggles and triumphs of software developers. You will relate to this more than you want to.',
      creator: 'CodeLaughs',
      creatorId: 'dev-user',
      duration: '5:21',
      thumbnailUrl: 'https://picsum.photos/seed/comedy-1/400/225',
      videoUrl: sampleVideoUrl,
      views: 2304321,
      categoryId: 'comedy'
    },
    {
      id: 'documentary-1',
      title: 'The Secrets of the Deep Ocean',
      description: 'Explore the mysterious and uncharted territories of the deep sea, uncovering bizarre creatures and stunning underwater landscapes.',
      creator: 'Nature Docs',
      creatorId: 'dev-user',
      duration: '45:10',
      thumbnailUrl: 'https://picsum.photos/seed/doc-1/400/225',
      videoUrl: sampleVideoUrl,
      views: 876543,
      categoryId: 'documentary'
    },
    {
      id: 'action-movie-1',
      title: 'Cyber Runner: 2049',
      description: 'In a dystopian future, a lone operative must navigate a world of cybernetic enhancements and corporate espionage to uncover a vast conspiracy.',
      creator: 'Future Films',
      creatorId: 'dev-user',
      duration: '12:33',
      thumbnailUrl: 'https://picsum.photos/seed/action-1/400/225',
      videoUrl: sampleVideoUrl,
      views: 3450987,
      categoryId: 'action'
    },
    {
      id: 'animation-1',
      title: 'The Last Starfall',
      description: 'A beautifully animated short film about a young girl who befriends a fallen star and must help it return to the sky before its light fades forever.',
      creator: 'Starlight Studios',
      creatorId: 'dev-user',
      duration: '8:55',
      thumbnailUrl: 'https://picsum.photos/seed/anim-1/400/225',
      videoUrl: sampleVideoUrl,
      views: 998765,
      categoryId: 'animation'
    },
    {
        id: 'horror-1',
        title: 'The Silent House on Cedar Lane',
        description: 'A group of teenagers dare to spend a night in an abandoned house with a dark history. What they uncover is more terrifying than any ghost story.',
        creator: 'Fright Night Films',
        creatorId: 'dev-user',
        duration: '9:13',
        thumbnailUrl: 'https://picsum.photos/seed/horror-1/400/225',
        videoUrl: sampleVideoUrl,
        views: 666789,
        categoryId: 'horror'
    },
    {
        id: 'sci-fi-2',
        title: 'Project Chimera: The Clones Among Us',
        description: 'A sci-fi thriller about a detective who discovers that artificially created humans have secretly integrated into society, leading to a hunt for the truth.',
        creator: 'Future Films',
        creatorId: 'dev-user',
        duration: '18:22',
        thumbnailUrl: 'https://picsum.photos/seed/sci-fi-2/400/225',
        videoUrl: sampleVideoUrl,
        views: 1502345,
        categoryId: 'sci-fi'
    },
    {
        id: 'cooking-1',
        title: 'Ultimate 30-Minute Pasta',
        description: 'Learn how to make a gourmet pasta dish that is sure to impress, all in under 30 minutes. Perfect for a weeknight dinner!',
        creator: 'Chef Masters',
        creatorId: 'dev-user',
        duration: '10:05',
        thumbnailUrl: 'https://picsum.photos/seed/cooking-1/400/225',
        videoUrl: sampleVideoUrl,
        views: 543210,
        categoryId: 'documentary' // No cooking category, so we put it here
    },
    {
        id: 'travel-1',
        title: 'Backpacking Through Southeast Asia',
        description: 'A cinematic travel vlog showcasing the stunning landscapes, vibrant cultures, and incredible food of Thailand, Vietnam, and Cambodia.',
        creator: 'Wanderlust',
        creatorId: 'dev-user',
        duration: '25:00',
        thumbnailUrl: 'https://picsum.photos/seed/travel-1/400/225',
        videoUrl: sampleVideoUrl,
        views: 789012,
        categoryId: 'documentary' // No travel category
    },
    {
        id: 'gaming-1',
        title: 'Elden Ring: Epic Final Boss Fight (No Damage)',
        description: 'Watch as a master gamer takes down the final boss of Elden Ring without taking a single hit. A true display of skill and dedication.',
        creator: 'GameGod',
        creatorId: 'dev-user',
        duration: '22:45',
        thumbnailUrl: 'https://picsum.photos/seed/gaming-1/400/225',
        videoUrl: sampleVideoUrl,
        views: 4567890,
        categoryId: 'action'
    },
    {
      id: 'tech-review-2',
      title: 'Is This Foldable Phone Worth It?',
      description: 'An in-depth review of the latest foldable smartphone. We test its durability, performance, and camera to see if it lives up to the hype.',
      creator: 'Tech Unboxed',
      creatorId: 'dev-user',
      duration: '14:30',
      thumbnailUrl: 'https://picsum.photos/seed/tech-2/400/225',
      videoUrl: sampleVideoUrl,
      views: 754213,
      categoryId: 'sci-fi'
    },
    {
      id: 'comedy-skit-2',
      title: 'Zoom Meeting in Real Life',
      description: 'What would happen if the awkwardness of a Zoom call happened in a real-life meeting? Spoiler: it\'s hilarious.',
      creator: 'CodeLaughs',
      creatorId: 'dev-user',
      duration: '4:15',
      thumbnailUrl: 'https://picsum.photos/seed/comedy-2/400/225',
      videoUrl: sampleVideoUrl,
      views: 1893456,
      categoryId: 'comedy'
    },
    {
      id: 'documentary-2',
      title: 'The Rise and Fall of Blockbuster',
      description: 'A nostalgic look back at the video rental giant, exploring its cultural impact and the business decisions that led to its demise.',
      creator: 'Retro Docs',
      creatorId: 'dev-user',
      duration: '55:20',
      thumbnailUrl: 'https://picsum.photos/seed/doc-2/400/225',
      videoUrl: sampleVideoUrl,
      views: 987654,
      categoryId: 'documentary'
    },
    {
      id: 'action-short-2',
      title: 'The Getaway',
      description: 'A high-octane chase sequence shot from a first-person perspective. Hold on to your seats!',
      creator: 'POV Action',
      creatorId: 'dev-user',
      duration: '6:45',
      thumbnailUrl: 'https://picsum.photos/seed/action-2/400/225',
      videoUrl: sampleVideoUrl,
      views: 2109876,
      categoryId: 'action'
    },
    {
      id: 'animation-2',
      title: 'City of Lights',
      description: 'A stunning Ghibli-inspired animation showing the magical nightlife of a fantasy city powered by glowing crystals.',
      creator: 'DreamWeaver',
      creatorId: 'dev-user',
      duration: '4:30',
      thumbnailUrl: 'https://picsum.photos/seed/anim-2/400/225',
      videoUrl: sampleVideoUrl,
      views: 1345678,
      categoryId: 'animation'
    },
    {
      id: 'horror-2',
      title: 'Don\'t Look Away',
      description: 'A short horror film about a cursed painting. Once you see it, you can never look away. Based on the popular creepypasta.',
      creator: 'Fright Night Films',
      creatorId: 'dev-user',
      duration: '7:07',
      thumbnailUrl: 'https://picsum.photos/seed/horror-2/400/225',
      videoUrl: sampleVideoUrl,
      views: 999123,
      categoryId: 'horror'
    },
    {
      id: 'embedded-adult-content',
      title: 'Premium Featured Content',
      description: 'Exclusive embedded adult content with high quality streaming and professional production.',
      creator: 'Premium Studios',
      creatorId: 'dev-user',
      duration: '25:33',
      thumbnailUrl: 'https://picsum.photos/seed/premium-1/400/225',
      videoUrl: embeddedVideoUrl,
      views: 523456,
      categoryId: 'action',
      isEmbedded: true,
      embedUrl: embeddedVideoUrl,
      embedProvider: 'adult',
      videoKey: '0ef399b63a72d0e4ab57'
    },
    {
      id: 'sci-fi-3',
      title: 'The Last Data Stream',
      description: 'In a world where memories can be uploaded and stored, a historian discovers a corrupted file that could change the course of history.',
      creator: 'Future Films',
      creatorId: 'dev-user',
      duration: '21:12',
      thumbnailUrl: 'https://picsum.photos/seed/sci-fi-3/400/225',
      videoUrl: sampleVideoUrl,
      views: 1122334,
      categoryId: 'sci-fi'
    },
    {
      id: 'diy-1',
      title: 'Building a Floating Bookshelf',
      description: 'A step-by-step guide to creating a magical-looking floating bookshelf for your home. It\'s easier than you think!',
      creator: 'DIY Creators',
      creatorId: 'dev-user',
      duration: '11:50',
      thumbnailUrl: 'https://picsum.photos/seed/diy-1/400/225',
      videoUrl: sampleVideoUrl,
      views: 432109,
      categoryId: 'documentary' // No DIY category
    },
    {
      id: 'music-1',
      title: 'Lo-Fi Beats to Relax/Study to',
      description: 'A 24/7 stream of calming lo-fi hip hop beats perfect for studying, relaxing, or sleeping. The iconic animation you know and love.',
      creator: 'Chillhop Music',
      creatorId: 'dev-user',
      duration: '120:00',
      thumbnailUrl: 'https://picsum.photos/seed/music-1/400/225',
      videoUrl: sampleVideoUrl,
      views: 102345678,
      categoryId: 'animation'
    },
    {
      id: 'gaming-2',
      title: 'I Played Minecraft for 100 Days...',
      description: 'See what happens in a 100-day hardcore Minecraft challenge. From building a mega-base to fighting the Ender Dragon, this is an epic journey.',
      creator: 'Minecrafter',
      creatorId: 'dev-user',
      duration: '35:40',
      thumbnailUrl: 'https://picsum.photos/seed/gaming-2/400/225',
      videoUrl: sampleVideoUrl,
      views: 8765432,
      categoryId: 'action'
    }
  ];
    
  
  export async function seedDatabase(db: Firestore) {
    const videosCollection = collection(db, 'videos');
    const batch = writeBatch(db);
  
    videosToSeed.forEach((video) => {
      const { id, ...videoData } = video;
      const docRef = doc(videosCollection, id);
      batch.set(docRef, {
          ...videoData,
          uploadedAt: serverTimestamp(),
      });
    });
  
    await batch.commit();
  }

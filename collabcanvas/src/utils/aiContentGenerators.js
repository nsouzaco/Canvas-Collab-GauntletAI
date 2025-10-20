/**
 * AI Content Generators
 * Helper functions for generating context-aware content based on canvas metadata
 */

/**
 * Detect the domain/industry from canvas metadata
 * @param {Object} canvasMetadata - Canvas name and description
 * @returns {string} Detected domain
 */
export const detectDomain = (canvasMetadata) => {
  const { name, description } = canvasMetadata;
  const text = `${name} ${description}`.toLowerCase();
  
  // Fitness/Health (check first as it's more specific)
  if (text.includes('fitness') || text.includes('workout') || text.includes('exercise') ||
      text.includes('health') || text.includes('gym') || text.includes('training') ||
      text.includes('nutrition') || text.includes('diet')) {
    return 'fitness';
  }
  
  // E-commerce/Marketplace
  if (text.includes('shop') || text.includes('buy') || text.includes('sell') || 
      text.includes('marketplace') || text.includes('store') || text.includes('commerce') ||
      text.includes('product') || text.includes('retail')) {
    return 'ecommerce';
  }
  
  // Dating/Social (check after more specific domains)
  if (text.includes('dating') || text.includes('match') || text.includes('tinder') || 
      text.includes('social') || text.includes('meet') || text.includes('connect')) {
    return 'dating';
  }
  
  // Education/Learning
  if (text.includes('learn') || text.includes('education') || text.includes('course') ||
      text.includes('study') || text.includes('school') || text.includes('training') ||
      text.includes('tutorial') || text.includes('skill')) {
    return 'education';
  }
  
  // Productivity/Work
  if (text.includes('productivity') || text.includes('work') || text.includes('office') ||
      text.includes('task') || text.includes('project') || text.includes('management') ||
      text.includes('collaboration') || text.includes('team')) {
    return 'productivity';
  }
  
  // Entertainment/Gaming
  if (text.includes('game') || text.includes('entertainment') || text.includes('fun') ||
      text.includes('play') || text.includes('music') || text.includes('video') ||
      text.includes('streaming') || text.includes('media')) {
    return 'entertainment';
  }
  
  // Finance/Fintech
  if (text.includes('finance') || text.includes('money') || text.includes('bank') ||
      text.includes('payment') || text.includes('investment') || text.includes('budget') ||
      text.includes('crypto') || text.includes('fintech')) {
    return 'finance';
  }
  
  // Travel/Tourism
  if (text.includes('travel') || text.includes('trip') || text.includes('vacation') ||
      text.includes('hotel') || text.includes('booking') || text.includes('tourism') ||
      text.includes('flight') || text.includes('destination')) {
    return 'travel';
  }
  
  // Food/Dining
  if (text.includes('food') || text.includes('restaurant') || text.includes('dining') ||
      text.includes('recipe') || text.includes('cooking') || text.includes('delivery') ||
      text.includes('meal') || text.includes('kitchen')) {
    return 'food';
  }
  
  return 'general';
};

/**
 * Generate persona templates based on domain
 * @param {string} domain - Detected domain
 * @param {string} appName - App name
 * @returns {Array} Array of persona templates
 */
export const getPersonaTemplates = (domain, appName) => {
  const templates = {
    dating: [
      {
        name: 'Sarah, 28',
        items: [
          'Lives in San Francisco, works in tech',
          'Looking for meaningful connections',
          'Limited time for dating due to busy schedule',
          'Prefers video calls before meeting in person',
          'Values authenticity and shared interests'
        ]
      },
      {
        name: 'Mike, 32',
        items: [
          'Lives in Austin, works as a consultant',
          'Career-focused but ready for serious relationship',
          'Tired of superficial dating app interactions',
          'Wants someone with similar life goals',
          'Prefers detailed conversations over quick swipes'
        ]
      }
    ],
    ecommerce: [
      {
        name: 'Emma, 35',
        items: [
          'Lives in Chicago, busy mom of 3',
          'Shops online to save time',
          'Overwhelmed by too many product choices',
          'Reads reviews extensively before buying',
          'Compares prices across multiple sites'
        ]
      },
      {
        name: 'David, 42',
        items: [
          'Lives in Seattle, works in tech',
          'Loves finding innovative products',
          'Frustrated by high prices and slow shipping',
          'Uses multiple devices for shopping',
          'Follows brands on social media for deals'
        ]
      }
    ],
    fitness: [
      {
        name: 'Mary Smith, 46',
        items: [
          'Lives in Virginia, works as a teacher',
          'Mother of 2 kids (ages 8 and 12)',
          'No time to exercise during busy weekdays',
          'Wants quick 15-minute home workouts',
          'Struggles to stay motivated alone'
        ]
      },
      {
        name: 'Lisa, 29',
        items: [
          'Lives in Austin, works remotely',
          'Fitness enthusiast who loves tracking progress',
          'Struggles with inconsistent motivation',
          'Wants effective workouts that fit her schedule',
          'Uses fitness trackers and shares on social media'
        ]
      }
    ],
    education: [
      {
        name: 'Alex, 22',
        items: [
          'College student in Boston',
          'Wants to learn new skills for career',
          'Struggles with information overload',
          'Studies in short bursts between classes',
          'Uses multiple learning platforms'
        ]
      },
      {
        name: 'Maria, 38',
        items: [
          'Lives in Denver, works in marketing',
          'Wants to advance her career',
          'Limited time for learning new technologies',
          'Studies during commute and lunch breaks',
          'Values practical examples and certifications'
        ]
      }
    ],
    productivity: [
      {
        name: 'Tom, 31',
        items: [
          'Lives in Portland, project manager',
          'Wants to increase team efficiency',
          'Frustrated by information silos',
          'Uses multiple tools to stay organized',
          'Values automation and visual organization'
        ]
      },
      {
        name: 'Rachel, 27',
        items: [
          'Freelancer in Miami',
          'Manages multiple clients simultaneously',
          'Struggles with scattered information',
          'Works from multiple locations',
          'Values simple, mobile-friendly tools'
        ]
      }
    ],
    entertainment: [
      {
        name: 'Jake, 24',
        items: [
          'Lives in Los Angeles, college student',
          'Passionate gamer who plays daily',
          'Wants to discover new quality games',
          'Struggles with managing playtime',
          'Shares achievements with friends online'
        ]
      },
      {
        name: 'Sophie, 30',
        items: [
          'Lives in New York, marketing coordinator',
          'Loves discovering new entertainment',
          'Overwhelmed by too many streaming options',
          'Binges content on weekends',
          'Values social features and recommendations'
        ]
      }
    ],
    finance: [
      {
        name: 'Robert, 40',
        items: [
          'Lives in Dallas, financial advisor',
          'Wants to grow wealth and manage risk',
          'Stressed by market volatility',
          'Checks portfolio daily',
          'Values expert analysis and insights'
        ]
      },
      {
        name: 'Jennifer, 26',
        items: [
          'Lives in Phoenix, recent graduate',
          'Wants to build savings and learn investing',
          'Intimidated by complex financial terminology',
          'Prefers simple, educational interfaces',
          'Starts with small investment amounts'
        ]
      }
    ],
    travel: [
      {
        name: 'Mark, 33',
        items: [
          'Lives in Atlanta, sales director',
          'Travels frequently for work',
          'Wants to find best deals and new places',
          'Frustrated by price fluctuations',
          'Books in advance and compares multiple sites'
        ]
      },
      {
        name: 'Anna, 28',
        items: [
          'Lives in San Diego, graphic designer',
          'Loves adventure and new cultures',
          'Concerned about safety and language barriers',
          'Researches destinations extensively',
          'Uses travel apps and shares experiences'
        ]
      }
    ],
    food: [
      {
        name: 'Chris, 34',
        items: [
          'Lives in Portland, chef',
          'Passionate foodie who loves new restaurants',
          'Frustrated by long wait times and high prices',
          'Uses food apps and reads reviews',
          'Takes photos and shares food experiences'
        ]
      },
      {
        name: 'Nina, 29',
        items: [
          'Lives in Boulder, nutritionist',
          'Health-conscious eater and home cook',
          'Struggles with limited healthy options',
          'Checks nutrition facts and uses meal planning apps',
          'Prefers organic and locally sourced food'
        ]
      }
    ],
    general: [
      {
        name: 'User Persona',
        items: [
          'Target user for this application',
          'Wants to achieve specific objectives',
          'Frustrated by current limitations',
          'Uses the app regularly',
          'Values ease of use and efficiency'
        ]
      }
    ]
  };
  
  return templates[domain] || templates.general;
};

/**
 * Generate feature templates based on domain
 * @param {string} domain - Detected domain
 * @param {string} appName - App name
 * @returns {Array} Array of feature templates
 */
export const getFeatureTemplates = (domain, appName) => {
  const templates = {
    dating: [
      'Smart matching algorithm',
      'Video chat integration',
      'Safety verification',
      'Interest-based filters',
      'Real-time messaging',
      'Profile verification',
      'Date planning tools',
      'Compatibility scoring'
    ],
    ecommerce: [
      'Product search and filtering',
      'Shopping cart and checkout',
      'Payment processing',
      'User reviews and ratings',
      'Inventory management',
      'Order tracking',
      'Recommendation engine',
      'Mobile-responsive design'
    ],
    fitness: [
      'Workout tracking',
      'Progress analytics',
      'Personalized plans',
      'Social challenges',
      'Nutrition logging',
      'Wearable integration',
      'Video tutorials',
      'Goal setting'
    ],
    education: [
      'Interactive lessons',
      'Progress tracking',
      'Quizzes and assessments',
      'Certificate generation',
      'Discussion forums',
      'Mobile accessibility',
      'Offline content',
      'Instructor tools'
    ],
    productivity: [
      'Task management',
      'Team collaboration',
      'File sharing',
      'Time tracking',
      'Project templates',
      'Integration APIs',
      'Mobile apps',
      'Analytics dashboard'
    ],
    entertainment: [
      'Content discovery',
      'Personalized recommendations',
      'Social sharing',
      'Offline viewing',
      'Multiple device sync',
      'User reviews',
      'Content creation tools',
      'Live streaming'
    ],
    finance: [
      'Account management',
      'Transaction tracking',
      'Investment tools',
      'Budget planning',
      'Security features',
      'Mobile banking',
      'Financial insights',
      'Bill reminders'
    ],
    travel: [
      'Destination search',
      'Booking management',
      'Itinerary planning',
      'Price alerts',
      'Reviews and ratings',
      'Mobile check-in',
      'Travel guides',
      'Group booking'
    ],
    food: [
      'Restaurant discovery',
      'Menu browsing',
      'Online ordering',
      'Delivery tracking',
      'Reviews and ratings',
      'Loyalty programs',
      'Nutrition information',
      'Social features'
    ],
    general: [
      'User authentication',
      'Profile management',
      'Search functionality',
      'Mobile responsiveness',
      'Data security',
      'User feedback',
      'Analytics tracking',
      'API integration'
    ]
  };
  
  return templates[domain] || templates.general;
};

/**
 * Generate user story templates based on domain
 * @param {string} domain - Detected domain
 * @param {string} appName - App name
 * @returns {Array} Array of user story templates
 */
export const getUserStoryTemplates = (domain, appName) => {
  const templates = {
    dating: [
      'As a user, I want to create an authentic profile so that I can attract compatible matches',
      'As a user, I want to filter potential matches by interests so that I can find people with similar hobbies',
      'As a user, I want to chat with matches before meeting so that I can build trust and connection',
      'As a user, I want to report inappropriate behavior so that I can feel safe using the app'
    ],
    ecommerce: [
      'As a customer, I want to search for products easily so that I can find what I need quickly',
      'As a customer, I want to read reviews before buying so that I can make informed decisions',
      'As a customer, I want to track my orders so that I know when they will arrive',
      'As a customer, I want to save items for later so that I can purchase them when ready'
    ],
    fitness: [
      'As a user, I want to track my workouts so that I can monitor my progress over time',
      'As a user, I want to set fitness goals so that I can stay motivated and focused',
      'As a user, I want to log my nutrition so that I can maintain a healthy diet',
      'As a user, I want to join challenges so that I can stay engaged with the community'
    ],
    education: [
      'As a student, I want to access course materials anywhere so that I can learn on the go',
      'As a student, I want to track my progress so that I can see how much I have learned',
      'As a student, I want to take quizzes so that I can test my understanding',
      'As a student, I want to interact with other learners so that I can collaborate and learn together'
    ],
    productivity: [
      'As a user, I want to create and manage tasks so that I can stay organized',
      'As a user, I want to collaborate with team members so that we can work together efficiently',
      'As a user, I want to track time spent on projects so that I can bill clients accurately',
      'As a user, I want to set reminders so that I don\'t miss important deadlines'
    ],
    entertainment: [
      'As a user, I want to discover new content so that I can find entertainment I enjoy',
      'As a user, I want to create playlists so that I can organize my favorite content',
      'As a user, I want to share content with friends so that we can enjoy it together',
      'As a user, I want to download content for offline viewing so that I can watch without internet'
    ],
    finance: [
      'As a user, I want to view all my accounts in one place so that I can manage my finances easily',
      'As a user, I want to set up automatic payments so that I don\'t miss bill due dates',
      'As a user, I want to track my spending so that I can stay within my budget',
      'As a user, I want to receive alerts for unusual activity so that I can protect my accounts'
    ],
    travel: [
      'As a traveler, I want to search for flights and hotels so that I can plan my trip',
      'As a traveler, I want to compare prices so that I can find the best deals',
      'As a traveler, I want to create itineraries so that I can organize my activities',
      'As a traveler, I want to read reviews so that I can choose the best accommodations'
    ],
    food: [
      'As a food lover, I want to discover new restaurants so that I can try different cuisines',
      'As a customer, I want to order food online so that I can enjoy meals at home',
      'As a diner, I want to read reviews so that I can choose quality restaurants',
      'As a user, I want to track my orders so that I know when my food will arrive'
    ],
    general: [
      'As a user, I want to easily navigate the app so that I can find what I need quickly',
      'As a user, I want to customize my experience so that the app works for my needs',
      'As a user, I want to get help when I need it so that I can use the app effectively',
      'As a user, I want to sync my data across devices so that I can access it anywhere'
    ]
  };
  
  return templates[domain] || templates.general;
};

/**
 * Generate pain point templates based on domain
 * @param {string} domain - Detected domain
 * @param {string} appName - App name
 * @returns {Array} Array of pain point templates
 */
export const getPainPointTemplates = (domain, appName) => {
  const templates = {
    dating: [
      'Difficulty finding genuine connections',
      'Safety concerns with online dating',
      'Limited time for dating activities',
      'Dating app fatigue and burnout',
      'Mismatched expectations',
      'Privacy and data security concerns'
    ],
    ecommerce: [
      'Overwhelming product choices',
      'Trust issues with online purchases',
      'Poor product descriptions',
      'Slow or expensive shipping',
      'Difficulty finding the right size/fit',
      'Return and refund complications'
    ],
    fitness: [
      'Lack of motivation to exercise',
      'Difficulty finding time for workouts',
      'Inconsistent progress tracking',
      'Limited access to equipment',
      'Confusion about proper form',
      'Difficulty staying accountable'
    ],
    education: [
      'Information overload',
      'Difficulty staying focused',
      'Limited interaction with instructors',
      'Technical difficulties',
      'Lack of practical application',
      'Difficulty balancing learning with other commitments'
    ],
    productivity: [
      'Information scattered across tools',
      'Difficulty prioritizing tasks',
      'Poor team communication',
      'Time management challenges',
      'Tool fatigue and complexity',
      'Difficulty tracking progress'
    ],
    entertainment: [
      'Too many content options',
      'Poor recommendation algorithms',
      'Subscription fatigue',
      'Difficulty finding quality content',
      'Limited offline access',
      'Inconsistent content quality'
    ],
    finance: [
      'Complex financial terminology',
      'Fear of making wrong decisions',
      'Limited financial knowledge',
      'Security concerns',
      'Difficulty tracking expenses',
      'Overwhelming investment options'
    ],
    travel: [
      'Price fluctuations',
      'Complex booking processes',
      'Safety concerns',
      'Language barriers',
      'Cultural differences',
      'Unexpected travel disruptions'
    ],
    food: [
      'Limited healthy options',
      'Long wait times',
      'High delivery fees',
      'Food quality concerns',
      'Limited dietary accommodations',
      'Difficulty finding authentic cuisine'
    ],
    general: [
      'Complex user interface',
      'Slow loading times',
      'Poor customer support',
      'Limited functionality',
      'Data privacy concerns',
      'Difficulty learning how to use the app'
    ]
  };
  
  return templates[domain] || templates.general;
};

/**
 * Generate competitive analysis templates based on domain
 * @param {string} domain - Detected domain
 * @param {string} appName - App name
 * @returns {Array} Array of competitive analysis templates
 */
export const getCompetitiveAnalysisTemplates = (domain, appName) => {
  const templates = {
    dating: [
      'Tinder - Largest user base, simple swiping interface',
      'Bumble - Women-first approach, professional networking',
      'Hinge - Relationship-focused, detailed profiles',
      'Match.com - Traditional dating site, comprehensive matching',
      'OkCupid - Detailed compatibility questions, free features'
    ],
    ecommerce: [
      'Amazon - Largest marketplace, fast shipping, Prime benefits',
      'eBay - Auction model, unique items, seller marketplace',
      'Shopify - E-commerce platform for businesses',
      'Etsy - Handmade and vintage items, creative community',
      'Walmart - Physical store integration, competitive pricing'
    ],
    fitness: [
      'MyFitnessPal - Comprehensive nutrition tracking',
      'Nike Training Club - Free workouts, brand integration',
      'Peloton - Premium equipment and classes',
      'Strava - Social fitness tracking, community features',
      'Fitbit - Wearable integration, health insights'
    ],
    education: [
      'Coursera - University partnerships, certificates',
      'Udemy - Wide variety of courses, affordable pricing',
      'Khan Academy - Free educational content, K-12 focus',
      'LinkedIn Learning - Professional development, business focus',
      'MasterClass - Celebrity instructors, high-quality production'
    ],
    productivity: [
      'Slack - Team communication, integrations',
      'Trello - Visual project management, Kanban boards',
      'Asana - Task and project management, team collaboration',
      'Notion - All-in-one workspace, note-taking',
      'Monday.com - Work management platform, automation'
    ],
    entertainment: [
      'Netflix - Original content, global reach',
      'Disney+ - Family-friendly content, Disney properties',
      'Spotify - Music streaming, podcast integration',
      'YouTube - User-generated content, free access',
      'Twitch - Live streaming, gaming focus'
    ],
    finance: [
      'Mint - Personal finance management, budgeting',
      'Robinhood - Commission-free trading, mobile-first',
      'PayPal - Digital payments, online transactions',
      'Venmo - Social payments, peer-to-peer transfers',
      'Chase Mobile - Traditional banking, mobile access'
    ],
    travel: [
      'Expedia - Travel booking platform, package deals',
      'Airbnb - Alternative accommodations, local experiences',
      'Booking.com - Hotel reservations, global reach',
      'Kayak - Price comparison, travel search',
      'TripAdvisor - Reviews and recommendations, travel planning'
    ],
    food: [
      'Uber Eats - Food delivery, restaurant partnerships',
      'DoorDash - Food delivery, local restaurant focus',
      'Grubhub - Food delivery, restaurant ordering',
      'Yelp - Restaurant reviews, local business discovery',
      'OpenTable - Restaurant reservations, dining experiences'
    ],
    general: [
      'Competitor A - Market leader, strong brand recognition',
      'Competitor B - Innovative features, growing user base',
      'Competitor C - Niche focus, specialized functionality',
      'Competitor D - Free tier, freemium model',
      'Competitor E - Enterprise focus, B2B solutions'
    ]
  };
  
  return templates[domain] || templates.general;
};

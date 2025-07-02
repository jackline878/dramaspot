'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const categories = [
      {
        name: 'News',
        description: 'Latest celebrity breaking news',
        subcategories: [
  'Legal Drama',
  'Emergency Room Visits',
  'Arrests & Police Reports',
  'Sudden Breakups or Fights',
  'Surprise Marriages or Elopements',
  'Celebrity Deaths & Tributes',
  'Scandals Breaking Online',
  'Cancelled Shows or Tours',
  'Sudden Career Moves',
  'Public Outbursts or Meltdowns',
  'Unplanned Live Announcements',
  'Breaking Social Media Posts',
  'Injuries on Set or Stage',
  'Unverified Leaks or Footage',
  'Paparazzi Confrontations',
  'Airport or Travel Drama',
  'Court Rulings or Judgments'
]

      },
      {
        name: 'Interviews',
        description: 'Exclusive interviews and talk shows',
        subcategories: [
  'Talk Shows',
  'Podcast Appearances',
  'Magazine Features',
  'Red Carpet Interviews',
  'YouTube Interviews',
  'Radio Shows',
  'Panel Discussions',
  'Behind-the-Scenes Chats',
  'Virtual Interviews',
  'Press Conferences',
  'Instagram Live Sessions',
  'Twitter Q&A Sessions',
  'Fan Meet & Greets',
  'Exclusive Sit-downs',
  'Documentary Interviews',
  'Late Night TV Appearances'
]

      },
      {
        name: 'Relationships & Love Life',
        description: 'Romantic updates of celebrities',
        subcategories: [
  'New Couples',
  'Breakups & Divorces',
  'Engagement Announcements',
  'Secret Relationships',
  'Public PDA Moments',
  'Relationship Rumors',
  'Reconciliations',
  'Love Triangles',
  'Dating History',
  'Celebrity Crushes',
  'Private Weddings',
  'Cheating Scandals',
  'Couples Therapy Stories',
  'Anniversary Celebrations',
  'Relationship Advice from Celebs'
]
      },
      {
        name: 'Red Carpet & Events',
        description: 'Celebrity appearances and events',
        subcategories: [
  'Award Shows',
  'Fashion Shows',
  'Movie Premieres',
  'Charity Galas',
  'Album Launches',
  'TV Show Launches',
  'Celebrity Weddings',
  'Celebrity Birthday Parties',
  'Festival Appearances',
  'VIP Parties',
  'Press Junkets',
  'Fan Conventions',
  'Brand Endorsement Events',
  'After Parties',
  'Runway Appearances',
  'Pop-up Events'
]

      },
      {
  name: 'Fashion & Style',
  description: 'Celebrity style trends and outfits',
  subcategories: [
    'Outfit of the Day',
    'Worst Dressed',
    'Street Style',
    'Fashion Trends',
    'Designer Collabs',
    'Red Carpet Looks',
    'Behind the Looks',
    'Fashion Fails',
    'Celebrity Stylists',
    'Wardrobe Makeovers'
  ]
}
,
      {
  name: 'Scandals & Controversies',
  description: 'Shocking celebrity controversies',
  subcategories: [
    'Social Media Feuds',
    'Legal Troubles',
    'Cheating Scandals',
    'Canceled Celebs',
    'PR Disasters',
    'Leaked Footage',
    'Public Apologies',
    'Controversial Statements',
    'Behind-the-Scenes Drama',
    'Feuds with Paparazzi'
  ]
},
      {
        name: 'Trend Tips & Hacks',
        description: 'Latest advice and insights on celebrity trends and styles',
        subcategories: [
    "Seasonal Fashion",
    "Makeup Tutorials",
    "Hair Styling Tips",
    "Accessory Trends",
    "Fitness & Wellness Hacks",
    "Gadget & Tech Trends",
    "Celebrity Skincare Secrets",
    "Wardrobe Essentials",
    "Style Dos and Don’ts",
    "Event Look Inspirations"
  ]
      },
      {
  name: 'Celebrity Lifestyle',
  description: 'Inside the life of your favorite stars',
  subcategories: [
    'Homes & Interiors',
    'Luxury Cars',
    'Vacation Spots',
    'Fitness Routines',
    'Private Jets',
    'Daily Routines',
    'Yacht Parties',
    'Personal Chefs',
    'Wellness Practices',
    'Exclusive Hobbies'
  ]
}
,
      {
  name: 'Movies & TV',
  description: 'All about celebrity movies and TV shows',
  subcategories: [
    'Movie Releases',
    'TV Drama',
    'Behind the Scenes',
    'Casting News',
    'Trailers & Teasers',
    'Box Office Updates',
    'Film Festivals',
    'Director Interviews',
    'Series Renewals & Cancellations',
    'Streaming Platform Exclusives'
  ]
}
,
      {
  name: 'Music & Concerts',
  description: 'Celebrity music updates and performances',
  subcategories: [
    'New Albums',
    'Live Performances',
    'Music Videos',
    'Concert Tours',
    'Award Show Performances',
    'Behind the Scenes',
    'Collaborations',
    'Song Releases',
    'Music Charts',
    'Festival Highlights'
  ]
}
,
      {
  name: 'Social Media Buzz',
  description: 'Trending celebrity social media moments',
  subcategories: [
    'Instagram Trends',
    'TikTok Moments',
    'Viral Tweets',
    'Snapchat Stories',
    'YouTube Highlights',
    'Fan Reactions',
    'Memes & Challenges',
    'Social Media Scandals',
    'Live Streams',
    'Hashtag Campaigns'
  ]
}
,
      {
  name: 'Throwback & Nostalgia',
  description: 'Old school celebrity memories',
  subcategories: [
    'Before Fame',
    '90s Throwbacks',
    'Vintage Photos',
    'Classic Interviews',
    'Iconic Moments',
    'Retro Fashion',
    'Old Movie Clips',
    'Legendary Performances',
    'Celebrity Flashbacks',
    'Milestone Anniversaries'
  ]
}
,
      {
  name: 'Health & Wellness',
  description: 'Celebrity health, fitness, and diet',
  subcategories: [
    'Fitness Routines',
    'Diet Plans',
    'Mental Health',
    'Wellness Tips',
    'Yoga & Meditation',
    'Detox & Cleanses',
    'Beauty Secrets',
    'Medical Updates',
    'Healthy Lifestyle',
    'Supplements & Vitamins'
  ]
}
,
      {
  name: 'Awards & Achievements',
  description: 'Celebrity wins and recognitions',
  subcategories: [
    'Grammys',
    'Oscars',
    'Emmys',
    'Golden Globes',
    'MTV Awards',
    'BAFTA',
    'Cannes Film Festival',
    'Billboard Music Awards',
    'Tony Awards',
    'Sports Awards'
  ]
}
,
      {
  name: 'Baby & Family News',
  description: 'Celebrity babies, parenting, and families',
  subcategories: [
    'Pregnancy Announcements',
    'Family Outings',
    'Baby Milestones',
    'Parenting Tips',
    'Adoptions & Surrogacy',
    'Family Celebrations',
    'Celebrity Kids',
    'Parent-Child Activities',
    'Relationship with Family',
    'Baby Showers'
  ]
}
,
      {
  name: 'Exclusives',
  description: 'Unconfirmed celebrity scoops',
  subcategories: [
    'Secret Projects',
    'Dating Rumors',
    'Behind-the-Scenes Gossip',
    'Upcoming Collaborations',
    'Mystery Relationships',
    'Unannounced Breakups',
    'Hidden Feuds',
    'Possible Comebacks',
    'Leaked Photos',
    'Industry Buzz'
  ]
}
,
      {
        name: 'User Polls & Opinions',
        description: 'What fans think about celebrities',
        subcategories: [
    "Favorite Couple",
    "Best Dressed Votes",
    "Most Influential Celebrity",
    "Biggest Fashion Fail",
    "Most Talked About Scandal",
    "Hottest Newcomer",
    "Fans’ Choice Award",
    "Social Media Star of the Month",
    "Most Inspirational Celebrity",
    "Funniest Celebrity Moment"
  ]
      },
      {
        name: 'Celebrity Philanthropy',
        description: 'Celebrities giving back to society',
        subcategories: [
  'Charity Events',
  'Fundraising Campaigns',
  'Non-Profit Work',
  'Awareness Campaigns',
  'Celebrity Foundations',
  'Volunteer Work',
  'Disaster Relief Efforts',
  'Advocacy for Causes',
  'Environmental Initiatives',
  'Health Awareness Campaigns',
  'Education Initiatives',
  'Youth Programs',
  'Animal Welfare',
  'Cultural Preservation',
  'Global Health Initiatives',
  'Community Development'
]
      },
      {
        name: 'Celebrity Travel',
        description: 'Where celebrities are traveling to',
        subcategories: [
  'Luxury Vacations',
  'Exotic Destinations',
  'Celebrity Getaways',
  'Travel Tips from Celebs',
  'Travel Vlogs',
  'Behind-the-Scenes Travel',
  'Celebrity Travel Diaries',
  'Traveling with Family',
  'Traveling for Work',
  'Traveling for Charity',
  'Traveling for Filming',
  'Traveling for Events',
  'Traveling for Fashion',
  'Traveling for Music',
  'Traveling for Wellness',
  'Traveling for Sports'
]
      },
      {
        name: 'Celebrity Technology',
        description: 'Celebrities and their tech interests',
        subcategories: [
  'Tech Gadgets',
  'Social Media Innovations',
  'Celebrity Apps',
  'Virtual Reality Experiences',
  'Tech Startups',
  'AI in Entertainment',
  'Gaming Interests',
  'Tech Philanthropy',
  'Digital Art',
  'Online Platforms',
  'Tech Collaborations',
  'Tech Conferences',
  'Tech Influencers',
  'Tech Reviews',
  'Tech Trends',
  'Tech in Fashion'
]
      },
      {
        name: 'Celebrity Art & Culture',
        description: 'Celebrities in the art and culture scene',
        subcategories: [
  'Art Exhibitions',
  'Cultural Festivals',
  'Celebrity Artists',
  'Cultural Collaborations',
  'Art Auctions',
  'Cultural Heritage',
  'Celebrity Curators',
  'Art Installations',
  'Cultural Critiques',
  'Cultural Documentaries',
  'Cultural Influences',
  'Cultural Preservation',
  'Cultural Education',
  'Cultural Advocacy',
  'Cultural Exchange',
  'Cultural Trends'
]
      },
      {
        name: 'Celebrity Sports',
        description: 'Celebrities and their sports interests',
        subcategories: [
  'Celebrity Athletes',
  'Sports Events',
  'Fitness Routines',
  'Sports Sponsorships',
  'Sports Collaborations',
  'Sports Philanthropy',
  'Sports Fashion',
  'Sports Endorsements',
  'Sports Documentaries',
  'Sports Interviews',
  'Sports Fan Engagement',
  'Sports Training',
  'Sports Technology',
  'Sports Trends',  
  'Sports Culture',
  'Sports Lifestyle'
]
      },
      {
        name: 'Celebrity Food & Dining',
        description: 'Celebrities and their culinary interests',
        subcategories: [
  'Celebrity Chefs',
  'Food Trends',
  'Restaurant Openings',
  'Cooking Shows',
  'Food Collaborations',
  'Food Photography',
  'Food Reviews',
  'Food Festivals',
  'Food Philanthropy',
  'Food Documentaries',
  'Food Blogs',
  'Food Vlogs',
  'Food Culture',
  'Food Trends',
  'Food Lifestyle', 
  'Food Influencers'
]
      },
      {
        name: 'Celebrity Home & Garden',
        description: 'Celebrities and their home and garden interests',
        subcategories: [
  'Home Renovations',
  'Interior Design',
  'Garden Design',
  'Home Decor Trends',
  'Celebrity Homes',
  'Sustainable Living',
  'Home Automation',
  'Celebrity Gardens',
  'Home Improvement Tips',
  'Home Organization',
  'Home Security',
  'Home Technology',
  'Home Renovation Shows',
  'Home and Garden Collaborations',
  'Home and Garden Trends',
  'Home and Garden Lifestyle'
]
      },
      {
        name: 'Celebrity Pets',
        description: 'Celebrities and their furry friends',
        subcategories: [
  'Celebrity Pets',
  'Pet Care Tips',
  'Pet Fashion',
  'Pet Adoption',
  'Pet Training',
  'Pet Health', 
  'Pet Nutrition',
  'Pet Photography',
  'Pet Travel',
  'Pet Philanthropy',
  'Pet Grooming',
  'Pet Products', 
  'Pet Trends',
  'Pet Lifestyle',
  'Pet Influencers',
  'Pet Culture'
]
      },
      {
        name: 'Celebrity Gaming',
        description: 'Celebrities and their gaming interests',
        subcategories: [
  'Gaming Collaborations',
  'Gaming Events',
  'Gaming Streams',
  'Gaming Reviews',
  'Gaming Trends',
  'Gaming Culture',
  'Gaming Technology',
  'Gaming Influencers',
  'Gaming Communities',
  'Gaming Merchandise', 
  'Gaming Sponsorships',
  'Gaming Philanthropy',
  'Gaming Lifestyle',
  'Gaming Esports',
  'Gaming Podcasts',
  'Gaming Documentaries'
]
      },
      {
        name: 'Celebrity Education & Learning',
        description: 'Celebrities and their educational interests',
        subcategories: [
  'Celebrity Scholars',
  'Educational Initiatives',
  'Online Courses',
  'Educational Collaborations',
  'Educational Podcasts',
  'Educational Documentaries',
  'Educational Blogs',
  'Educational Vlogs',
  'Educational Trends',
  'Educational Technology',
  'Educational Philanthropy',
  'Educational Influencers',
  'Educational Culture',
  'Educational Lifestyle',
  'Educational Communities',
  'Educational Resources'
]
      },
      {
        name: 'Celebrity Activism',
        description: 'Celebrities and their activism efforts',
        subcategories: [
  'Social Justice',
  'Environmental Activism',
  'Political Activism',
  'Human Rights',
  'Animal Rights',
  'Health Advocacy',
  'Education Advocacy',
  'Cultural Advocacy',
  'Economic Advocacy',
  'Community Advocacy',
  'Celebrity Activists',
  'Activism Collaborations',
  'Activism Campaigns',
  'Activism Events',
  'Activism Trends',
  'Activism Lifestyle'
]
      }
    ];

    for (const cat of categories) {
      // 1. Insert category
      await queryInterface.bulkInsert('Categories', [{
        name: cat.name,
        description: cat.description,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});

      // 2. Query inserted category to get id
      const [categoryRecord] = await queryInterface.sequelize.query(
        `SELECT id FROM Categories WHERE name = :name LIMIT 1`,
        {
          replacements: { name: cat.name },
          type: queryInterface.sequelize.QueryTypes.SELECT
        }
      );

      // 3. Prepare subcategories with category_id
      const subcategories = cat.subcategories.map(name => ({
        name,
        description: `${name} under ${cat.name}`,
        category_id: categoryRecord.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // 4. Insert subcategories
      await queryInterface.bulkInsert('Subcategories', subcategories, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Subcategories', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
  }
};

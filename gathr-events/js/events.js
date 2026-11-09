/* ------------------------------------------------------------------
   Event data
   Dates are stored as "daysFromNow" so the demo always shows upcoming
   events (and live countdowns) no matter when the site is opened.
   In a real app this would come from an API / database.
------------------------------------------------------------------- */
const CATEGORIES = ['Tech', 'Music', 'Business', 'Art', 'Sports', 'Food', 'Workshop'];

const EVENTS = [
  {
    id: 'ai-cloud-summit',
    title: 'AI & Cloud Summit 2026',
    category: 'Tech',
    daysFromNow: 21,
    time: '09:30',
    duration: '2 days',
    venue: 'Skyline Convention Hall',
    city: 'Bhubaneswar',
    price: 799,
    seats: 300,
    taken: 212,
    featured: true,
    image: 'images/ai-cloud-summit.svg',
    short: 'Two days of talks, demos and hands-on labs on applied AI and cloud engineering.',
    description:
      'Join engineers, founders and researchers for keynotes on generative AI, scalable cloud architecture and responsible ML. Attend live demos, pick up skills in hands-on labs and meet hiring teams from fast-growing companies.',
    highlights: ['12 expert talks & 4 labs', 'Startup demo floor', 'Lunch and certificate included']
  },
  {
    id: 'sunset-indie-fest',
    title: 'Sunset Indie Music Fest',
    category: 'Music',
    daysFromNow: 14,
    time: '17:00',
    duration: '6 hours',
    venue: 'Lakeside Amphitheatre',
    city: 'Bhubaneswar',
    price: 499,
    seats: 500,
    taken: 341,
    featured: true,
    image: 'images/sunset-indie-fest.svg',
    short: 'Eight indie bands, food trucks and golden-hour vibes by the lake.',
    description:
      'An open-air evening celebrating independent music. Eight bands across two stages, local food trucks, a flea market and a sunset set you will not forget. Bring a blanket and good company.',
    highlights: ['8 live acts on 2 stages', 'Food trucks & flea market', 'Open-air seating']
  },
  {
    id: 'codestorm-hackathon',
    title: 'CodeStorm 24h Hackathon',
    category: 'Tech',
    daysFromNow: 9,
    time: '09:00',
    duration: '24 hours',
    venue: 'Innovation Hub, Block C',
    city: 'Bhubaneswar',
    price: 299,
    seats: 150,
    taken: 118,
    featured: true,
    image: 'images/codestorm-hackathon.svg',
    short: 'Build something useful in 24 hours. Teams, mentors, snacks and prizes.',
    description:
      'Form a team of up to four and build a working prototype around themes announced at kickoff. Mentors from industry will be around all night, meals are covered, and the best projects win cash prizes and incubation support.',
    highlights: ['Teams of 1 to 4', 'Mentors on site all night', 'Prizes worth ₹1,00,000']
  },
  {
    id: 'startup-pitch-night',
    title: 'Startup Pitch Night',
    category: 'Business',
    daysFromNow: 5,
    time: '18:00',
    duration: '3 hours',
    venue: "The Founders' Loft",
    city: 'Bhubaneswar',
    price: 0,
    seats: 80,
    taken: 51,
    featured: false,
    image: 'images/startup-pitch-night.svg',
    short: 'Ten early-stage startups pitch to a panel of investors and operators.',
    description:
      'Watch ten startups give five-minute pitches followed by candid feedback from the panel. Stay for networking over snacks, whether you are raising, hiring or just curious.',
    highlights: ['10 live pitches', 'Investor Q&A panel', 'Networking mixer']
  },
  {
    id: 'jazz-and-chai',
    title: 'Jazz & Chai Evening',
    category: 'Music',
    daysFromNow: 7,
    time: '19:00',
    duration: '3 hours',
    venue: 'Café Monsoon',
    city: 'Bhubaneswar',
    price: 249,
    seats: 60,
    taken: 57,
    featured: false,
    image: 'images/jazz-and-chai.svg',
    short: 'A cosy live-jazz set with unlimited masala chai and small plates.',
    description:
      'A relaxed, intimate evening with a live jazz quartet. Settle into the lounge seating, enjoy unlimited masala chai and small plates, and let the music do the rest. Seats are very limited.',
    highlights: ['Live jazz quartet', 'Unlimited chai & snacks', 'Only 60 seats']
  },
  {
    id: 'ux-design-workshop',
    title: 'UI/UX Design Workshop',
    category: 'Workshop',
    daysFromNow: 12,
    time: '10:00',
    duration: '5 hours',
    venue: 'Studio Pixel',
    city: 'Bhubaneswar',
    price: 399,
    seats: 40,
    taken: 22,
    featured: false,
    image: 'images/ux-design-workshop.svg',
    short: 'Go from user research to a clickable prototype in a single day.',
    description:
      'A practical workshop for beginners and career switchers. Learn user research basics, wireframing, visual hierarchy and prototyping in Figma, then present your design for live feedback.',
    highlights: ['Hands-on Figma practice', 'Portfolio-ready project', 'Bring your own laptop']
  },
  {
    id: 'street-food-carnival',
    title: 'Street Food Carnival',
    category: 'Food',
    daysFromNow: 18,
    time: '12:00',
    duration: '10 hours',
    venue: 'Riverside Grounds',
    city: 'Bhubaneswar',
    price: 99,
    seats: 800,
    taken: 430,
    featured: false,
    image: 'images/street-food-carnival.svg',
    short: 'Sixty stalls, regional specialities, live cooking and dessert alley.',
    description:
      'A full day of flavour with sixty stalls serving regional street food, live cooking demonstrations, a dessert alley and games for kids. Entry ticket includes two tasting coupons.',
    highlights: ['60+ food stalls', 'Live cooking shows', '2 tasting coupons included']
  },
  {
    id: 'sourdough-masterclass',
    title: 'Sourdough Baking Masterclass',
    category: 'Food',
    daysFromNow: 16,
    time: '15:00',
    duration: '3 hours',
    venue: 'The Flour Lab',
    city: 'Bhubaneswar',
    price: 899,
    seats: 20,
    taken: 9,
    featured: false,
    image: 'images/sourdough-masterclass.svg',
    short: 'Make your own starter and bake a loaf to take home.',
    description:
      'Learn how to feed and maintain a starter, shape dough and bake a crusty loaf. Every participant takes home a jar of starter, a loaf and a printed recipe guide.',
    highlights: ['Take-home starter & loaf', 'Small batch of 20', 'All ingredients provided']
  },
  {
    id: 'contemporary-art-expo',
    title: 'Contemporary Art Expo',
    category: 'Art',
    daysFromNow: 26,
    time: '11:00',
    duration: '3 days',
    venue: 'Gallery Verde',
    city: 'Bhubaneswar',
    price: 149,
    seats: 200,
    taken: 64,
    featured: false,
    image: 'images/contemporary-art-expo.svg',
    short: 'Paintings, sculpture and installations from 40 emerging artists.',
    description:
      'Explore new work from forty emerging artists across painting, sculpture, digital media and installation. Meet the artists, join guided walkthroughs and take part in a live mural session.',
    highlights: ['40 emerging artists', 'Guided walkthroughs', 'Live mural session']
  },
  {
    id: 'photo-walk',
    title: 'Heritage Photography Walk',
    category: 'Art',
    daysFromNow: 3,
    time: '06:30',
    duration: '3 hours',
    venue: 'Old Town Heritage Gate',
    city: 'Bhubaneswar',
    price: 0,
    seats: 30,
    taken: 14,
    featured: false,
    image: 'images/photo-walk.svg',
    short: 'Chase the morning light through the old town with a pro photographer.',
    description:
      'Walk through the old town at sunrise with a working photographer who will share composition and light tips along the way. Any camera, including your phone, is welcome.',
    highlights: ['Pro photographer guide', 'All cameras welcome', 'Free entry']
  },
  {
    id: 'city-marathon-10k',
    title: 'City Marathon 10K',
    category: 'Sports',
    daysFromNow: 30,
    time: '05:30',
    duration: '4 hours',
    venue: 'Central Park, Gate 2',
    city: 'Bhubaneswar',
    price: 250,
    seats: 1000,
    taken: 587,
    featured: false,
    image: 'images/city-marathon-10k.svg',
    short: 'A timed 10K through the city, with 5K fun-run and hydration stations.',
    description:
      'Run the 10K or join the 5K fun run. Timing chips, hydration stations, finisher medals and a post-race breakfast are included. All fitness levels welcome.',
    highlights: ['Timing chip & medal', 'Hydration every 2 km', 'Post-race breakfast']
  },
  {
    id: 'women-in-leadership',
    title: 'Women in Leadership Forum',
    category: 'Business',
    daysFromNow: 35,
    time: '10:00',
    duration: '1 day',
    venue: 'Grand Meridian Ballroom',
    city: 'Bhubaneswar',
    price: 599,
    seats: 250,
    taken: 96,
    featured: false,
    image: 'images/women-in-leadership.svg',
    short: 'Keynotes, panels and mentoring circles with leaders across industries.',
    description:
      'A day of keynotes, candid panels and small mentoring circles with women leaders from technology, finance, healthcare and public service. Leave with a stronger network and practical playbooks.',
    highlights: ['Keynotes & panels', 'Mentoring circles', 'Networking lunch']
  }
];

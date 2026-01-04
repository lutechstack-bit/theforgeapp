export interface MentorBrand {
  name: string;
  logoUrl?: string;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  roles: string[];
  imageUrl: string;
  bio: string[];
  brands: MentorBrand[];
}

export const mentorsData: Mentor[] = [
  {
    id: 'ranjini',
    name: 'Ranjini Ramesh',
    title: 'Director | Editor | Photographer',
    roles: ['Director', 'Editor', 'Photographer'],
    imageUrl: '/images/mentors/ranjini.png',
    bio: [
      'Worked as a Co-director and Associate director in several Tamil feature films like Maara, and Sorgavaasal.',
      "Directed and Edited commercials for Anirudh Ravichander's brand Piece of Rock and Hukum Tour.",
      'Freelance Editing and Photography work including artists like Shraddha Srinath.',
    ],
    brands: [
      { name: 'Maara' },
      { name: 'Hukum' },
      { name: 'Shraddha Srinath' },
    ],
  },
  {
    id: 'prashanth',
    name: 'Prashanth G',
    title: 'Writer | Creative Director | Producer',
    roles: ['Writer', 'Creative Director', 'Producer'],
    imageUrl: '/images/mentors/prashanth.png',
    bio: [
      'Former Creative Director and Content Manager at ZEE 5 Tamil for multiple web series & Executive Producer for May6 Entertainment, Showrunner for their projects with MX Player.',
      'Youngest Contestant in Naalaya Iyakkunar Season 3: Made 6 short films in 2016, one of them hit 1M views.',
      'Freelance Writing and Direction for Music Videos, 30+ Ads including Zomato, CRED and Think Music.',
    ],
    brands: [
      { name: 'MX Player' },
      { name: 'ZEE5' },
      { name: 'IPL' },
      { name: 'CRED' },
      { name: 'Zomato' },
    ],
  },
  {
    id: 'bavithravanan',
    name: 'Bavithravanan J',
    title: 'Cinematographer | Creative Director | Photographer',
    roles: ['Cinematographer', 'Creative Director', 'Photographer'],
    imageUrl: '/images/mentors/bavithravanan.png',
    bio: [
      '14+ years of experience in creative and visual storytelling.',
      'Assistant cinematographer on GameOver Feature Film Starring Tapsee Pannu.',
      "DOP of Lokesh Kanagaraj's filmmaking masterclass and all LevelUp Learning masterclasses and productions.",
      'Shot for several advertisements and broadcast media, including TEDx India and others.',
    ],
    brands: [
      { name: 'GameOver' },
      { name: 'TEDx' },
      { name: 'LevelUp' },
    ],
  },
  {
    id: 'rahul',
    name: 'Rahul Srinivas',
    title: 'Storyteller | Producer | Entrepreneur',
    roles: ['Storyteller', 'Producer', 'Entrepreneur'],
    imageUrl: '/images/mentors/rahul.png',
    bio: [
      "Runs India's largest and fastest-growing filmmaking community with over 20,000 Writers, Directors, Storytellers, Editors and more.",
      'Directed and produced the masterclasses of Karthik Subbaraj, G Venket Ram, Anthony Gonsalvez, DRK Kiran, Ravi Basrur and Lokesh Kanagaraj.',
      'Maestro of Modern Storytelling and Entrepreneurship having taught over 2100+ students online and offline.',
    ],
    brands: [
      { name: 'TEDx' },
      { name: 'LevelUp' },
      { name: 'StarDa' },
    ],
  },
  {
    id: 'praveen-r',
    name: 'Praveen R',
    title: 'Writer | Director | Mentor',
    roles: ['Writer', 'Director', 'Mentor'],
    imageUrl: '/images/mentors/praveen-r.png',
    bio: [
      'Completed a 2-year Post Graduate Diploma in Direction and Screenwriting at L V Prasad Film Institute, Chennai.',
      'Has mentored over 150 students at L V Prasad Film Institute, Chennai.',
      'Has trained over 25,000 aspiring filmmakers across the country and has hosted 180+ workshops on Screenwriting & Film Direction.',
    ],
    brands: [
      { name: 'L V Prasad' },
      { name: 'LevelUp' },
    ],
  },
  {
    id: 'edwin',
    name: 'Edwin Paul',
    title: 'Editor | Cinematographer | Creator',
    roles: ['Editor', 'Cinematographer', 'Creator'],
    imageUrl: '/images/mentors/edwin.png',
    bio: [
      'Has 5+ years of experience as an Editor and Cinematographer.',
      "Head of Production at LevelUp Learning and Millennial Labs and Head of Editing & Camera crew at Lokesh Kanagaraj's filmmaking masterclass.",
      'His freelance portfolio includes prestigious brands like Aston Martin, Harley Davidson, Ferrari and Cars & Coffee.',
    ],
    brands: [
      { name: 'Ferrari' },
      { name: 'Aston Martin' },
      { name: 'Harley-Davidson' },
      { name: 'TEDx' },
    ],
  },
  {
    id: 'indira',
    name: 'Indira Kumar A',
    title: 'Editor | Videographer | Photographer',
    roles: ['Editor', 'Videographer', 'Photographer'],
    imageUrl: '/images/mentors/indira.png',
    bio: [
      'Has 3+ years of experience in Post Production & Videography and is currently a Senior Video Editor at LevelUp Learning.',
      'He was the Post Production Lead at Fully Filmy for 1 year.',
      'Has worked in several curated projects for FujiFilm and has also mentored 100+ students on Motion Graphics and Animation.',
    ],
    brands: [
      { name: 'FujiFilm' },
      { name: 'Fully Filmy' },
    ],
  },
  {
    id: 'sudharshan',
    name: 'Sudarshan Narayanan',
    title: 'Director | Creative Producer | Writer',
    roles: ['Director', 'Creative Producer', 'Writer'],
    imageUrl: '/images/mentors/sudharshan.png',
    bio: [
      'Sudharshan Narayanan is a seasoned filmmaker with a diverse background in the film industry, having worked across various capacities in Tamil, Malayalam, and Hindi cinema.',
      'With a foundation in Electrical and Electronics Engineering, he transitioned into filmmaking, studying under the renowned filmmaker Rajiv Menon at Mindscreen Film Institute.',
      'Sudharshan\'s career includes significant contributions to feature films like "Richie," "Velaiilla Pattadhari 2," and "Chattambi," and he has co-directed the independent film "Freddie\'s Piano."',
      'He is also the founder of 4:3 Interactive, a production house in Kochi, where he produces and directs TV commercials and music videos.',
    ],
    brands: [
      { name: 'VIP 2' },
      { name: 'Richie' },
      { name: 'Netflix' },
      { name: 'Jio' },
    ],
  },
];

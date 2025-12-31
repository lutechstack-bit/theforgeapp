// City mapping utility for auto-assigning users to nearest city group

const CITY_MAPPINGS: Record<string, string> = {
  // Chennai region
  chennai: 'chennai',
  madras: 'chennai',
  coimbatore: 'chennai',
  madurai: 'chennai',
  trichy: 'chennai',
  tiruchirappalli: 'chennai',
  salem: 'chennai',
  vellore: 'chennai',
  tiruppur: 'chennai',
  erode: 'chennai',
  thoothukudi: 'chennai',
  nellore: 'chennai',
  pondicherry: 'chennai',
  puducherry: 'chennai',
  
  // Mumbai region
  mumbai: 'mumbai',
  bombay: 'mumbai',
  pune: 'mumbai',
  thane: 'mumbai',
  navi: 'mumbai',
  nashik: 'mumbai',
  aurangabad: 'mumbai',
  nagpur: 'mumbai',
  kolhapur: 'mumbai',
  solapur: 'mumbai',
  goa: 'mumbai',
  panaji: 'mumbai',
  surat: 'mumbai',
  vadodara: 'mumbai',
  ahmedabad: 'mumbai',
  rajkot: 'mumbai',
  
  // Bangalore region
  bangalore: 'bangalore',
  bengaluru: 'bangalore',
  mysore: 'bangalore',
  mysuru: 'bangalore',
  mangalore: 'bangalore',
  mangaluru: 'bangalore',
  hubli: 'bangalore',
  belgaum: 'bangalore',
  belagavi: 'bangalore',
  shimoga: 'bangalore',
  
  // Hyderabad region
  hyderabad: 'hyderabad',
  secunderabad: 'hyderabad',
  visakhapatnam: 'hyderabad',
  vizag: 'hyderabad',
  vijayawada: 'hyderabad',
  guntur: 'hyderabad',
  warangal: 'hyderabad',
  tirupati: 'hyderabad',
  kakinada: 'hyderabad',
  rajahmundry: 'hyderabad',
  
  // Kerala region
  kerala: 'kerala',
  kochi: 'kerala',
  cochin: 'kerala',
  trivandrum: 'kerala',
  thiruvananthapuram: 'kerala',
  kozhikode: 'kerala',
  calicut: 'kerala',
  thrissur: 'kerala',
  kollam: 'kerala',
  kannur: 'kerala',
  alappuzha: 'kerala',
  kottayam: 'kerala',
  palakkad: 'kerala',
};

export const getCityGroupKey = (userCity: string | null): string => {
  if (!userCity) return 'chennai'; // Default to Chennai
  
  const normalizedCity = userCity.toLowerCase().trim();
  
  // Direct match
  if (CITY_MAPPINGS[normalizedCity]) {
    return CITY_MAPPINGS[normalizedCity];
  }
  
  // Partial match
  for (const [city, group] of Object.entries(CITY_MAPPINGS)) {
    if (normalizedCity.includes(city) || city.includes(normalizedCity)) {
      return group;
    }
  }
  
  // Default to Chennai if no match
  return 'chennai';
};

export const MAIN_CITIES = ['chennai', 'mumbai', 'bangalore', 'hyderabad', 'kerala'] as const;

export type MainCity = typeof MAIN_CITIES[number];

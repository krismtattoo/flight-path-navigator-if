
export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const airports: Airport[] = [
  // Major European Airports
  { icao: "EGLL", iata: "LHR", name: "London Heathrow Airport", city: "London", country: "United Kingdom", latitude: 51.4700, longitude: -0.4543 },
  { icao: "LFPG", iata: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", latitude: 49.0097, longitude: 2.5479 },
  { icao: "EDDF", iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", latitude: 50.0264, longitude: 8.5431 },
  { icao: "EHAM", iata: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", latitude: 52.3086, longitude: 4.7639 },
  { icao: "LEMD", iata: "MAD", name: "Adolfo Suárez Madrid-Barajas Airport", city: "Madrid", country: "Spain", latitude: 40.4839, longitude: -3.5680 },
  { icao: "LIRF", iata: "FCO", name: "Leonardo da Vinci International Airport", city: "Rome", country: "Italy", latitude: 41.8003, longitude: 12.2389 },
  { icao: "LOWW", iata: "VIE", name: "Vienna International Airport", city: "Vienna", country: "Austria", latitude: 48.1103, longitude: 16.5697 },
  { icao: "ESSA", iata: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden", latitude: 59.6519, longitude: 17.9186 },
  
  // Major US Airports
  { icao: "KJFK", iata: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "United States", latitude: 40.6413, longitude: -73.7781 },
  { icao: "KLAX", iata: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", latitude: 33.9425, longitude: -118.4081 },
  { icao: "KORD", iata: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "United States", latitude: 41.9742, longitude: -87.9073 },
  { icao: "KATL", iata: "ATL", name: "Hartsfield-Jackson Atlanta International Airport", city: "Atlanta", country: "United States", latitude: 33.6407, longitude: -84.4277 },
  { icao: "KDFW", iata: "DFW", name: "Dallas/Fort Worth International Airport", city: "Dallas", country: "United States", latitude: 32.8998, longitude: -97.0403 },
  { icao: "KDEN", iata: "DEN", name: "Denver International Airport", city: "Denver", country: "United States", latitude: 39.8617, longitude: -104.6731 },
  { icao: "KSEA", iata: "SEA", name: "Seattle-Tacoma International Airport", city: "Seattle", country: "United States", latitude: 47.4502, longitude: -122.3088 },
  { icao: "KLAS", iata: "LAS", name: "McCarran International Airport", city: "Las Vegas", country: "United States", latitude: 36.0840, longitude: -115.1537 },
  { icao: "KMIA", iata: "MIA", name: "Miami International Airport", city: "Miami", country: "United States", latitude: 25.7959, longitude: -80.2870 },
  { icao: "KSFO", iata: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "United States", latitude: 37.6213, longitude: -122.3790 },
  
  // Major Asian Airports
  { icao: "RJTT", iata: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan", latitude: 35.7720, longitude: 140.3929 },
  { icao: "VHHH", iata: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "China", latitude: 22.3080, longitude: 113.9185 },
  { icao: "WSSS", iata: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", latitude: 1.3644, longitude: 103.9915 },
  { icao: "RKSI", iata: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea", latitude: 37.4602, longitude: 126.4407 },
  { icao: "ZBAA", iata: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", latitude: 40.0799, longitude: 116.6031 },
  { icao: "OMDB", iata: "DXB", name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", latitude: 25.2532, longitude: 55.3657 },
  { icao: "VIDP", iata: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi", country: "India", latitude: 28.5665, longitude: 77.1031 },
  
  // Major Australian/Oceanian Airports
  { icao: "YSSY", iata: "SYD", name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", latitude: -33.9399, longitude: 151.1753 },
  { icao: "YMML", iata: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia", latitude: -37.6733, longitude: 144.8433 },
  { icao: "NZAA", iata: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand", latitude: -37.0082, longitude: 174.7850 },
  
  // Major African Airports
  { icao: "FACT", iata: "CPT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa", latitude: -33.9648, longitude: 18.6017 },
  { icao: "HECA", iata: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt", latitude: 30.1219, longitude: 31.4056 },
  
  // Major South American Airports
  { icao: "SBGR", iata: "GRU", name: "São Paulo/Guarulhos International Airport", city: "São Paulo", country: "Brazil", latitude: -23.4356, longitude: -46.4731 },
  { icao: "SAEZ", iata: "EZE", name: "Ezeiza International Airport", city: "Buenos Aires", country: "Argentina", latitude: -34.8222, longitude: -58.5358 },
];

export const searchAirports = (query: string): Airport[] => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return airports.filter(airport => 
    airport.icao.toLowerCase().includes(normalizedQuery) ||
    airport.iata.toLowerCase().includes(normalizedQuery) ||
    airport.name.toLowerCase().includes(normalizedQuery) ||
    airport.city.toLowerCase().includes(normalizedQuery)
  ).slice(0, 10); // Limit to 10 results for performance
};

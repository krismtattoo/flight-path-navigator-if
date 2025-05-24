import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Flight } from '@/services/flight';

interface AircraftMarkerProps {
  map: mapboxgl.Map;
  flights: Flight[];
  onFlightSelect: (flight: Flight) => void;
}

const AircraftMarker: React.FC<AircraftMarkerProps> = ({ map, flights, onFlightSelect }) => {
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const selectedMarkerIdRef = useRef<string | null>(null);
  const markerElementsRef = useRef<{ [key: string]: HTMLDivElement }>({});

  // Memoize flight lookup for better performance
  const flightLookup = useMemo(() => {
    const lookup: { [key: string]: Flight } = {};
    flights.forEach(flight => {
      lookup[flight.flightId] = flight;
    });
    return lookup;
  }, [flights]);

  // Memoize current flight IDs set
  const currentFlightIds = useMemo(() => {
    return new Set(flights.map(f => f.flightId));
  }, [flights]);

  // Function to determine if aircraft is on ground
  const isOnGround = useCallback((flight: Flight): boolean => {
    return flight.altitude < 100 && flight.speed < 50;
  }, []);

  // Filter styles for aircraft appearance
  const filterStyles = useMemo(() => ({
    onGroundNormal: 'brightness(0) saturate(0) invert(0) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    airborneNormal: 'brightness(0) saturate(0) invert(0) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    onGroundSelected: 'brightness(0) saturate(0) invert(0) drop-shadow(0 0 8px rgba(255,255,255,0.8))',
    airborneSelected: 'brightness(0) saturate(0) invert(0) drop-shadow(0 0 8px rgba(255,255,255,0.8))'
  }), []);

  // SVG Template für Flugzeug-Icon - zeigt standardmäßig nach Norden (0°)
  const createSvgElement = useCallback((flight: Flight): SVGSVGElement => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    // SVG Grundkonfiguration - optimiert für 28x28px
    svg.setAttribute('width', '28');
    svg.setAttribute('height', '28');
    svg.setAttribute('viewBox', '0 0 512 512');
    svg.setAttribute('version', '1.1');
    
    // Erstelle die Flugzeug-Path mit originalem SVG-Pfad
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M0 0 C9.97090367 6.20637881 16.54338161 14.11514025 19.75582886 25.47262573 C21.13174644 31.87947737 20.79586384 38.24558253 20.61767578 44.76220703 C20.58762934 46.16772381 20.55887199 47.57326864 20.53129578 48.97883606 C20.48717024 51.21733586 20.44215486 53.4557854 20.3932507 55.69418645 C20.27252112 61.2441688 20.19241198 66.79370211 20.13619995 72.34469604 C20.12797341 73.15404669 20.11974686 73.96339733 20.11127102 74.79727376 C20.07819492 78.13160339 20.0465075 81.46594455 20.0156157 84.80029511 C19.92673263 94.22923527 19.79871506 103.65383375 19.55175781 113.08007812 C19.35523119 120.59153438 19.24512114 128.09880241 19.23387134 135.61289585 C19.22476759 139.58111303 19.17411897 143.53831276 19.01810074 147.50369644 C17.90904692 163.91116026 17.90904692 163.91116026 23.9625473 178.40016937 C29.58238225 183.14578164 35.79632296 186.26174123 42.50304794 189.18706894 C47.86465413 191.68656611 52.72837318 194.95034572 57.6796875 198.16796875 C59.67751369 199.42144013 61.6772675 200.67184912 63.6796875 201.91796875 C99.6796875 224.41796875 135.6796875 246.91796875 171.6796875 269.41796875 C172.67073486 270.03736328 173.66178223 270.65675781 174.68286133 271.29492188 C176.67231852 272.53835288 178.6617394 273.78184196 180.65112305 275.02539062 C185.81212388 278.25138639 190.97385138 281.47621088 196.13671875 284.69921875 C197.20083984 285.36373047 198.26496094 286.02824219 199.36132812 286.71289062 C201.37411143 287.96978151 203.38711409 289.2263212 205.40039062 290.48242188 C210.21432666 293.48903231 215.02081216 296.50717607 219.81640625 299.54296875 C220.72479248 300.11789062 221.63317871 300.6928125 222.5690918 301.28515625 C224.6796875 302.66796875 224.6796875 302.66796875 225.6796875 303.66796875 C225.77309184 305.29471653 225.79713921 306.92550926 225.79321289 308.55493164 C225.79313736 309.59593521 225.79306183 310.63693878 225.79298401 311.70948792 C225.78782272 312.84176315 225.78266144 313.97403839 225.77734375 315.140625 C225.77522133 316.86979408 225.77522133 316.86979408 225.77305603 318.63389587 C225.76743755 322.33277939 225.75488192 326.03160339 225.7421875 329.73046875 C225.73717488 332.23111892 225.73261156 334.73177004 225.72851562 337.23242188 C225.71746212 343.37762463 225.70070602 349.52279244 225.6796875 355.66796875 C216.88911361 353.59128739 208.29643244 351.07483152 199.69140625 348.3359375 C198.33447376 347.9071079 196.97742472 347.47864692 195.62026978 347.05052185 C192.71895945 346.1346891 189.81828942 345.21686772 186.91812134 344.29742432 C179.87983635 342.06642283 172.83793755 339.8468723 165.7960186 337.62737274 C164.16523198 337.11337043 162.53448096 336.59925518 160.90376472 336.0850296 C140.91419854 329.78242424 120.89247026 323.58440604 100.86568165 317.40127468 C97.48707632 316.35801031 94.10870342 315.3139952 90.73046875 314.26953125 C90.06487883 314.06377031 89.3992889 313.85800938 88.71352959 313.64601326 C66.34583747 306.72752535 44.01576423 299.68767907 21.6796875 292.66796875 C21.1873222 310.51379935 20.81796185 328.3578498 20.59163189 346.20902252 C20.48370557 354.49957873 20.3368395 362.78589711 20.09545898 371.07373047 C19.88495709 378.30484097 19.7504031 385.53288284 19.70382911 392.76697206 C19.67662491 396.5932029 19.61364266 400.41066387 19.45935631 404.23405457 C18.37777003 420.10185364 18.37777003 420.10185364 23.67694473 434.46224976 C28.49792731 439.31757675 33.95331078 442.7931648 39.92057228 446.07676697 C44.51314226 448.72533542 48.65263049 451.96483688 52.8671875 455.16796875 C54.33906219 456.24195735 55.81159668 457.31504305 57.28515625 458.38671875 C57.98769531 458.92941406 58.69023437 459.47210938 59.4140625 460.03125 C61.69146439 461.75197275 61.69146439 461.75197275 64.4296875 463.1484375 C68.09584636 465.37302328 71.08622314 467.31543037 72.18600464 471.67504883 C72.93202735 477.66500054 72.58921384 483.65641038 72.3046875 489.66796875 C72.25447461 491.51029605 72.20885633 493.35275465 72.16796875 495.1953125 C72.05827857 499.68946125 71.88606183 504.17726343 71.6796875 508.66796875 C66.06996879 508.08958657 60.93165788 507.04930751 55.53881836 505.42724609 C54.76860855 505.20116165 53.99839874 504.97507721 53.20484924 504.74214172 C51.54650813 504.25475594 49.88895443 503.76468432 48.23213005 503.27216721 C45.60616641 502.49251569 42.97768039 501.72199225 40.34828186 500.95401001 C32.87757413 498.77076626 25.41059794 496.57505886 17.94799805 494.36425781 C13.37106153 493.00902837 8.79029691 491.66747993 4.20688057 490.33433914 C2.46668626 489.82522327 0.728009 489.31089104 -1.00905037 488.79117966 C-3.43875221 488.06457054 -5.87294911 487.35544514 -8.30883789 486.64990234 C-9.37432358 486.32426552 -9.37432358 486.32426552 -10.46133423 485.99205017 C-17.95537688 483.86277393 -24.27043831 485.79062082 -31.48706055 487.89282227 C-32.27169678 488.11730042 -33.05633301 488.34177856 -33.86474609 488.57305908 C-35.55675868 489.05774 -37.24817038 489.54452261 -38.9390316 490.03320503 C-41.61522285 490.8064654 -44.29305426 491.57378646 -46.97138977 492.33958435 C-53.61788341 494.24120823 -60.26164229 496.15231039 -66.90515137 498.06433105 C-72.53096072 499.68320919 -78.1579346 501.29790713 -83.78663063 502.90672112 C-86.42462816 503.66259049 -89.06078446 504.4246585 -91.69694519 505.18690491 C-93.31178815 505.64909241 -94.9267178 506.11097715 -96.54174805 506.57250977 C-97.27377945 506.78600571 -98.00581085 506.99950165 -98.76002502 507.21946716 C-102.12470007 508.17420253 -104.78658014 508.66796875 -108.3203125 508.66796875 C-108.59399182 503.27897405 -108.79259359 497.89408517 -108.92456055 492.49975586 C-108.979599 490.66896066 -109.05446431 488.83864291 -109.15014648 487.00952148 C-109.92082289 471.88860309 -109.92082289 471.88860309 -106.13696289 466.63867188 C-103.31790643 464.3132513 -100.48668853 462.48507367 -97.3203125 460.66796875 C-95.79657822 459.54959846 -94.28614683 458.41275803 -92.79296875 457.25390625 C-91.77839285 456.51600562 -91.77839285 456.51600562 -90.74332047 455.7631979 C-89.19143333 454.63225425 -87.64998424 453.48682109 -86.12034225 452.32596684 C-81.88742041 449.13830478 -77.71905325 446.26633208 -73.03131104 443.78697205 C-66.3328656 440.00233545 -59.84212236 436.04956747 -57.21424866 428.48338699 C-55.62050137 419.74201609 -55.95346876 410.91579739 -56.29243374 402.07891583 C-56.41871142 398.22398158 -56.42930169 394.36863079 -56.45294189 390.51194763 C-56.51475757 383.23153759 -56.67834295 375.95723789 -56.87993169 368.67950243 C-57.10461968 360.38513921 -57.21371898 352.09046094 -57.31384039 343.79380524 C-57.52209279 326.74834281 -57.87313283 309.70880442 -58.3203125 292.66796875 C-59.55686081 293.0574864 -59.55686081 293.0574864 -60.81838989 293.45487309 C-98.24641015 305.2444694 -135.68864812 316.98419711 -173.17871094 328.57519531 C-176.09572631 329.47713857 -179.01271512 330.37916771 -181.9296875 331.28125 C-182.64598076 331.5027409 -183.36227402 331.7242318 -184.10027313 331.95243454 C-194.42522248 335.14567904 -204.74461168 338.35637467 -215.05969429 341.58134651 C-217.24609205 342.26488839 -219.43259359 342.94809729 -221.61912537 343.63121033 C-227.79293174 345.56023381 -233.96641486 347.49024328 -240.13790703 349.42665958 C-243.18372614 350.38160195 -246.23063509 351.33305648 -249.27734375 352.28515625 C-250.37568542 352.63084152 -251.4740271 352.97652679 -252.60565186 353.33268738 C-254.09793304 353.79811699 -254.09793304 353.79811699 -255.62036133 354.27294922 C-256.48542801 354.54412567 -257.35049469 354.81530212 -258.24177551 355.09469604 C-260.3203125 355.66796875 -260.3203125 355.66796875 -262.3203125 355.66796875 C-262.57441292 348.39130477 -262.74920122 341.11578792 -262.86962891 333.83569336 C-262.91983918 331.36097468 -262.98802497 328.88655152 -263.07470703 326.4128418 C-263.19640319 322.8500078 -263.25279846 319.29109936 -263.296875 315.7265625 C-263.34848785 314.62525497 -263.40010071 313.52394745 -263.45327759 312.38926697 C-263.45875376 304.84504198 -263.45875376 304.84504198 -260.18847656 301.46379089 C-257.63594531 299.65450517 -255.0810332 298.13563339 -252.3203125 296.66796875 C-250.79023139 295.73576473 -249.26347766 294.79804481 -247.7421875 293.8515625 C-246.18654904 292.93339114 -244.62919484 292.01812176 -243.0703125 291.10546875 C-235.82339653 286.80935601 -228.66571915 282.39739632 -221.5703125 277.85546875 C-213.88783277 272.9381923 -206.1838175 268.05918026 -198.4453125 263.23046875 C-197.44790039 262.60809326 -196.45048828 261.98571777 -195.42285156 261.34448242 C-193.39955913 260.08244969 -191.37612134 258.82064996 -189.35253906 257.55908203 C-184.33940709 254.43253451 -179.33004007 251.29996714 -174.3203125 248.16796875 C-172.32033079 246.91793949 -170.32033078 245.66793949 -168.3203125 244.41796875 C-167.3303125 243.79921875 -166.3403125 243.18046875 -165.3203125 242.54296875 C-136.8203125 224.73046875 -136.8203125 224.73046875 -108.3203125 206.91796875 C-107.32902344 206.29841309 -106.33773437 205.67885742 -105.31640625 205.04052734 C-103.32942708 203.79866536 -101.34244792 202.55680339 -99.35546875 201.31494141 C-98.37449219 200.70183105 -97.39351562 200.0887207 -96.3828125 199.45703125 C-92.17447917 196.82682292 -87.96614583 194.19661458 -83.7578125 191.56640625 C-82.68015625 190.89287109 -81.6025 190.21933594 -80.4921875 189.52539062 C-77.49739583 187.65364583 -74.50260417 185.78190104 -71.5078125 183.91015625 C-70.69699219 183.40339355 -69.88617188 182.89663086 -69.05078125 182.37451172 C-66.3203125 180.66796875 -66.3203125 180.66796875 -64.33714771 179.88877392 C-61.82372532 178.74073034 -60.20415107 177.7056582 -58.3203125 175.66796875 C-57.10204913 171.1297265 -57.28243507 166.65416378 -57.36791992 161.98022461 C-57.36522377 160.57039315 -57.35896768 159.16056469 -57.34942627 157.75076294 C-57.33657204 154.71751648 -57.34893841 151.68579458 -57.38097191 148.65269279 C-57.43163815 143.84741279 -57.42660237 139.04315842 -57.41438293 134.23768616 C-57.40171781 126.62682775 -57.42714884 119.01663884 -57.46840316 111.40589958 C-57.54114524 97.80517188 -57.55423407 84.20435687 -57.54624826 70.60345751 C-57.54500976 65.83722842 -57.56176726 61.07150948 -57.59389627 56.30539215 C-57.61149767 53.32425957 -57.61691788 50.34318279 -57.61968994 47.36200333 C-57.6254958 45.34373181 -57.64650864 43.32552144 -57.66816711 41.30735779 C-57.65760885 28.02049047 -55.434448 17.45964096 -46.3515625 7.51171875 C-34.04070601 -4.44230132 -15.55595776 -7.69179629 0 0 Z');
    path.setAttribute('fill', '#000000');
    path.setAttribute('transform', 'translate(274.3203125,3.33203125)');
    
    svg.appendChild(path);
    
    console.log(`🛩️ Creating SVG marker for flight ${flight.flightId} with heading ${flight.heading}°`);
    
    return svg;
  }, []);

  // Optimized marker creation function
  const createMarkerElement = useCallback((flight: Flight): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'aircraft-marker';
    
    // Container-Styles für das SVG
    const baseStyles = [
      'width: 28px !important',
      'height: 28px !important',
      'cursor: pointer !important',
      'pointer-events: auto !important',
      'position: absolute !important',
      'display: flex !important',
      'align-items: center !important',
      'justify-content: center !important',
      'will-change: transform !important'
    ].join('; ');
    
    el.style.cssText = baseStyles;
    
    // Erstelle und füge SVG hinzu
    const svgElement = createSvgElement(flight);
    el.appendChild(svgElement);
    
    console.log(`✅ Created SVG marker for flight ${flight.flightId}`);
    
    return el;
  }, [createSvgElement]);

  // Function to get aircraft filter
  const getAircraftFilter = useCallback((flight: Flight, isSelected: boolean = false): string => {
    const onGround = isOnGround(flight);
    
    if (isSelected) {
      return onGround ? filterStyles.onGroundSelected : filterStyles.airborneSelected;
    }
    
    return onGround ? filterStyles.onGroundNormal : filterStyles.airborneNormal;
  }, [isOnGround, filterStyles]);

  // HAUPTFUNKTION: SVG Rotation mit tatsächlichem Heading aus API-Daten
  const updateMarkerAppearance = useCallback((
    element: HTMLDivElement, 
    flight: Flight, 
    isSelected: boolean
  ) => {
    const filter = getAircraftFilter(flight, isSelected);
    
    // Hole das tatsächliche Heading aus den API-Daten
    const rawHeading = flight.heading;
    const heading = typeof rawHeading === 'number' && !isNaN(rawHeading) ? rawHeading : 0;
    
    // Normalisiere Heading auf 0-360 Grad
    const normalizedHeading = ((heading % 360) + 360) % 360;
    
    // Da das SVG standardmäßig nach Norden (0°) zeigt, verwenden wir den Heading-Wert direkt
    const rotationAngle = normalizedHeading;
    const scaleValue = isSelected ? 1.2 : 1.0;
    
    console.log(`🧭 Flight ${flight.flightId}: API Heading=${rawHeading}°, Normalized=${normalizedHeading}°, SVG Rotation=${rotationAngle}°`);
    
    // Finde das SVG-Element und rotiere es entsprechend dem tatsächlichen Heading
    const svgElement = element.querySelector('svg') as SVGSVGElement;
    if (svgElement) {
      // SVG Transform für präzise Rotation - das SVG wird um den Mittelpunkt rotiert
      svgElement.style.transform = `rotate(${rotationAngle}deg) scale(${scaleValue})`;
      svgElement.style.filter = filter;
      svgElement.style.transformOrigin = 'center center';
      
      console.log(`✅ Flight ${flight.flightId} rotated to ${rotationAngle}° (${getDirectionName(normalizedHeading)})`);
    }
    
    if (isSelected) {
      element.style.setProperty('z-index', '1000', 'important');
      element.classList.add('aircraft-marker-selected');
    } else {
      element.style.setProperty('z-index', '0', 'important');
      element.classList.remove('aircraft-marker-selected');
    }
  }, [getAircraftFilter]);

  // Hilfsfunktion um Richtungsname zu bekommen
  const getDirectionName = (heading: number): string => {
    if (heading >= 337.5 || heading < 22.5) return 'North';
    if (heading >= 22.5 && heading < 67.5) return 'Northeast';
    if (heading >= 67.5 && heading < 112.5) return 'East';
    if (heading >= 112.5 && heading < 157.5) return 'Southeast';
    if (heading >= 157.5 && heading < 202.5) return 'South';
    if (heading >= 202.5 && heading < 247.5) return 'Southwest';
    if (heading >= 247.5 && heading < 292.5) return 'West';
    if (heading >= 292.5 && heading < 337.5) return 'Northwest';
    return 'Unknown';
  };

  // Optimized click handler with debouncing
  const createClickHandler = useCallback((flight: Flight) => {
    return (e: MouseEvent) => {
      e.stopPropagation();
      console.log(`🎯 Flight clicked: ${flight.flightId}`);
      
      // Remove highlight from previously selected marker
      if (selectedMarkerIdRef.current && markerElementsRef.current[selectedMarkerIdRef.current]) {
        const prevElement = markerElementsRef.current[selectedMarkerIdRef.current];
        const prevFlight = flightLookup[selectedMarkerIdRef.current];
        if (prevFlight) {
          console.log(`🔄 Removing highlight from ${selectedMarkerIdRef.current}`);
          updateMarkerAppearance(prevElement, prevFlight, false);
        }
      }
      
      // Highlight selected marker
      const currentElement = markerElementsRef.current[flight.flightId];
      if (currentElement) {
        updateMarkerAppearance(currentElement, flight, true);
      }
      
      selectedMarkerIdRef.current = flight.flightId;
      console.log(`✅ Selected: ${flight.flightId}`);
      
      onFlightSelect(flight);
    };
  }, [flightLookup, updateMarkerAppearance, onFlightSelect]);

  // Main useEffect for marker management
  useEffect(() => {
    console.log(`🛩️ AircraftMarker effect - ${flights.length} flights, map loaded: ${map?.loaded()}`);
    
    if (!map || !map.loaded()) {
      console.log("🔄 Map not loaded, waiting...");
      const onMapLoad = () => {
        console.log("✅ Map loaded, updating markers");
        updateMarkers();
        map.off('load', onMapLoad);
      };
      map.on('load', onMapLoad);
      return;
    }
    
    updateMarkers();
    
    function updateMarkers() {
      console.log(`🔄 Updating ${flights.length} flight markers`);
      
      const existingMarkerIds = Object.keys(markersRef.current);
      
      // Remove markers for flights that no longer exist
      existingMarkerIds.forEach(flightId => {
        if (!currentFlightIds.has(flightId)) {
          console.log(`🗑️ Removing marker for departed flight ${flightId}`);
          markersRef.current[flightId].remove();
          delete markersRef.current[flightId];
          delete markerElementsRef.current[flightId];
          if (selectedMarkerIdRef.current === flightId) {
            selectedMarkerIdRef.current = null;
          }
        }
      });
      
      // Use requestAnimationFrame to batch DOM updates
      requestAnimationFrame(() => {
        let updatedCount = 0;
        let createdCount = 0;
        
        // Process flights in batches to avoid blocking the main thread
        const batchSize = 100;
        let batchIndex = 0;
        
        const processBatch = () => {
          const start = batchIndex * batchSize;
          const end = Math.min(start + batchSize, flights.length);
          
          for (let i = start; i < end; i++) {
            const flight = flights[i];
            const existingMarker = markersRef.current[flight.flightId];
            const isSelected = selectedMarkerIdRef.current === flight.flightId;
            
            if (existingMarker) {
              // Update existing marker position and appearance WITH HEADING ROTATION
              existingMarker.setLngLat([flight.longitude, flight.latitude]);
              const element = markerElementsRef.current[flight.flightId];
              if (element) {
                updateMarkerAppearance(element, flight, isSelected);
              }
              updatedCount++;
            } else {
              // Create new marker WITH HEADING ROTATION
              const element = createMarkerElement(flight);
              updateMarkerAppearance(element, flight, isSelected);
              
              const marker = new mapboxgl.Marker({
                element,
                anchor: 'center',
                draggable: false,
                rotationAlignment: 'map',
                pitchAlignment: 'map',
              });
              
              marker.setLngLat([flight.longitude, flight.latitude]);
              
              if (map && map.getCanvas()) {
                marker.addTo(map);
                markersRef.current[flight.flightId] = marker;
                markerElementsRef.current[flight.flightId] = element;
                createdCount++;
                
                // Add optimized click handler
                element.addEventListener('click', createClickHandler(flight));
              }
            }
          }
          
          batchIndex++;
          if (end < flights.length) {
            // Process next batch in next frame
            requestAnimationFrame(processBatch);
          } else {
            console.log(`✅ Markers updated - Updated: ${updatedCount}, Created: ${createdCount}, Total: ${Object.keys(markersRef.current).length}`);
          }
        };
        
        processBatch();
      });
    }
  }, [flights, map, currentFlightIds, createMarkerElement, updateMarkerAppearance, createClickHandler]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log(`🧹 Cleaning up ${Object.keys(markersRef.current).length} markers`);
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      markerElementsRef.current = {};
    };
  }, []);

  return null;
};

export default React.memo(AircraftMarker);

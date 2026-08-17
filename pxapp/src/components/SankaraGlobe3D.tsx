import React from 'react';
import { GlobeView, GlobeConfig, Position, GlobePoint } from './ui/globe';
import { Sparkles, Navigation, MapPin } from 'lucide-react';

export interface HospitalPin {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  isHQ?: boolean;
  isUpcoming?: boolean;
  beds?: string;
}

export const SANKARA_UNITS_GEO: HospitalPin[] = [
  { id: 'cbe', name: 'Sankara Eye Hospital (HQ)', city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558, isHQ: true, beds: '225 Beds • Central Hub' },
  { id: 'rsp', name: 'Sankara Eye Hospital (R.S. Puram)', city: 'R.S. Puram, Coimbatore', state: 'Tamil Nadu', lat: 11.0086, lon: 76.9490, beds: 'Daycare Super-specialty' },
  { id: 'kri', name: 'Sankara Eye Hospital', city: 'Krishnankoil', state: 'Tamil Nadu', lat: 9.5855, lon: 77.6625, beds: '100 Beds' },
  { id: 'blr', name: 'Sankara Eye Hospital', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, beds: '225 Beds' },
  { id: 'shm', name: 'Sankara Eye Hospital', city: 'Shivamogga', state: 'Karnataka', lat: 13.9299, lon: 75.5681, beds: '100 Beds' },
  { id: 'gun', name: 'Sankara Eye Hospital', city: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365, beds: '150 Beds' },
  { id: 'and', name: 'Sankara Eye Hospital', city: 'Anand', state: 'Gujarat', lat: 22.5645, lon: 72.9289, beds: '150 Beds' },
  { id: 'lud', name: 'Sankara Eye Hospital', city: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573, beds: '100 Beds' },
  { id: 'knp', name: 'Sankara Eye Hospital', city: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319, beds: '120 Beds' },
  { id: 'var', name: 'Sankara Eye Hospital', city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, beds: '100 Beds' },
  { id: 'jai', name: 'Sankara Eye Hospital', city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, beds: '125 Beds' },
  { id: 'ind', name: 'Sankara Eye Hospital', city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, beds: '120 Beds' },
  { id: 'hyd', name: 'Sankara Eye Hospital', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, beds: '150 Beds' },
  { id: 'pan', name: 'Sankara Eye Hospital', city: 'Panvel (Mumbai)', state: 'Maharashtra', lat: 18.9894, lon: 73.1175, beds: '150 Beds' },
  { id: 'pat', name: 'Sankara Eye Hospital (Upcoming)', city: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, isUpcoming: true, beds: 'Upcoming 150-Bed Center' },
];

interface SankaraGlobe3DProps {
  onSelectUnit?: (unit: HospitalPin) => void;
}

export const SankaraGlobe3D: React.FC<SankaraGlobe3DProps> = ({ onSelectUnit }) => {
  // Globe Configuration: Starts facing India, stays on India, then gently rotates
  const globeConfig: GlobeConfig = {
    globeColor: "#030712",
    showAtmosphere: true,
    atmosphereColor: "#F97316", // Soft Orange Atmospheric Glow
    atmosphereAltitude: 0.16,
    emissive: "#050B1A",
    emissiveIntensity: 0.18,
    shininess: 0.95,
    polygonColor: "rgba(255, 255, 255, 0.22)", // Subtle Muted for all other nations
    ambientLight: "#ffffff",
    directionalLeftLight: "#f97316",
    directionalTopLight: "#ffffff",
    arcTime: 1400,
    arcLength: 0.85,
    initialPosition: { lat: 20.5937, lng: 78.9629 }, // FOCUSED DIRECTLY ON INDIA
    autoRotate: true,
    autoRotateSpeed: 0.0014,
    rotationDelaySeconds: 3.0, // Shows India stationary first for 3s, then rotates!
  };

  // Glowing Arcs connecting Coimbatore Central Hub to All Other 14 Units
  const sampleArcs: Position[] = [
    { order: 1, startLat: 11.0168, startLng: 76.9558, endLat: 18.9894, endLng: 73.1175, arcAlt: 0.25, color: '#f97316' }, // Panvel
    { order: 1, startLat: 11.0168, startLng: 76.9558, endLat: 12.9716, endLng: 77.5946, arcAlt: 0.15, color: '#fb923c' }, // Bengaluru
    { order: 2, startLat: 11.0168, startLng: 76.9558, endLat: 13.9299, endLng: 75.5681, arcAlt: 0.18, color: '#f97316' }, // Shivamogga
    { order: 2, startLat: 11.0168, startLng: 76.9558, endLat: 16.3067, endLng: 80.4365, arcAlt: 0.20, color: '#fb923c' }, // Guntur
    { order: 3, startLat: 11.0168, startLng: 76.9558, endLat: 22.5645, endLng: 72.9289, arcAlt: 0.30, color: '#f97316' }, // Anand
    { order: 3, startLat: 11.0168, startLng: 76.9558, endLat: 30.9010, endLng: 75.8573, arcAlt: 0.40, color: '#fb923c' }, // Ludhiana
    { order: 4, startLat: 11.0168, startLng: 76.9558, endLat: 26.4499, endLng: 80.3319, arcAlt: 0.35, color: '#f97316' }, // Kanpur
    { order: 4, startLat: 11.0168, startLng: 76.9558, endLat: 25.3176, endLng: 82.9739, arcAlt: 0.35, color: '#fb923c' }, // Varanasi
    { order: 5, startLat: 11.0168, startLng: 76.9558, endLat: 26.9124, endLng: 75.7873, arcAlt: 0.35, color: '#f97316' }, // Jaipur
    { order: 5, startLat: 11.0168, startLng: 76.9558, endLat: 22.7196, endLng: 75.8577, arcAlt: 0.30, color: '#fb923c' }, // Indore
    { order: 6, startLat: 11.0168, startLng: 76.9558, endLat: 17.3850, endLng: 78.4867, arcAlt: 0.22, color: '#f97316' }, // Hyderabad
    { order: 6, startLat: 11.0168, startLng: 76.9558, endLat: 9.5855, endLng: 77.6625, arcAlt: 0.12, color: '#fb923c' }, // Krishnankoil
    { order: 7, startLat: 11.0168, startLng: 76.9558, endLat: 11.0086, endLng: 76.9490, arcAlt: 0.08, color: '#f97316' }, // R.S. Puram
    { order: 7, startLat: 11.0168, startLng: 76.9558, endLat: 25.5941, endLng: 85.1376, arcAlt: 0.38, color: '#fb923c' }, // Patna (Upcoming)
  ];

  // 15 Location Map Pins
  const pointsData: GlobePoint[] = SANKARA_UNITS_GEO.map((u) => ({
    lat: u.lat,
    lng: u.lon,
    label: u.name,
    city: u.city,
    state: u.state,
    isHQ: u.isHQ,
    beds: u.beds,
  }));

  return (
    <div className="relative w-full h-full min-h-[520px] overflow-hidden select-none bg-[#030712]">
      
      {/* ThreeGlobe with 3D Location Pins & India-First Camera */}
      <GlobeView
        globeConfig={globeConfig}
        data={sampleArcs}
        points={pointsData}
        onSelectPoint={(p) => {
          const unit = SANKARA_UNITS_GEO.find((u) => u.lat === p.lat && u.lon === p.lng);
          if (unit && onSelectUnit) onSelectUnit(unit);
        }}
      />

      {/* Floating Network Overlay Info Card */}
      <div className="absolute top-6 right-6 z-20 pointer-events-none hidden sm:block">
        <div className="bg-slate-950/90 backdrop-blur-md border border-orange-500/30 rounded-2xl p-4 shadow-xl text-left max-w-xs">
          <div className="flex items-center gap-2 text-xs font-black text-orange-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pan-India Presence</span>
          </div>
          <h3 className="text-sm font-black text-white mt-1">
            14 Hospital Units & 1 Upcoming
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Coimbatore HQ Central Hub connected to all regional healthcare centers.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-800 text-[10px]">
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-500 block uppercase font-bold">Network Reach</span>
              <span className="text-xs font-black text-white">9 Indian States</span>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-500 block uppercase font-bold">Central Hub</span>
              <span className="text-xs font-black text-orange-400">Coimbatore</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Globe Navigation Hint */}
      <div className="absolute bottom-5 left-6 right-6 z-20 pointer-events-none flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-800">
          <Navigation className="w-3 h-3 text-orange-400 animate-spin" />
          <span>Interactive: Default focused on India • Drag to rotate</span>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>14 Location Pins Plotted Live</span>
        </div>
      </div>

    </div>
  );
};

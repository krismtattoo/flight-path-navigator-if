
import FlightMap from "@/components/FlightMap";

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="absolute top-0 left-0 w-full bg-white/70 backdrop-blur-sm z-20 px-4 py-2 shadow-sm">
        <div className="max-w-screen-lg mx-auto flex justify-between items-center h-10">
          <h1 className="text-lg font-bold text-blue-600">Infinite Flight Live Tracker</h1>
          <div className="text-sm text-gray-500">
            <span>Live data from Infinite Flight servers</span>
          </div>
        </div>
      </header>
      <FlightMap />
    </div>
  );
};

export default Index;

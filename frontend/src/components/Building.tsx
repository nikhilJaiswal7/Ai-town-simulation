import type { BuildingData } from './TownCanvas';

interface BuildingProps {
  data: BuildingData;
}

const Building = ({ data }: BuildingProps) => {
  const getStyle = () => {
    switch (data.type) {
      case 'house': return 'bg-slate-800 border-slate-700';
      case 'shop': return 'bg-indigo-900/40 border-indigo-800/50';
      case 'library': return 'bg-emerald-900/30 border-emerald-800/40';
      default: return 'bg-slate-800';
    }
  };

  return (
    <div
      className={`absolute border-2 rounded-sm transition-all duration-700 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${getStyle()}`}
      style={{
        left: data.pos.x,
        top: data.pos.y,
        width: data.size.w,
        height: data.size.h,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      
      {/* Light from window */}
      <div className="absolute top-2 left-2 w-3 h-4 bg-town-warm/20 blur-[2px] rounded-sm" />
      
      <div className="absolute bottom-2 left-2 right-2">
        <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-medium">
          {data.type}
        </span>
      </div>

      {/* Invisible Affordance Zone (visualized for dev) */}
      <div className="absolute -inset-4 border border-white/5 pointer-events-none rounded-md" />
    </div>
  );
};

export default Building;

import { useState } from 'react'
import Town3D from './components/Town3D'
import RelationshipGraph from './components/RelationshipGraph'
import { LayoutGrid, Network } from 'lucide-react'

function App() {
  const [view, setView] = useState<'town' | 'graph'>('town');

  return (
    <div className="w-full h-full relative">
      {view === 'town' ? <Town3D /> : <RelationshipGraph />}
      
      {/* Navigation */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button 
          onClick={() => setView('town')}
          className={`p-2 rounded-full border transition-all ${view === 'town' ? 'bg-town-warm text-black border-town-warm' : 'bg-black/40 text-slate-400 border-white/10 hover:bg-white/5'}`}
        >
          <LayoutGrid size={20} />
        </button>
        <button 
          onClick={() => setView('graph')}
          className={`p-2 rounded-full border transition-all ${view === 'graph' ? 'bg-town-warm text-black border-town-warm' : 'bg-black/40 text-slate-400 border-white/10 hover:bg-white/5'}`}
        >
          <Network size={20} />
        </button>
      </div>
    </div>
  )
}

export default App

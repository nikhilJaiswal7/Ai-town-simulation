import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  value: number;
}

function renderGraph(nodes: Node[], links: any[], svgElement: SVGSVGElement) {
  const width = 800;
  const height = 600;

  const svg = d3.select(svgElement)
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`);

  svg.selectAll("*").remove();

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#334155')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', (d: any) => Math.sqrt(d.value) * 2);

  const node = svg.append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .call(d3.drag<any, Node>()
      .on('start', function(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', function(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }));

  node.append('circle')
    .attr('r', 8)
    .attr('fill', (d: any) => d.type === 'character' ? '#fbbf24' : '#64748b')
    .attr('stroke', '#000')
    .attr('stroke-width', 1.5);

  node.append('text')
    .text((d: any) => d.name)
    .attr('x', 12)
    .attr('y', 4)
    .attr('fill', '#94a3b8')
    .style('font-size', '10px')
    .style('font-family', 'sans-serif')
    .style('pointer-events', 'none');

  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => (d.source as any).x)
      .attr('y1', (d: any) => (d.source as any).y)
      .attr('x2', (d: any) => (d.target as any).x)
      .attr('y2', (d: any) => (d.target as any).y);

    node
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
  });
}

const RelationshipGraph = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let isMounted = true;
    
    fetch('http://localhost:8000/api/state')
      .then(res => res.json())
      .then(state => {
        if (!isMounted || !svgRef.current) return;
        
        const nodes: Node[] = state.characters.map((c: any) => ({ 
          id: c.id, 
          name: c.name, 
          type: 'character' 
        }));
        nodes.push({ id: 'n3', name: 'The Old Clock', type: 'object' });
        
        const links: Link[] = state.relationships.map((r: any) => ({ 
          source: r.source, 
          target: r.target, 
          value: r.strength 
        }));
        
        renderGraph(nodes, links, svgRef.current);
      })
      .catch(err => console.error(err));

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="w-full h-full bg-town-deep flex flex-col items-center justify-center">
      <div className="absolute top-8 text-center pointer-events-none">
        <h1 className="text-2xl font-extralight text-town-warm tracking-widest uppercase">Introspection Map</h1>
        <p className="text-slate-500 text-sm mt-2">The invisible threads connecting the town's soul.</p>
      </div>
      <svg ref={svgRef} className="w-full h-4/5 max-w-4xl cursor-grab active:cursor-grabbing" />
    </div>
  );
};

export default RelationshipGraph;

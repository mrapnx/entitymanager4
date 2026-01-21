
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { AppData, Entity, AttributeType } from '../types';
import * as d3 from 'd3';

interface MindmapProps {
  data: AppData;
  onEdit: (entity: Entity) => void;
  onDelete: (id: string) => void;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  entity: Entity;
  width: number;
  height: number;
  title: string;
  typeName: string;
  // Explicitly add properties as they are sometimes missing from the extended type in certain environments
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

const Mindmap: React.FC<MindmapProps> = ({ data, onEdit, onDelete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { types, entities } = data;

  const [hoveredButton, setHoveredButton] = useState<{ nodeId: string, action: 'edit' | 'delete' } | null>(null);

  // Prep data for D3
  const nodes: Node[] = useMemo(() => entities.map(e => {
    const type = types.find(t => t.id === e.typeId);
    const title = String(e.values[Object.keys(e.values)[0]] || 'Entität');
    return {
      id: e.id,
      entity: e,
      title,
      typeName: type?.name || 'Unbekannt',
      width: 160,
      height: 80,
      x: Math.random() * 800,
      y: Math.random() * 600
    };
  }), [entities, types]);

  const links: Link[] = useMemo(() => {
    const l: Link[] = [];
    entities.forEach(e => {
      const type = types.find(t => t.id === e.typeId);
      type?.attributes.forEach(attr => {
        if (attr.type === AttributeType.LINK && e.values[attr.id]) {
          const targetId = String(e.values[attr.id]);
          if (entities.find(ee => ee.id === targetId)) {
            l.push({ source: e.id, target: targetId });
          }
        }
      });
    });
    return l;
  }, [entities, types]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(200))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(canvas.width / 2, canvas.height / 2))
      .force("collision", d3.forceCollide().radius(100)); // Repulsion logic

    simulation.on("tick", () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Links (Lines connecting borders)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      links.forEach(link => {
        const s = link.source as Node;
        const t = link.target as Node;
        
        // Ensure x and y exist before drawing
        if (s.x !== undefined && s.y !== undefined && t.x !== undefined && t.y !== undefined) {
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(t.x, t.y);
          ctx.stroke();
        }
      });

      // Draw Nodes (Cards)
      nodes.forEach(node => {
        // Fix: Property 'x' and 'y' check
        if (node.x === undefined || node.y === undefined) return;
        
        const x = node.x - node.width / 2;
        const y = node.y - node.height / 2;

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        
        // Body
        ctx.fillStyle = 'white';
        ctx.beginPath();
        // @ts-ignore - roundRect might not be in all typings yet
        if (ctx.roundRect) {
            // @ts-ignore
            ctx.roundRect(x, y, node.width, node.height, 8);
        } else {
            ctx.rect(x, y, node.width, node.height);
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset
        
        ctx.strokeStyle = '#e2e8f0';
        ctx.stroke();

        // Header strip
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        // @ts-ignore
        if (ctx.roundRect) {
            // @ts-ignore
            ctx.roundRect(x, y, node.width, 24, [8, 8, 0, 0]);
        } else {
            ctx.rect(x, y, node.width, 24);
        }
        ctx.fill();

        // Text: Type
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 9px Inter';
        ctx.fillText(node.typeName.toUpperCase(), x + 10, y + 15);

        // Text: Title
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 12px Inter';
        const truncatedTitle = node.title.length > 20 ? node.title.substring(0, 18) + '...' : node.title;
        ctx.fillText(truncatedTitle, x + 10, y + 50);

        // Icons (Edit/Delete)
        // Edit Icon
        ctx.font = '12px FontAwesome';
        ctx.fillStyle = hoveredButton?.nodeId === node.id && hoveredButton?.action === 'edit' ? '#2563eb' : '#94a3b8';
        ctx.fillText('✎', x + node.width - 35, y + 16);
        
        // Delete Icon
        ctx.fillStyle = hoveredButton?.nodeId === node.id && hoveredButton?.action === 'delete' ? '#ef4444' : '#94a3b8';
        ctx.fillText('🗑', x + node.width - 18, y + 16);
      });
    });

    // Interaction handling
    const drag = d3.drag<HTMLCanvasElement, Node>()
      .subject((event) => {
        return simulation.find(event.x, event.y, 100);
      })
      .on("start", (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on("drag", (event) => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on("end", (event) => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      });

    d3.select(canvas).call(drag as any);

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        let found = null;
        for (const node of nodes) {
            // Fix: Property 'x' and 'y' check
            if (node.x === undefined || node.y === undefined) continue;
            
            const nx = node.x - node.width / 2;
            const ny = node.y - node.height / 2;
            
            // Edit button hit area
            if (mouseX >= nx + node.width - 40 && mouseX <= nx + node.width - 25 && mouseY >= ny && mouseY <= ny + 25) {
                found = { nodeId: node.id, action: 'edit' as const };
                break;
            }
            // Delete button hit area
            if (mouseX >= nx + node.width - 25 && mouseX <= nx + node.width && mouseY >= ny && mouseY <= ny + 25) {
                found = { nodeId: node.id, action: 'delete' as const };
                break;
            }
        }
        
        setHoveredButton(found);
        canvas.style.cursor = found ? 'pointer' : 'default';
    };

    const handleClick = (e: MouseEvent) => {
        if (hoveredButton) {
            const entity = entities.find(ee => ee.id === hoveredButton.nodeId);
            if (entity) {
                if (hoveredButton.action === 'edit') onEdit(entity);
                else onDelete(entity.id);
            }
        }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      simulation.stop();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [nodes, links, hoveredButton, entities, onEdit, onDelete]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default Mindmap;

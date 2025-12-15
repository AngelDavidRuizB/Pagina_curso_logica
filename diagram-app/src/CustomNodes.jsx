import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Play, Square, FileText, GitBranch, Check, X, ArrowRight } from 'lucide-react';

const NodeBase = "px-4 py-3 shadow-xl text-sm font-medium text-center min-w-[160px] flex items-center justify-center transition-all hover:scale-105 duration-300 hover:shadow-2xl";

export const StartEndNode = memo(({ data }) => {
  if (data.isMerge) {
    return (
      <div className="w-4 h-4 rounded-full bg-slate-400 flex items-center justify-center shadow-sm border-2 border-white">
        <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-full !h-full !top-0" />
        <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-full !h-full !bottom-0" />
      </div>
    );
  }
  const isStart = data.label === 'INICIO';
  return (
    <div className={`${NodeBase} rounded-full ${isStart ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-rose-500 to-pink-600'} text-white border-2 border-white ring-2 ${isStart ? 'ring-emerald-200' : 'ring-rose-200'}`}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
      <div className="flex items-center gap-2">
        {isStart ? <Play size={16} fill="currentColor" /> : <Square size={16} fill="currentColor" />}
        <span className="font-bold tracking-wide uppercase">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
    </div>
  );
});

export const ProcessNode = memo(({ data }) => {
  return (
    <div className={`${NodeBase} bg-white border-l-4 border-l-blue-500 border-y border-r border-slate-200 rounded-r-lg text-slate-700`}>
      <Handle type="target" position={Position.Top} className="!bg-blue-400 !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-50 rounded text-blue-600">
            <ArrowRight size={14} />
        </div>
        <div className="font-mono text-xs font-semibold">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !w-3 !h-3" />
    </div>
  );
});

export const IONode = memo(({ data }) => {
  return (
    <div className="relative group py-2">
      <div 
        className={`${NodeBase} bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 text-amber-900 shadow-amber-100`} 
        style={{ transform: 'skewX(-15deg)', borderRadius: '6px' }}
      >
        <div style={{ transform: 'skewX(15deg)' }} className="flex items-center gap-2 justify-center w-full">
          <FileText size={14} className="text-amber-600" />
          <div className="font-mono text-xs font-bold">
            {data.label}
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-3 !h-3" />
    </div>
  );
});

export const DecisionNode = memo(({ data }) => {
  return (
    <div className="relative w-[180px] h-[120px] flex items-center justify-center group">
      {/* Diamond Shape */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105 duration-300"
        style={{ transform: 'rotate(45deg) scale(0.65)', borderRadius: '12px', border: '3px solid white' }}
      >
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-white font-bold text-xs px-4 text-center max-w-[120px] leading-tight drop-shadow-md flex flex-col items-center gap-1">
        <GitBranch size={16} className="text-indigo-100" />
        <span>{data.label}</span>
      </div>
      
      <Handle type="target" position={Position.Top} className="!bg-indigo-600 !w-4 !h-4 !border-2 !border-white -mt-2" />
      
      {/* Salida True (Derecha) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="true"
        className="!bg-emerald-500 !w-4 !h-4 !border-2 !border-white -mr-3" 
      />
      <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 shadow-sm">
        <Check size={10} /> SÍ
      </div>

      {/* Salida False (Izquierda) */}
      <Handle 
        type="source" 
        position={Position.Left} 
        id="false"
        className="!bg-rose-500 !w-4 !h-4 !border-2 !border-white -ml-3" 
      />
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-full border border-rose-200 shadow-sm">
        <X size={10} /> NO
      </div>
    </div>
  );
});

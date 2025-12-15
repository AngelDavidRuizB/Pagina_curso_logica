import React from 'react';
import { Play, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

export const ExecutionControls = ({ 
  onRun, 
  onReset, 
  isPlaying, 
  currentStep, 
  totalSteps 
}) => {
  return (
    <div className="flex items-center gap-2 mb-4 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
      <button 
        onClick={onRun}
        disabled={isPlaying}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Play size={16} />
        Ejecutar
      </button>

      <button 
        onClick={onReset}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
        title="Reiniciar"
      >
        <RotateCcw size={18} />
      </button>

      <div className="ml-auto text-xs text-slate-500 font-mono">
        {totalSteps > 0 ? `Paso ${currentStep} / ${totalSteps}` : 'Listo'}
      </div>
    </div>
  );
};

export const Feedback = ({ feedback, error }) => {
  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400">
        <AlertCircle className="shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="font-semibold mb-1">Error de Ejecución</h4>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  if (feedback) {
    return (
      <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 border ${
        feedback.success 
          ? 'bg-green-500/10 border-green-500/20 text-green-400' 
          : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
      }`}>
        {feedback.success ? (
          <CheckCircle className="shrink-0 mt-0.5" size={18} />
        ) : (
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
        )}
        <div>
          <h4 className="font-semibold mb-1">
            {feedback.success ? '¡Excelente!' : 'Sugerencia'}
          </h4>
          <p className="text-sm opacity-90">{feedback.message}</p>
        </div>
      </div>
    );
  }

  return null;
};

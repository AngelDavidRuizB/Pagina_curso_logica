import React from 'react';
import { Youtube, ExternalLink, PlayCircle } from 'lucide-react';

const videos = [
  {
    id: 'v1',
    title: '¿Qué es la Lógica de Programación?',
    description: 'Una introducción fundamental a cómo pensar como un programador.',
    url: 'https://www.youtube.com/embed/T2VqjG808iI', // Ejemplo: Curso de lógica
    category: 'Fundamentos'
  },
  {
    id: 'v2',
    title: 'Las bases de la programación (Binarios)',
    description: 'Necesitas aprender la base principal de lógica de programación: El álgebra de Boole. Una vez conozcas bien este concepto todo te resultará más simple.',
    url: 'https://www.youtube.com/watch?v=InBm1uDgmKg', // Ejemplo
    category: 'Conceptos Básicos'
  },
  {
    id: 'v3',
    title: ' CALCULAR SUELDO DE UN TRABAJADOR',
    description: 'Ejercicio práctico utilizando condicionales para calcular sueldos.',
    url: 'https://www.youtube.com/watch?v=gYKmh9MVDs0&list=PLQxX2eiEaqbwHMRObsvtRSb6sA43msUJt&index=14', // Ejemplo
    category: 'Control de Flujo'
  },
  {
    id: 'v4',
    title: 'Lógica de Programación 👩‍💻 Aprende a programar en 10 minutos',
    description: 'Los principales conceptos que abarca la lógica de programación de una manera rápida y sencilla.',
    url: 'https://www.youtube.com/watch?v=pmOgMzBZw2w', // Placeholder ID
    category: 'Control de Flujo'
  }
];

// Normalize various YouTube URL formats into an embeddable URL
function getEmbedUrl(raw) {
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();

    if (host.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }

    if (host.includes('youtube.com')) {
      // If it's already an embed URL, return as-is
      if (u.pathname.startsWith('/embed/')) return raw;

      // For watch URLs like /watch?v=ID
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v');
        // preserve playlist if present
        const list = u.searchParams.get('list');
        return list ? `https://www.youtube.com/embed/${id}?list=${encodeURIComponent(list)}` : `https://www.youtube.com/embed/${id}`;
      }

      // Fallback: try to extract last path segment
      const parts = u.pathname.split('/').filter(Boolean);
      const maybeId = parts.pop();
      return `https://www.youtube.com/embed/${maybeId}`;
    }
  } catch (e) {
    // If parsing fails, return raw
  }
  return raw;
}

function getWatchUrl(raw) {
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();

    if (host.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/watch?v=${id}`;
    }

    if (host.includes('youtube.com')) {
      if (u.pathname === '/watch') return raw;
      if (u.pathname.startsWith('/embed/')) {
        const id = u.pathname.split('/').pop();
        return `https://www.youtube.com/watch?v=${id}`;
      }
      // fallback
      return raw;
    }
  } catch (e) {}
  return raw;
}

const EducationalMaterial = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-4 border border-red-500/20">
          <Youtube size={14} />
          <span>Recursos Multimedia</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Material <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Didáctico</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-3xl">
          Una colección curada de videos para reforzar tus conocimientos. Aquí encontrarás explicaciones visuales y ejemplos prácticos sobre los temas del curso.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
        {videos.map((video) => (
          <div key={video.id} className="group bg-secondary/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/10">
            {/* Video Container - Aspect Ratio 16:9 */}
            <div className="relative w-full aspect-video bg-black">
              <iframe 
                src={getEmbedUrl(video.url)} 
                title={video.title}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-1 rounded uppercase tracking-wider">
                  {video.category}
                </span>
                <PlayCircle size={20} className="text-slate-600 group-hover:text-red-400 transition-colors" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                {video.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                {video.description}
              </p>
              
              <div className="pt-4 border-t border-slate-800/50 flex items-center text-sm text-slate-500">
                <a href={getWatchUrl(video.url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  Ver en YouTube <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-start gap-4">
        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
          <ExternalLink size={24} />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-1">¿Necesitas más recursos?</h4>
          <p className="text-slate-400 text-sm">
            Recuerda que puedes consultar la documentación oficial de JavaScript o buscar más tutoriales específicos en plataformas educativas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EducationalMaterial;

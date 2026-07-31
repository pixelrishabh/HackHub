import React from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, Star, Eye, ExternalLink, Sparkles, Award } from 'lucide-react';

export function RecentProjectsGrid({ projects = [] }) {
  const defaultProjects = [
    {
      id: 'p1',
      title: 'HackOps Autonomous Orchestrator',
      description: 'Multi-agent AI coordinator for automated software engineering and containerized builds using Gemini 1.5 LLM.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      techStack: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'Gemini AI'],
      status: 'Winner',
      stars: 342,
      views: 4890,
    },
    {
      id: 'p2',
      title: 'Glassmorphic Developer OS',
      description: 'Ultra-luxurious desktop & web interface design system with liquid glass reflection and 60fps animations.',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      techStack: ['React', 'TailwindCSS', 'Framer Motion', 'Three.js'],
      status: 'Live',
      stars: 512,
      views: 7820,
    },
    {
      id: 'p3',
      title: 'VectorMind Semantic Memory Engine',
      description: 'Sub-millisecond RAG vector search engine with localized hybrid embeddings and graph caching.',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      techStack: ['Go', 'Qdrant', 'gRPC', 'PostgreSQL', 'Redis'],
      status: 'Live',
      stars: 219,
      views: 3100,
    },
  ];

  const activeProjects = projects.length > 0 ? projects : defaultProjects;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0B0B0B]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] mb-8 relative text-white"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <FolderGit2 className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white tracking-tight">Recent Projects</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Production builds and hackathon project submissions authored by this developer.
          </p>
        </div>

        <span className="text-xs font-mono text-zinc-400 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-semibold">
          {activeProjects.length} Featured
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeProjects.map((proj, idx) => {
          let stack = [];
          try {
            stack = typeof proj.techStack === 'string' ? JSON.parse(proj.techStack) : (proj.techStack || []);
          } catch (e) {
            stack = ['React', 'Python', 'AI'];
          }

          return (
            <motion.div
              key={proj.id || idx}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-xl overflow-hidden flex flex-col justify-between group shadow-xl relative"
            >
              {/* Project Image Header */}
              <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                <img
                  src={proj.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Status Pill Top Right */}
                <div className="absolute top-3 right-3 flex items-center space-x-1 px-3 py-1 rounded-full bg-black/80 border border-white/20 backdrop-blur-md text-[10px] font-mono font-bold text-white uppercase tracking-wider shadow-lg">
                  {proj.status === 'Winner' ? (
                    <Award className="w-3 h-3 text-white" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-white" />
                  )}
                  <span>{proj.status || 'Live'}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white tracking-tight group-hover:text-zinc-200 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {stack.slice(0, 4).map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300 font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                  {stack.length > 4 && (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-mono text-zinc-500">
                      +{stack.length - 4}
                    </span>
                  )}
                </div>

                {/* Card Footer: Stars & Views */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1 text-white font-bold">
                      <Star className="w-3.5 h-3.5 fill-white text-white" />
                      <span>{proj.stars || 120}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-zinc-400">
                      <Eye className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{proj.views || 850}</span>
                    </span>
                  </div>

                  <span className="text-white hover:text-zinc-300 flex items-center space-x-1 font-mono text-xs font-semibold cursor-pointer">
                    <span>View Project</span>
                    <ExternalLink className="w-3 h-3 text-white" />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

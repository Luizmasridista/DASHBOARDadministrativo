
import { motion } from "framer-motion";
import { CheckCircle, Zap, Play } from "lucide-react";

interface ScreenshotCardProps {
  screenshot: {
    title: string;
    description: string;
    image: string;
    features: string[];
  };
  index: number;
  IconComponent: React.ComponentType<{ className: string }>;
  gradientClass: string;
}

export const ScreenshotCard = ({ screenshot, index, IconComponent, gradientClass }: ScreenshotCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.15, duration: 0.8 }}
      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 lg:p-10 border border-slate-700/50 hover:border-slate-600/70 transition-all duration-500 group hover:transform hover:scale-[1.02] shadow-2xl"
    >
      {/* Header with icon and title */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 bg-gradient-to-r ${gradientClass} rounded-xl shadow-lg`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            Funcionalidade #{index + 1}
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white">
            {screenshot.title}
          </h3>
        </div>
      </div>

      {/* Screenshot Container - Modern Style */}
      <div className="relative mb-8">
        {/* Glow effect */}
        <div className={`absolute -inset-4 bg-gradient-to-r ${gradientClass} rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-700`} />
        
        {/* Browser mockup */}
        <div className="relative bg-slate-900/95 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl">
          {/* Browser header */}
          <div className="bg-slate-800/90 px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="text-slate-300 text-sm font-medium ml-4 truncate">
                FinanceControl - {screenshot.title}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-400">Live</span>
            </div>
          </div>

          {/* Screenshot */}
          <div className="relative">
            <img 
              src={screenshot.image}
              alt={screenshot.title}
              className="w-full h-64 md:h-80 lg:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
            
            {/* Live indicator */}
            <div className="absolute top-4 right-4">
              <div className={`bg-gradient-to-r ${gradientClass} text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-2`}>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Sistema Ativo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 leading-relaxed mb-6 text-center">
        {screenshot.description}
      </p>

      {/* Features Grid */}
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {screenshot.features.map((feature, featureIndex) => (
          <motion.div
            key={featureIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 + featureIndex * 0.1 }}
            className="flex items-center gap-3 p-3 bg-slate-700/30 backdrop-blur-sm rounded-lg border border-slate-600/20 hover:border-slate-500/40 hover:bg-slate-600/30 transition-all duration-300"
          >
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-slate-200 text-sm font-medium">{feature}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${gradientClass} rounded-xl text-white font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300`}>
          <Zap className="w-4 h-4" />
          <span>Testar Agora</span>
        </button>
        
        <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700/60 backdrop-blur-sm rounded-xl border border-slate-600/50 text-slate-200 font-medium hover:bg-slate-600/60 hover:border-slate-500/70 transition-all duration-300">
          <Play className="w-4 h-4" />
          <span>Ver Demo</span>
        </button>
      </div>
    </motion.div>
  );
};

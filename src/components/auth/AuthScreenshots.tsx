
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, TrendingUp, Brain, Monitor, Play, ExternalLink } from "lucide-react";
import { softwareScreenshots } from "@/constants/authData";
import { useResponsive } from "@/hooks/useResponsive";

export const AuthScreenshots = () => {
  const { isMobile, isTablet } = useResponsive();

  const getIconForIndex = (index: number) => {
    switch (index) {
      case 0: return TrendingUp;
      case 1: return Sparkles;
      case 2: return Brain;
      default: return CheckCircle;
    }
  };

  const getGradientForIndex = (index: number) => {
    switch (index) {
      case 0: return "from-emerald-500 via-blue-500 to-purple-500";
      case 1: return "from-blue-500 via-purple-500 to-pink-500";
      case 2: return "from-purple-500 via-pink-500 to-rose-500";
      default: return "from-blue-500 via-purple-500 to-pink-500";
    }
  };

  return (
    <section className="relative z-10 py-16 md:py-24 lg:py-32 px-4 md:px-6 bg-gradient-to-b from-slate-800/20 to-slate-900/40 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-500/20 mb-6">
            <Monitor className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Interface Real do Sistema</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
            Veja o poder do{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              FinanceControl
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Screenshots reais da nossa plataforma em funcionamento. Cada funcionalidade foi desenvolvida 
            para transformar a gestão financeira da sua empresa.
          </p>
        </motion.div>

        <div className="space-y-16 md:space-y-24 lg:space-y-32">
          {softwareScreenshots.map((screenshot, index) => {
            const IconComponent = getIconForIndex(index);
            const gradientClass = getGradientForIndex(index);
            const isReversed = index % 2 === 1 && !isMobile && !isTablet;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.15, duration: 0.8 }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center ${isReversed ? 'lg:grid-flow-col-dense' : ''}`}
              >
                {/* Screenshot Container */}
                <div className={`lg:col-span-7 ${isReversed ? 'lg:col-start-6' : ''}`}>
                  <div className="relative group">
                    {/* Glow effect */}
                    <div className={`absolute -inset-4 bg-gradient-to-r ${gradientClass} rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-all duration-700`} />
                    
                    {/* Main container */}
                    <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl md:rounded-3xl p-3 md:p-4 lg:p-6 border border-slate-700/50 hover:border-slate-600/70 transition-all duration-500 group-hover:transform group-hover:scale-[1.02] shadow-2xl">
                      
                      {/* Browser mockup header */}
                      <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 border border-slate-700/60 mb-3 md:mb-4 shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="flex gap-1.5 md:gap-2">
                              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full shadow-sm" />
                              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-yellow-500 rounded-full shadow-sm" />
                              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full shadow-sm" />
                            </div>
                            <div className="text-slate-300 text-xs md:text-sm font-medium ml-2 md:ml-4 truncate">
                              {isMobile ? "FinanceControl" : `${screenshot.title} - FinanceControl`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <IconComponent className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                            <span className="text-xs text-slate-400 hidden sm:inline">Live</span>
                          </div>
                        </div>
                      </div>

                      {/* Screenshot */}
                      <div className="relative overflow-hidden rounded-xl md:rounded-2xl">
                        <img 
                          src={screenshot.image}
                          alt={screenshot.title}
                          className="w-full h-48 sm:h-64 md:h-72 lg:h-80 xl:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        
                        {/* Overlay with play button */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileHover={{ scale: 1, opacity: 1 }}
                            className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30"
                          >
                            <Play className="w-8 h-8 text-white fill-white" />
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Badge */}
                      <div className="absolute top-8 md:top-12 right-4 md:right-6">
                        <div className={`bg-gradient-to-r ${gradientClass} text-white text-xs md:text-sm font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-lg`}>
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`lg:col-span-5 space-y-6 md:space-y-8 ${isReversed ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`p-2.5 md:p-3 lg:p-4 bg-gradient-to-r ${gradientClass} rounded-xl md:rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <div className="text-xs md:text-sm font-bold text-blue-400 uppercase tracking-wider">
                        Funcionalidade #{index + 1}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                      {screenshot.title}
                    </h3>
                    
                    <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                      {screenshot.description}
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid gap-3 md:gap-4">
                    {screenshot.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 + featureIndex * 0.1 }}
                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-800/40 backdrop-blur-sm rounded-lg md:rounded-xl border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-700/40 transition-all duration-300 group"
                      >
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400 group-hover:scale-110 transition-transform duration-200" />
                        </div>
                        <span className="text-slate-200 font-medium text-sm md:text-base">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4"
                  >
                    <button className={`inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r ${gradientClass} rounded-lg md:rounded-xl text-white font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 text-sm md:text-base`}>
                      <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Testar Funcionalidade</span>
                    </button>
                    
                    <button className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-slate-700/60 backdrop-blur-sm rounded-lg md:rounded-xl border border-slate-600/50 text-slate-200 font-medium hover:bg-slate-600/60 hover:border-slate-500/70 transition-all duration-300 text-sm md:text-base">
                      <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Ver Demonstração</span>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="text-center mt-16 md:mt-20 lg:mt-24 p-6 md:p-8 lg:p-12 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-slate-700/50 relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 opacity-50"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 md:mb-4">
              Pronto para revolucionar sua gestão financeira?
            </h3>
            <p className="text-slate-300 mb-6 md:mb-8 text-sm md:text-base">
              Junte-se a centenas de empresas que já transformaram seus resultados
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Sistema 100% funcional</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Dados em tempo real</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span>IA integrada</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


import { motion } from "framer-motion";
import { CheckCircle, Sparkles, TrendingUp, Brain } from "lucide-react";
import { softwareScreenshots } from "@/constants/authData";

export const AuthScreenshots = () => {
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
      case 0: return "from-green-500/20 to-blue-500/20";
      case 1: return "from-blue-500/20 to-purple-500/20";
      case 2: return "from-purple-500/20 to-pink-500/20";
      default: return "from-blue-500/20 to-purple-500/20";
    }
  };

  return (
    <section className="relative z-10 py-24 px-6 bg-gradient-to-b from-slate-800/30 to-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Interface Real do Sistema</span>
          </div>
          <h2 className="text-5xl font-bold text-white mb-6">
            Veja o poder do
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> FinanceControl</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Screenshots reais da nossa plataforma em funcionamento. Cada funcionalidade foi desenvolvida 
            para transformar a gestão financeira da sua empresa.
          </p>
        </motion.div>

        <div className="space-y-24">
          {softwareScreenshots.map((screenshot, index) => {
            const IconComponent = getIconForIndex(index);
            const gradientClass = getGradientForIndex(index);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.2, duration: 0.8 }}
                className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
              >
                {/* Screenshot com efeitos aprimorados */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-60`} />
                    <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-slate-600/70 transition-all duration-500 group-hover:transform group-hover:scale-[1.02]">
                      <img 
                        src={screenshot.image}
                        alt={screenshot.title}
                        className="w-full h-72 lg:h-96 object-cover rounded-2xl shadow-2xl"
                      />
                      {/* Browser mockup header melhorado */}
                      <div className="absolute top-10 left-10 right-10">
                        <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl px-6 py-3 border border-slate-700/60 shadow-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm" />
                                <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm" />
                                <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm" />
                              </div>
                              <div className="text-slate-300 text-sm font-medium ml-4">
                                {screenshot.title} - FinanceControl
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4 text-blue-400" />
                              <span className="text-xs text-slate-400">Live</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conteúdo aprimorado */}
                <div className={`space-y-8 ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 bg-gradient-to-r ${gradientClass} rounded-2xl border border-slate-700/50`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-sm font-medium text-blue-400 uppercase tracking-wider">
                        Funcionalidade #{index + 1}
                      </div>
                    </div>
                    
                    <h3 className="text-4xl font-bold text-white leading-tight">
                      {screenshot.title}
                    </h3>
                    
                    <p className="text-lg text-slate-300 leading-relaxed">
                      {screenshot.description}
                    </p>
                  </div>

                  {/* Features com design aprimorado */}
                  <div className="grid gap-4">
                    {screenshot.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.2 + featureIndex * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
                      >
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <span className="text-slate-200 font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA button para cada funcionalidade */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.2 }}
                    className="pt-4"
                  >
                    <button className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${gradientClass} rounded-xl border border-slate-700/50 text-white font-medium hover:scale-105 transition-transform duration-200`}>
                      <IconComponent className="w-5 h-5" />
                      <span>Experimentar esta funcionalidade</span>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to action final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mt-20 p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl border border-slate-700/50"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Pronto para revolucionar sua gestão financeira?
          </h3>
          <p className="text-slate-300 mb-6">
            Junte-se a centenas de empresas que já transformaram seus resultados
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
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
        </motion.div>
      </div>
    </section>
  );
};

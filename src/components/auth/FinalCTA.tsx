
import { motion } from "framer-motion";

export const FinalCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6 }}
      className="text-center mt-16 md:mt-20 p-8 md:p-12 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-3xl border border-slate-700/50 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 opacity-50"></div>
      
      <div className="relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Pronto para revolucionar sua gestão financeira?
        </h3>
        <p className="text-slate-300 mb-8">
          Junte-se a centenas de empresas que já transformaram seus resultados
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
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
  );
};

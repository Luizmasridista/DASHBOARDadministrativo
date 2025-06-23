
import { motion } from "framer-motion";
import { Monitor } from "lucide-react";

export const ScreenshotHeader = () => {
  return (
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
  );
};

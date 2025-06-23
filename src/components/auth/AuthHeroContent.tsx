
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { benefits, platformTools } from "@/constants/authData";

export const AuthHeroContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="space-y-6">
        <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
          Controle financeiro
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> inteligente</span>
        </h1>
        <p className="text-xl text-slate-300 leading-relaxed">
          Transforme a gestão financeira da sua empresa com relatórios em tempo real, 
          análises inteligentes e segurança de nível bancário.
        </p>
      </div>

      {/* Benefits List */}
      <div className="space-y-4">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
            className="flex items-center gap-3 text-slate-200"
          >
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span>{benefit}</span>
          </motion.div>
        ))}
      </div>

      {/* Platform Tools */}
      <div className="grid grid-cols-2 gap-4 pt-6">
        {platformTools.map((tool, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
            className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <tool.icon className="w-6 h-6 text-green-500" />
              <h3 className="text-sm font-semibold text-white">{tool.title}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{tool.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

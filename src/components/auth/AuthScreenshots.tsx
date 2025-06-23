
import { motion } from "framer-motion";
import { Monitor } from "lucide-react";
import { ModernCarousel } from "./ModernCarousel";

export const AuthScreenshots = () => {
  const carouselItems = [
    {
      id: 1,
      image: "/lovable-uploads/e549a6d4-f1e8-47cf-9779-96648a7b0d1e.png",
      title: "Dashboard Executivo",
      description: "Visualize métricas financeiras essenciais em tempo real. Acompanhe receitas, despesas, lucro líquido e margem de lucro com indicadores de performance avançados como ROI, Burn Rate e análises de crescimento."
    },
    {
      id: 2,
      image: "/lovable-uploads/49e4b19a-0b59-44f0-947e-79a54ab993d3.png",
      title: "Recomendações Estratégicas",
      description: "Receba insights inteligentes e recomendações personalizadas baseadas em IA. O sistema analisa seus dados financeiros e sugere ações prioritárias para otimizar resultados e identificar oportunidades."
    },
    {
      id: 3,
      image: "/lovable-uploads/466b244d-c739-402b-b8dc-46ee34a84767.png",
      title: "Análise com IA",
      description: "Assistente de inteligência artificial que fornece análises financeiras detalhadas. Obtenha insights estratégicos automáticos, detecção de riscos e recomendações personalizadas para sua empresa."
    }
  ];

  return (
    <section className="relative z-10 py-16 md:py-24 lg:py-32 px-4 md:px-6 bg-gradient-to-b from-slate-800/20 to-slate-900/60 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
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

        {/* Modern Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <ModernCarousel items={carouselItems} autoSlideInterval={5000} />
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
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
      </div>
    </section>
  );
};

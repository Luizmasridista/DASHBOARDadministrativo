
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { softwareScreenshots } from "@/constants/authData";

export const AuthScreenshots = () => {
  return (
    <section className="relative z-10 py-20 px-6 bg-slate-800/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Veja o sistema em ação
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Interface intuitiva e poderosa que facilita sua gestão financeira
          </p>
        </motion.div>

        <div className="space-y-16">
          {softwareScreenshots.map((screenshot, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.2, duration: 0.8 }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
            >
              {/* Screenshot */}
              <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  <div className="relative bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                    <img 
                      src={screenshot.image}
                      alt={screenshot.title}
                      className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-2xl"
                    />
                    <div className="absolute top-8 left-8 right-8">
                      <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                          </div>
                          <div className="text-slate-300 text-sm font-medium ml-4">
                            FinanceControl - {screenshot.title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {screenshot.title}
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {screenshot.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {screenshot.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-slate-200">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

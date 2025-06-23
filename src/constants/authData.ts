
import { BarChart3, TrendingUp, ShieldCheck, Zap, FileSpreadsheet, Calculator, PieChart, Calendar, Settings, Download, CheckCircle } from "lucide-react";

export const features = [
  {
    icon: BarChart3,
    title: "Relatórios em Tempo Real",
    description: "Visualize suas finanças com gráficos dinâmicos e relatórios atualizados instantaneamente."
  },
  {
    icon: TrendingUp,
    title: "Análise de Tendências",
    description: "Identifique padrões e oportunidades com nossa IA avançada de análise financeira."
  },
  {
    icon: ShieldCheck,
    title: "Segurança Máxima",
    description: "Seus dados protegidos com criptografia de nível bancário e backup automático."
  },
  {
    icon: Zap,
    title: "Integração Automática",
    description: "Conecte suas contas e planilhas automaticamente, sem trabalho manual."
  }
];

export const benefits = [
  "Redução de 80% no tempo de preparação de relatórios",
  "Visibilidade completa do fluxo de caixa",
  "Alertas inteligentes para anomalias financeiras",
  "Exportação para Excel e PDF com um clique"
];

export const platformTools = [
  {
    icon: FileSpreadsheet,
    title: "Planilhas Inteligentes",
    description: "Conecte e sincronize automaticamente suas planilhas do Google Sheets e Excel"
  },
  {
    icon: Calculator,
    title: "Calculadora Financeira",
    description: "Ferramentas avançadas para cálculos de ROI, juros compostos e projeções"
  },
  {
    icon: PieChart,
    title: "Dashboard Interativo",
    description: "Gráficos e métricas em tempo real com análise de tendências automatizada"
  },
  {
    icon: Calendar,
    title: "Planejamento Mensal",
    description: "Organize orçamentos e metas com cronogramas personalizáveis"
  },
  {
    icon: Settings,
    title: "Automação de Processos",
    description: "Configure fluxos automáticos para relatórios e notificações"
  },
  {
    icon: Download,
    title: "Exportação Avançada",
    description: "Exporte dados em múltiplos formatos: Excel, PDF, CSV com formatação personalizada"
  }
];

export const softwareScreenshots = [
  {
    title: "Painel Executivo Completo",
    description: "Dashboard executivo com visão 360° das suas finanças. Acompanhe receitas, despesas, lucro líquido e margem de lucro em tempo real. Métricas avançadas como ROI, Burn Rate e projeções automáticas para tomada de decisão estratégica.",
    image: "/screenshots/dashboard-executivo.jpg",
    features: ["Métricas executivas em tempo real", "Análise de ROI e margem de lucro", "Projeções automáticas de crescimento", "Alertas de performance financeira"]
  },
  {
    title: "Projeção Inteligente de Fluxo de Caixa",
    description: "Sistema avançado de projeção de fluxo de caixa baseado em tendências históricas e machine learning. Visualize a evolução do seu saldo ao longo do tempo com gráficos interativos e análises preditivas para planejamento estratégico.",
    image: "/screenshots/projecao-fluxo.jpg",
    features: ["Projeções baseadas em IA", "Análise de tendências históricas", "Gráficos interativos avançados", "Planejamento de fluxo futuro"]
  },
  {
    title: "Assistente IA Financeiro",
    description: "Assistente de inteligência artificial integrado que analisa seus dados financeiros e fornece insights personalizados. Receba recomendações estratégicas, detecte riscos e oportunidades automaticamente com análise financeira inteligente.",
    image: "/screenshots/assistente-ia.jpg",
    features: ["Análise financeira por IA", "Recomendações personalizadas", "Detecção automática de riscos", "Chat inteligente para consultas"]
  }
];

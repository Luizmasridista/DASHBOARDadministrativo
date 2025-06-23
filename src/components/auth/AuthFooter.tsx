
export const AuthFooter = () => {
  return (
    <footer className="relative z-10 py-8 px-6 border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <img 
            src="/lovable-uploads/d206fe24-569e-4a35-96a6-2a9262522005.png" 
            alt="Logo" 
            className="h-6 w-auto"
          />
          <span>© 2024 FinanceControl. Todos os direitos reservados.</span>
        </div>
        <div className="text-xs text-slate-500">
          Protegido por Supabase • SSL Certificado
        </div>
      </div>
    </footer>
  );
};

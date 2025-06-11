
import { ReactNode } from "react";
import { FileSpreadsheet, Key, Share, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TutorialStep {
  title: string;
  description: string;
  icon: ReactNode;
  content: ReactNode;
}

export const tutorialSteps: TutorialStep[] = [
  {
    title: "1. Prepare sua Planilha",
    description: "Configure sua planilha do Google Sheets com a estrutura correta",
    icon: <FileSpreadsheet className="w-6 h-6" />,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sua planilha deve ter exatamente estas colunas na primeira linha:
        </p>
        <div className="bg-muted/50 dark:bg-muted/20 p-4 rounded-lg border border-border">
          <div className="grid grid-cols-4 gap-2 text-sm font-medium mb-2">
            <div className="p-2 bg-card border border-border rounded text-center">Data</div>
            <div className="p-2 bg-card border border-border rounded text-center">Categoria</div>
            <div className="p-2 bg-card border border-border rounded text-center">Descrição</div>
            <div className="p-2 bg-card border border-border rounded text-center">Valor</div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Exemplo: 01/06/2024 | Receita | Vendas | 1500.00
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Dica:</strong> Use "Receita" ou "Despesa" na coluna Categoria para classificar automaticamente os valores.
          </p>
        </div>
      </div>
    )
  },
  {
    title: "2. Torne a Planilha Pública",
    description: "Configure as permissões para permitir acesso aos dados",
    icon: <Share className="w-6 h-6" />,
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Badge variant="outline" className="mt-1">1</Badge>
            <p className="text-sm">No Google Sheets, clique em <strong>"Compartilhar"</strong> (canto superior direito)</p>
          </div>
          <div className="flex items-start space-x-3">
            <Badge variant="outline" className="mt-1">2</Badge>
            <p className="text-sm">Clique em <strong>"Alterar para qualquer pessoa com o link"</strong></p>
          </div>
          <div className="flex items-start space-x-3">
            <Badge variant="outline" className="mt-1">3</Badge>
            <p className="text-sm">Selecione <strong>"Visualizador"</strong> nas permissões</p>
          </div>
          <div className="flex items-start space-x-3">
            <Badge variant="outline" className="mt-1">4</Badge>
            <p className="text-sm">Clique em <strong>"Copiar link"</strong></p>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/50 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <strong>Importante:</strong> Certifique-se de que a planilha está definida como "Qualquer pessoa com o link" para que o sistema possa acessá-la.
          </p>
        </div>
      </div>
    )
  },
  {
    title: "3. Extraia o ID da Planilha",
    description: "Copie o ID necessário do link da sua planilha",
    icon: <Key className="w-6 h-6" />,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          No link da sua planilha, o ID está entre <code className="bg-muted px-1 rounded text-xs">/spreadsheets/d/</code> e <code className="bg-muted px-1 rounded text-xs">/edit</code>:
        </p>
        <div className="bg-muted/50 dark:bg-muted/20 p-4 rounded-lg border border-border font-mono text-xs">
          <p className="break-all">
            https://docs.google.com/spreadsheets/d/<span className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</span>/edit#gid=0
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/50 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">
            <strong>Exemplo:</strong> No link acima, o ID seria: <code className="bg-muted px-1 rounded text-xs">1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</code>
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Como copiar o ID:</p>
          <ol className="text-sm space-y-1 list-decimal list-inside ml-4">
            <li>Selecione apenas a parte destacada do link</li>
            <li>Copie com Ctrl+C (ou Cmd+C no Mac)</li>
            <li>Cole no campo "ID da Planilha" no próximo passo</li>
          </ol>
        </div>
      </div>
    )
  },
  {
    title: "4. Conecte no Sistema",
    description: "Use o ID da planilha para conectar seus dados",
    icon: <Database className="w-6 h-6" />,
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Badge variant="outline" className="mt-1">1</Badge>
            <p className="text-sm">Clique no botão <strong>"Carregar Planilha"</strong></p>
          </div>
          <div className="flex items-start space-x-3">
            <Badge variant="outline" className="mt-1">2</Badge>
            <p className="text-sm">Cole o ID da planilha no campo correspondente</p>
          </div>
          <div className="flex items-start space-x-3">
            <Badge variant="outline" className="mt-1">3</Badge>
            <p className="text-sm">Defina o intervalo (padrão: A1:D100 funciona na maioria dos casos)</p>
          </div>
          <div className="flex items-start space-x-3">
            <Badge variant="outline" className="mt-1">4</Badge>
            <p className="text-sm">Clique em <strong>"Conectar Planilha"</strong></p>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/50 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">
            <strong>Sucesso!</strong> Após conectar, seus dados aparecerão automaticamente no dashboard em tempo real.
          </p>
        </div>
      </div>
    )
  }
];

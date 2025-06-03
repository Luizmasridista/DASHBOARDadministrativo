
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, FileSpreadsheet, Key, Share, Database, ArrowRight, ExternalLink } from "lucide-react";

const SpreadsheetTutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "1. Prepare sua Planilha",
      description: "Configure sua planilha do Google Sheets com a estrutura correta",
      icon: <FileSpreadsheet className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Sua planilha deve ter exatamente estas colunas na primeira linha:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="grid grid-cols-4 gap-2 text-sm font-medium mb-2">
              <div className="p-2 bg-white rounded border text-center">Data</div>
              <div className="p-2 bg-white rounded border text-center">Categoria</div>
              <div className="p-2 bg-white rounded border text-center">Descrição</div>
              <div className="p-2 bg-white rounded border text-center">Valor</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Exemplo: 01/06/2024 | Receita | Vendas | 1500.00
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
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
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-700">
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
          <p className="text-sm text-gray-600">
            No link da sua planilha, o ID está entre <code>/spreadsheets/d/</code> e <code>/edit</code>:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border font-mono text-xs">
            <p className="break-all">
              https://docs.google.com/spreadsheets/d/<span className="bg-yellow-200 px-1 rounded">1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</span>/edit#gid=0
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Exemplo:</strong> No link acima, o ID seria: <code>1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</code>
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
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>Sucesso!</strong> Após conectar, seus dados aparecerão automaticamente no dashboard em tempo real.
            </p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                index <= currentStep
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-2 ${
                  index < currentStep ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              {steps[currentStep].icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
              <p className="text-sm text-gray-600 font-normal">{steps[currentStep].description}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {steps[currentStep].content}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center space-x-2"
        >
          <span>Anterior</span>
        </Button>
        
        <div className="flex space-x-2">
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('navigateToConnect'));
              }}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <span>Ir para Conectar Planilha</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="flex items-center space-x-2"
            >
              <span>Próximo</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetTutorial;

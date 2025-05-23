
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorDisplayProps {
  onRetry: () => void;
}

const ErrorDisplay = ({ onRetry }: ErrorDisplayProps) => {
  return (
    <div className="flex items-center justify-center h-96">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          
          <h2 className="text-xl font-semibold text-red-600">
            Erro ao Carregar Dados
          </h2>
          
          <p className="text-muted-foreground">
            Houve um problema ao buscar os dados da planilha. Por favor, tente novamente.
          </p>
          
          <div className="text-sm text-muted-foreground bg-slate-100 p-4 rounded-lg">
            <p className="font-medium mb-2">FAILED_PRECONDITION:</p>
            <p>Please pass in the API key or set the GEMINI_API_KEY or GOOGLE_API_KEY environment variable. For more details see</p>
            <p className="mt-2 text-xs">https://firebase.google.com/docs/genkit/plugins/google-genai</p>
          </div>
          
          <Button onClick={onRetry} className="w-full bg-red-600 hover:bg-red-700">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorDisplay;

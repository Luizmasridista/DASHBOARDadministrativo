
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";

interface AddAPIConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (apiKey: string, projectName: string, description?: string) => Promise<any>;
  loading: boolean;
}

const AddAPIConnectionModal = ({ open, onOpenChange, onAdd, loading }: AddAPIConnectionModalProps) => {
  const [apiKey, setApiKey] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim() || !projectName.trim()) {
      return;
    }

    try {
      await onAdd(apiKey.trim(), projectName.trim(), description.trim() || undefined);
      
      // Reset form
      setApiKey("");
      setProjectName("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleClose = () => {
    if (!loading) {
      setApiKey("");
      setProjectName("");
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Adicionar Nova API</span>
          </DialogTitle>
          <DialogDescription>
            Adicione uma nova conexão com a API do Google Sheets
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nome do Projeto*</Label>
            <Input
              id="project-name"
              placeholder="Ex: Dashboard Financeiro"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-key">Chave da API*</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">
              Sua chave será validada antes de ser salva
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descrição da API ou uso específico"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !apiKey.trim() || !projectName.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAPIConnectionModal;


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReceitaForm } from "@/components/forms/ReceitaForm";
import { DespesaForm } from "@/components/forms/DespesaForm";

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'receita' | 'despesa' | null;
}

export function QuickActionModal({ isOpen, onClose, actionType }: QuickActionModalProps) {
  const getTitle = () => {
    switch (actionType) {
      case 'receita': return 'Adicionar Receita';
      case 'despesa': return 'Adicionar Despesa';
      default: return '';
    }
  };

  const renderForm = () => {
    switch (actionType) {
      case 'receita':
        return <ReceitaForm onSuccess={onClose} />;
      case 'despesa':
        return <DespesaForm onSuccess={onClose} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}

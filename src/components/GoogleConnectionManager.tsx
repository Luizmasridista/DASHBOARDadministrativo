
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Settings, RefreshCw, Trash2, ExternalLink, Shield, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useGoogleConnections, GoogleConnection } from "@/hooks/useGoogleConnections";
import { toast } from "@/hooks/use-toast";

const GoogleConnectionManager = () => {
  const { connections, loading, generateAuthUrl, handleOAuthCallback, refreshConnection, revokeConnection, deleteConnection } = useGoogleConnections();
  const [isAddingConnection, setIsAddingConnection] = useState(false);
  const [newConnection, setNewConnection] = useState({
    clientId: "",
    clientSecret: "",
    projectName: "",
    redirectUri: `${window.location.origin}/oauth/callback`
  });

  const handleAddConnection = async () => {
    if (!newConnection.clientId || !newConnection.clientSecret || !newConnection.projectName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const authUrl = await generateAuthUrl(
        newConnection.clientId, 
        newConnection.redirectUri, 
        newConnection.projectName
      );
      
      // Store connection details for OAuth callback
      sessionStorage.setItem('oauth_connection_details', JSON.stringify(newConnection));
      
      // Open OAuth flow in popup
      const popup = window.open(authUrl, 'oauth_popup', 'width=500,height=600');
      
      // Listen for popup closure
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsAddingConnection(false);
        }
      }, 1000);

    } catch (error) {
      console.error('Error starting OAuth flow:', error);
    }
  };

  const getStatusBadge = (status: GoogleConnection['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ativa</Badge>;
      case 'expired':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Expirada</Badge>;
      case 'revoked':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Revogada</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isTokenExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry < 24 && hoursUntilExpiry > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Conexões Google Sheets</span>
            </div>
            <Dialog open={isAddingConnection} onOpenChange={setIsAddingConnection}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Conexão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Conexão Google</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Nome do Projeto</Label>
                    <Input
                      id="projectName"
                      placeholder="Ex: Planilhas da Empresa X"
                      value={newConnection.projectName}
                      onChange={(e) => setNewConnection(prev => ({
                        ...prev,
                        projectName: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      placeholder="Seu Google Client ID"
                      value={newConnection.clientId}
                      onChange={(e) => setNewConnection(prev => ({
                        ...prev,
                        clientId: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      placeholder="Seu Google Client Secret"
                      value={newConnection.clientSecret}
                      onChange={(e) => setNewConnection(prev => ({
                        ...prev,
                        clientSecret: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="redirectUri">Redirect URI</Label>
                    <Input
                      id="redirectUri"
                      value={newConnection.redirectUri}
                      onChange={(e) => setNewConnection(prev => ({
                        ...prev,
                        redirectUri: e.target.value
                      }))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Esta URI deve estar configurada no seu projeto Google Cloud Console
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleAddConnection} className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Autorizar com Google
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingConnection(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Gerencie suas conexões OAuth 2.0 com diferentes contas Google para acessar planilhas de múltiplos projetos.
          </div>

          {connections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma conexão Google configurada</p>
              <p className="text-sm">Adicione uma conexão para começar a usar planilhas Google</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <Card key={connection.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium">{connection.account_name || connection.account_email}</h4>
                            <p className="text-sm text-muted-foreground">{connection.account_email}</p>
                          </div>
                          {getStatusBadge(connection.status)}
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Projeto:</strong> {connection.project_name}</p>
                          <p><strong>Criado em:</strong> {formatDate(connection.created_at)}</p>
                          {connection.last_used_at && (
                            <p><strong>Último uso:</strong> {formatDate(connection.last_used_at)}</p>
                          )}
                          {connection.token_expires_at && (
                            <p>
                              <strong>Token expira em:</strong> {formatDate(connection.token_expires_at)}
                              {isTokenExpiringSoon(connection.token_expires_at) && (
                                <Badge variant="outline" className="ml-2 text-orange-600">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Expira em breve
                                </Badge>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {(connection.status === 'expired' || connection.status === 'error') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refreshConnection(connection.id, '', '')}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeConnection(connection.id)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover Conexão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover esta conexão? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteConnection(connection.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Como Configurar</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Passo a passo para criar credenciais OAuth 2.0:</h4>
            
            <div className="space-y-2 text-sm">
              <p><strong>1.</strong> Acesse o <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></p>
              <p><strong>2.</strong> Crie um novo projeto ou selecione um existente</p>
              <p><strong>3.</strong> Ative a API do Google Sheets no seu projeto</p>
              <p><strong>4.</strong> Vá para "Credenciais" → "Criar credenciais" → "ID do cliente OAuth 2.0"</p>
              <p><strong>5.</strong> Configure a tela de consentimento OAuth</p>
              <p><strong>6.</strong> Adicione as URIs de redirecionamento autorizadas:</p>
              <div className="ml-4 bg-gray-100 p-2 rounded font-mono text-xs">
                {window.location.origin}/oauth/callback
              </div>
              <p><strong>7.</strong> Copie o Client ID e Client Secret gerados</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Escopos necessários:</h4>
              <ul className="text-sm space-y-1 ml-4">
                <li>• https://www.googleapis.com/auth/spreadsheets.readonly</li>
                <li>• https://www.googleapis.com/auth/userinfo.email</li>
                <li>• https://www.googleapis.com/auth/userinfo.profile</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleConnectionManager;

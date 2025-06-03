
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { useGoogleConnections } from "@/hooks/useGoogleConnections";

const OAuthCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando autorização...');
  const { handleOAuthCallback } = useGoogleConnections();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('Authorization code not received');
        }

        // Get stored connection details
        const storedDetails = sessionStorage.getItem('oauth_connection_details');
        if (!storedDetails) {
          throw new Error('Connection details not found in session');
        }

        const connectionDetails = JSON.parse(storedDetails);
        
        // Process the OAuth callback
        await handleOAuthCallback(
          code,
          connectionDetails.clientId,
          connectionDetails.clientSecret,
          connectionDetails.redirectUri,
          state
        );

        // Clean up session storage
        sessionStorage.removeItem('oauth_connection_details');

        setStatus('success');
        setMessage('Autorização concluída com sucesso!');

        // Notify parent window and close popup if in popup
        if (window.opener) {
          window.opener.postMessage({ type: 'oauth_success' }, '*');
          window.close();
        } else {
          // If not in popup, redirect after a delay
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erro desconhecido durante a autorização');

        // Notify parent window if in popup
        if (window.opener) {
          window.opener.postMessage({ type: 'oauth_error', error: error.message }, '*');
          setTimeout(() => window.close(), 3000);
        }
      }
    };

    processCallback();
  }, [handleOAuthCallback]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-12 h-12 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-500" />;
    }
  };

  const getCardClass = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className={`w-full max-w-md ${getCardClass()}`}>
        <CardHeader>
          <CardTitle className="text-center">
            Autorização Google
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {getIcon()}
          <p className="text-lg">{message}</p>
          {status === 'success' && !window.opener && (
            <p className="text-sm text-muted-foreground">
              Redirecionando para o dashboard...
            </p>
          )}
          {status === 'error' && window.opener && (
            <p className="text-sm text-muted-foreground">
              Esta janela será fechada automaticamente.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;

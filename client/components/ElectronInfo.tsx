import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/ui/card';
import { Button } from '../src/components/ui/button';
import { Badge } from '../src/components/ui/badge';
import { Alert, AlertDescription } from '../src/components/ui/alert';
import { Info, Download, Upload, MessageSquare } from 'lucide-react';
import { logger } from '../src/lib/logger';

const ElectronInfo: React.FC = () => {
  const [appInfo, setAppInfo] = useState<{
    version: string;
    name: string;
    platform: string;
    isElectron: boolean;
  }>({
    version: '',
    name: '',
    platform: '',
    isElectron: false
  });
  const [lastAction, setLastAction] = useState<string>('');

  useEffect(() => {
    const isElectron = window.electronAPI !== undefined;
    
    if (isElectron && window.electronAPI) {
      // Get app information
      Promise.all([
        window.electronAPI.getAppVersion(),
        window.electronAPI.getAppName(),
        window.electronAPI.getPlatform()
      ]).then(([version, name, platform]) => {
        setAppInfo({
          version,
          name,
          platform,
          isElectron: true
        });
      });

      // Listen for menu actions
      window.electronAPI.onMenuAction((action) => {
        setLastAction(action);
        logger.info('Menu action received:', action);
      });
    } else {
      setAppInfo({
        version: 'Web Version',
        name: 'HRMS Elite Web',
        platform: navigator.platform,
        isElectron: false
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeMenuActionListener();
      }
    };
  }, []);

  const handleSaveDialog = async () => {
    if (!window.electronAPI) {
      logger.warn('Save dialog feature is only available in the desktop application.');
      return;
    }

    try {
      const result = await window.electronAPI.showSaveDialog({
        title: 'Save Report',
        defaultPath: 'hrms-report.pdf',
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        setLastAction(`File saved to: ${result.filePath}`);
      }
    } catch (error) {
      logger.error('Error showing save dialog:', error);
    }
  };

  const handleOpenDialog = async () => {
    if (!window.electronAPI) {
      logger.warn('Open dialog feature is only available in the desktop application.');
      return;
    }

    try {
      const result = await window.electronAPI.showOpenDialog({
        title: 'Open Document',
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Documents', extensions: ['pdf', 'docx', 'xlsx'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.canceled && result.filePaths) {
        setLastAction(`Files opened: ${result.filePaths.join(', ')}`);
      }
    } catch (error) {
      logger.error('Error showing open dialog:', error);
    }
  };

  const handleMessageBox = async () => {
    if (!window.electronAPI) {
      logger.warn('Message box feature is only available in the desktop application.');
      return;
    }

    try {
      const result = await window.electronAPI.showMessageBox({
        type: 'info',
        title: 'HRMS Elite',
        message: 'Welcome to HRMS Elite Desktop Application!',
        detail: 'This is a native desktop application with enhanced features.',
        buttons: ['OK', 'Cancel']
      });

      setLastAction(`Message box response: ${result.response}`);
    } catch (error) {
      logger.error('Error showing message box:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Desktop Application Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Application</p>
              <p className="text-lg font-semibold">{appInfo.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Version</p>
              <p className="text-lg font-semibold">{appInfo.version}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Platform</p>
              <p className="text-lg font-semibold">{appInfo.platform}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Environment</p>
              <Badge variant={appInfo.isElectron ? 'default' : 'secondary'}>
                {appInfo.isElectron ? 'Desktop App' : 'Web Browser'}
              </Badge>
            </div>
          </div>

          {appInfo.isElectron && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You are running the desktop application with enhanced features including native file dialogs and system integration.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {appInfo.isElectron && (
        <Card>
          <CardHeader>
            <CardTitle>Desktop Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={handleSaveDialog} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Save Dialog
              </Button>
              <Button onClick={handleOpenDialog} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Open Dialog
              </Button>
              <Button onClick={handleMessageBox} className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Message Box
              </Button>
            </div>

            {lastAction && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Last Action: {lastAction}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {!appInfo.isElectron && (
        <Card>
          <CardHeader>
            <CardTitle>Web Version</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You are running the web version. For enhanced features like native file dialogs and system integration,
   
                please download and install the desktop application.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ElectronInfo; 
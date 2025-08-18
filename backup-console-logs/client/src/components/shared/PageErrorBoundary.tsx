import React, {Component, ErrorInfo, ReactNode} from 'react';
import {AlertTriangle, RefreshCw} from 'lucide-react';
import {Button} from '../ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import logger from '../../lib/logger';


interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class PageErrorBoundary extends Component<Props, State> {

  constructor (props: Props) {

    super(props);
    this.state = {'hasError': false};

  }

  static getDerivedStateFromError (error: Error): State {

    return {'hasError': true, error};

  }

  override componentDidCatch (error: Error, errorInfo: ErrorInfo) {

    logger.error(
      `PageErrorBoundary caught an error in ${this.props.pageName ?? "unknown page"}`,
      {error, errorInfo},
      'PageErrorBoundary'
    );
    this.setState({error});

  }

  handleRetry = () => {

    this.setState({'hasError': false, 'error': null});

  };

  override render () {

    if (this.state.hasError) {

      return (
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-lg text-red-600 dark:text-red-400">
                خطأ في تحميل الصفحة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center text-sm">
                {this.props.pageName
                  ? `حدث خطأ أثناء تحميل صفحة "${this.props.pageName}"`
                  : 'حدث خطأ أثناء تحميل هذه الصفحة'
                }
              </p>

              <Button
                onClick={this.handleRetry}
                className="w-full gap-2"
                variant="default"
              >
                <RefreshCw className="h-4 w-4" />
                إعادة تحميل الصفحة
              </Button>
            </CardContent>
          </Card>
        </div>
      );

    }

    return this.props.children;

  }

}

export default PageErrorBoundary;

// Test file to verify imports work
import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from './src/components/ui/card';
import {Button} from './src/components/ui/button';
import {Input} from './src/components/ui/input';
import {Badge} from './src/components/ui/badge';
import {ScrollArea} from './src/components/ui/scroll-area';
import {useToast} from "./src/hooks/use-toast";

// Test component to use all imports
const TestComponent: React.FC = () => {
  const { toast } = useToast();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Component</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea>
          <Input placeholder="Test input" />
          <Button onClick={() => toast({ title: "Test", description: "Button clicked" })}>
            Test Button
          </Button>
          <Badge>Test Badge</Badge>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

console.log('All imports successful!');
export default TestComponent;

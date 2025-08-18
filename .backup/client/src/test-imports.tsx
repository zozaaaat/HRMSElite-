// Test file to verify imports work
import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from './components/ui/card';
import {Button} from './components/ui/button';
import {Input} from './components/ui/input';
import {Badge} from './components/ui/badge';
import {ScrollArea} from './components/ui/scroll-area';
import {useToast} from "../hooks/use-toast";

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

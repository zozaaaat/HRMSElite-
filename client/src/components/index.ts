// Layout Components
export {Layout} from './layout';
export {Header} from './header';
export {Sidebar} from './sidebar';
export {SharedLayout} from './shared-layout';

// UI Components
export {Button} from './ui/button';
export {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';
export {Avatar, AvatarFallback, AvatarImage} from './ui/avatar';
export {Badge} from './ui/badge';
export {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from './ui/dropdown-menu';
export {Alert, AlertDescription, AlertTitle} from './ui/alert';
export {Input} from './ui/input';
export {Label} from './ui/label';
export {Textarea} from './ui/textarea';
export {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
export {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from './ui/dialog';
export {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from './ui/table';
export {Tabs, TabsContent, TabsList, TabsTrigger} from './ui/tabs';
export {Switch} from './ui/switch';
export {Checkbox} from './ui/checkbox';
export {Progress} from './ui/progress';
export {Separator} from './ui/separator';
export {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from './ui/tooltip';
export {Popover, PopoverContent, PopoverTrigger} from './ui/popover';
export {Calendar} from './ui/calendar';
export {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from './ui/form';
export {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut
} from './ui/command';
export {ScrollArea, ScrollBar} from './ui/scroll-area';
export {Toaster} from './ui/toaster';
export {useToast} from '../hooks/use-toast';

// Shared Components
export {ErrorBoundary} from './shared/ErrorBoundary';
export {ErrorMessage} from './shared/ErrorMessage';
export {LoadingSpinner} from './shared/LoadingSpinner';
export {AppInitializer} from './shared/AppInitializer';

// Other Components
export {CompanyCard} from './company-card';
export {ThemeProvider} from './theme-provider';
export {EmployeeForm} from './employee-form';
export {default as DocumentForm} from './document-form';
export {NotificationCenter} from './notification-center';

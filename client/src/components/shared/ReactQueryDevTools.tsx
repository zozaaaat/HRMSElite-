import {ReactQueryDevtools} from '@tanstack/react-query-devtools';

type ReactQueryDevToolsProps = {
  initialIsOpen?: boolean;
};

export function ReactQueryDevTools({initialIsOpen = false}: ReactQueryDevToolsProps) {
  // Only show devtools in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <ReactQueryDevtools
      initialIsOpen={initialIsOpen}
      buttonPosition="bottom-right"
    />
  );
}

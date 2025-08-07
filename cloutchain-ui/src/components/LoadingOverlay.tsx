import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message: string;
  isVisible: boolean;
}

export const LoadingOverlay = ({ message, isVisible }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay animate-fade-in">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
};
import { cn } from '@/lib/utils';

interface AlertProps {
  message: string;
  variant: 'success' | 'error';
}

export const Alert = ({ message, variant }: AlertProps) => {
  return (
    <div
      className={cn(
        variant === 'success'
          ? 'border-green-500 outline-green-200 text-green-600'
          : variant === 'error'
          ? 'border-red-500 outline-red-200 text-red-600'
          : 'border-primary outline-primary/20 text-primary',
        'border rounded-md outline outline-2 p-2 text-xs text-center',
      )}
    >
      {message}
    </div>
  );
};

import { ShieldCheck } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function AppLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';

  return (
    <div className="flex items-center gap-2 text-primary">
      <ShieldCheck className={`h-${iconSize} w-${iconSize}`} strokeWidth={2.5}/>
      <span className={`font-headline font-bold ${textSize}`}>{APP_NAME}</span>
    </div>
  );
}

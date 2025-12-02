import { Link } from 'react-router-dom';
import { ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface RuleBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function RuleBreadcrumb({ items, className }: RuleBreadcrumbProps) {
  return (
    <nav className={cn('flex items-center gap-2 text-sm', className)}>
      <Link
        to="/rules"
        className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
      >
        <BookOpen className="w-4 h-4" />
        <span>Regles</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-slate-600" />
          {item.href ? (
            <Link
              to={item.href}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

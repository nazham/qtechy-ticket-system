import { Layers } from 'lucide-react';
import { TicketCategory } from '../../constants/enums';

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  let colorClass: string;
  switch (category) {
    case TicketCategory.Bug:
      colorClass = 'bg-red-50 text-red-700 border-red-200';
      break;
    case TicketCategory.FeatureRequest:
      colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case TicketCategory.TechnicalIssue:
      colorClass = 'bg-violet-50 text-violet-700 border-violet-200';
      break;
    case TicketCategory.PaymentIssue:
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case TicketCategory.AccountIssue:
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case TicketCategory.Other:
    default:
      colorClass = 'bg-slate-50 text-slate-700 border-slate-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${colorClass}`}
    >
      <Layers size={12} className="opacity-75" />
      {category}
    </span>
  );
}

import { Check, X, Clock, DollarSign } from 'lucide-react';

type StatusType = 'pending' | 'passed' | 'failed' | 'paid' | 'rejected';

interface StatusBadgeProps {
  status: StatusType;
  text: string;
}

export const StatusBadge = ({ status, text }: StatusBadgeProps) => {
  const getIcon = () => {
    switch (status) {
      case 'passed':
      case 'paid':
        return <Check size={14} />;
      case 'failed':
      case 'rejected':
        return <X size={14} />;
      case 'pending':
        return <Clock size={14} />;
      default:
        return <DollarSign size={14} />;
    }
  };

  const getClassName = () => {
    switch (status) {
      case 'passed':
      case 'paid':
        return 'status-badge status-passed';
      case 'failed':
      case 'rejected':
        return 'status-badge status-failed';
      case 'pending':
        return 'status-badge status-pending';
      default:
        return 'status-badge';
    }
  };

  return (
    <span className={getClassName()}>
      {getIcon()}
      {text}
    </span>
  );
};
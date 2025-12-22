import { CheckCircle, Clock } from 'lucide-react';

interface VerificationBadgeProps {
  verified: boolean;
  variant?: 'default' | 'compact';
}

const VerificationBadge = ({ verified, variant = 'default' }: VerificationBadgeProps) => {
  if (verified) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 gap-1">
        <CheckCircle className="h-3 w-3" />
        {variant === 'default' ? 'VERIFIED' : 'Verified'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 gap-1">
      <Clock className="h-3 w-3" />
      {variant === 'default' ? 'UNVERIFIED' : 'Unverified'}
    </span>
  );
};

export default VerificationBadge;

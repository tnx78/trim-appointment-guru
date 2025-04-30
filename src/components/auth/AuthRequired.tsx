
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LockIcon } from 'lucide-react';

interface AuthRequiredProps {
  message?: string;
  actionText?: string;
  actionLink?: string;
}

export function AuthRequired({ 
  message = "You need to be logged in to access this content", 
  actionText = "Sign In", 
  actionLink = "/auth"
}: AuthRequiredProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted rounded-full p-4 mb-4">
        <LockIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
      <p className="text-muted-foreground max-w-md mb-6">{message}</p>
      <Link to={actionLink}>
        <Button>{actionText}</Button>
      </Link>
    </div>
  );
}

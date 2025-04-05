
import { Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Scissors className="h-5 w-5 text-salon-500" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            TrimGuru &copy; {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-center text-sm text-muted-foreground">
            Built with ♥ for hairdressers
          </p>
        </div>
      </div>
    </footer>
  );
}

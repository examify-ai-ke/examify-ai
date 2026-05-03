import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Search, 
  Plus, 
  Users, 
  BookOpen, 
  AlertCircle,
  Inbox,
  FolderOpen
} from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  className?: string;
}

const defaultIcons = {
  papers: BookOpen,
  search: Search,
  create: Plus,
  users: Users,
  files: FileText,
  error: AlertCircle,
  inbox: Inbox,
  folder: FolderOpen,
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const DefaultIcon = Icon || defaultIcons.files;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      className
    )}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <DefaultIcon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {action && (
            <Button onClick={action.onClick}>
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.icon && <secondaryAction.icon className="mr-2 h-4 w-4" />}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Predefined empty states
export function EmptyPapers({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={defaultIcons.papers}
      title="No exam papers found"
      description="Get started by creating your first exam paper or browse existing ones."
      action={{
        label: "Create Paper",
        onClick: onCreate,
        icon: Plus,
      }}
      secondaryAction={{
        label: "Browse Papers",
        onClick: () => window.location.href = '/exampapers',
        icon: Search,
      }}
    />
  );
}

export function EmptySearch({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon={defaultIcons.search}
      title="No results found"
      description="Try adjusting your search criteria or browse all papers."
      action={{
        label: "Clear Filters",
        onClick: onClear,
        icon: Search,
      }}
    />
  );
}

export function EmptyUsers({ onInvite }: { onInvite: () => void }) {
  return (
    <EmptyState
      icon={defaultIcons.users}
      title="No users found"
      description="Start building your team by inviting users to your organization."
      action={{
        label: "Invite User",
        onClick: onInvite,
        icon: Plus,
      }}
    />
  );
}

export function EmptyInstitutions({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={defaultIcons.folder}
      title="No institutions found"
      description="Add educational institutions to organize your exam papers."
      action={{
        label: "Add Institution",
        onClick: onCreate,
        icon: Plus,
      }}
    />
  );
}

export function ErrorState({ 
  title = "Something went wrong",
  description = "An error occurred while loading the data. Please try again.",
  onRetry 
}: { 
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={defaultIcons.error}
      title={title}
      description={description}
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
        icon: AlertCircle,
      } : undefined}
    />
  );
}

export function LoadingState({ 
  title = "Loading...",
  description = "Please wait while we load your data."
}: { 
  title?: string;
  description?: string;
}) {
  return (
    <EmptyState
      icon={defaultIcons.inbox}
      title={title}
      description={description}
    />
  );
} 
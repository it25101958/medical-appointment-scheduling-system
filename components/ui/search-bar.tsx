import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  resultCount,
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      {resultCount !== undefined && (
        <div className="rounded-md w-fit border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          {resultCount} results
        </div>
      )}
    </div>
  );
}

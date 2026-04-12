import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import * as React from "react";
import { useDebounceValue } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  useConcessionaire,
  useConcessionaireInfinite,
} from "@/modules/dashboard/hooks/use-concessionaire";

interface ConcessionaireSelectProps {
  value: string | null;
  onValueChange: (id: string | null) => void;
  className?: string;
}

export function ConcessionaireSelect({
  value,
  onValueChange,
  className,
}: ConcessionaireSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch] = useDebounceValue(search, 300);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useConcessionaireInfinite(debouncedSearch);

  // Fetch specifically selected concessionaire for display name persistence
  const { data: selectedConcess } = useConcessionaire(value ?? "");

  const concessionaires = React.useMemo(() => {
    const list = infiniteData?.pages.flatMap((page) => page.data) ?? [];
    if (selectedConcess && !list.some((c) => c.id === selectedConcess.id)) {
      return [selectedConcess, ...list];
    }
    return list;
  }, [infiniteData, selectedConcess]);

  const selectedName = selectedConcess?.name ?? "Select concessionaire...";

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      if (hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate">{selectedName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search concessionaire..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList onScroll={handleScroll}>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                </div>
              ) : (
                "No concessionaire found."
              )}
            </CommandEmpty>
            <CommandGroup>
              {concessionaires.map((concess) => (
                <CommandItem
                  key={concess.id}
                  value={concess.id}
                  onSelect={() => {
                    onValueChange(concess.id === value ? null : concess.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === concess.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{concess.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {isFetchingNextPage && (
              <div className="text-muted-foreground flex items-center justify-center py-2 text-xs">
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Loading more...
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

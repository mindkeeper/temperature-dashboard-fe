import { useCallback, useRef } from "react";
import { useDebounceValue } from "usehooks-ts";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

import { useConcessionaireInfinite } from "../hooks/use-concessionaire";

interface ConcessionaireComboboxProps {
  value: string | null;
  onValueChange: (id: string | null, name: string | null) => void;
}

export function ConcessionaireCombobox({ value, onValueChange }: ConcessionaireComboboxProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [debouncedSearch, setDebouncedSearch] = useDebounceValue("", 300);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useConcessionaireInfinite(debouncedSearch);

  const concessionaires = data?.pages.flatMap((page) => page.data) ?? [];

  const selectedName = concessionaires.find((c) => c.id === value)?.name ?? null;

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      if (hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Combobox
      value={selectedName}
      onValueChange={(val) => {
        if (val) {
          const concess = concessionaires.find((c) => c.name === val);
          onValueChange(concess?.id ?? null, val);
        } else {
          onValueChange(null, null);
        }
      }}
      filteredItems={concessionaires.map((c) => c.name)}
    >
      <ComboboxInput
        className="w-60"
        placeholder="Select concessionaire"
        showClear={!!value}
        onInput={(e) => setDebouncedSearch(e.currentTarget.value)}
      />
      <ComboboxContent>
        <ComboboxEmpty>{isLoading ? "Loading..." : "No concessionaire found."}</ComboboxEmpty>
        <ComboboxList ref={listRef} onScroll={handleScroll}>
          {concessionaires.map((concess) => (
            <ComboboxItem key={concess.id} value={concess.name}>
              {concess.name}
            </ComboboxItem>
          ))}
          {isFetchingNextPage && (
            <div className="text-muted-foreground py-2 text-center text-sm">Loading more...</div>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

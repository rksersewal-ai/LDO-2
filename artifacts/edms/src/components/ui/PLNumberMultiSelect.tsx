import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Hash, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PLNumber } from '@/lib/types';
import { Badge } from './Shared';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

function getStatusVariant(status: PLNumber['status']) {
  if (status === 'ACTIVE') return 'success';
  if (status === 'UNDER_REVIEW') return 'warning';
  return 'danger';
}

interface PLNumberMultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  plItems: PLNumber[];
  loading?: boolean;
  placeholder?: string;
  helperText?: string;
  className?: string;
}

export function PLNumberMultiSelect({
  values,
  onChange,
  plItems,
  loading = false,
  placeholder = 'Search and select PL numbers...',
  helperText,
  className,
}: PLNumberMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const normalizedValues = useMemo(
    () => values.map((value) => value.replace(/^PL-/, '')),
    [values]
  );

  const sortedItems = useMemo(
    () => [...plItems].sort((a, b) => a.plNumber.localeCompare(b.plNumber)),
    [plItems]
  );

  const selectedItems = useMemo(
    () => sortedItems.filter((item) => normalizedValues.includes(item.plNumber)),
    [normalizedValues, sortedItems]
  );

  const toggleValue = (plNumber: string) => {
    if (normalizedValues.includes(plNumber)) {
      onChange(normalizedValues.filter((value) => value !== plNumber));
      return;
    }
    onChange([...normalizedValues, plNumber]);
  };

  return (
    <div className={cn('space-y-2', className)} data-no-context-palette="true">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-10 w-full justify-between rounded-xl border border-slate-700/55 bg-slate-950/60 px-3 text-left font-normal text-slate-200 shadow-sm hover:bg-slate-900/70"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Hash className="h-4 w-4 shrink-0 text-teal-400" />
              <span className="truncate">
                {selectedItems.length > 0
                  ? `${selectedItems.length} PL ${selectedItems.length === 1 ? 'selected' : 'records selected'}`
                  : placeholder}
              </span>
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] max-w-[460px] rounded-2xl border border-slate-700/60 bg-slate-950/98 p-0 shadow-2xl backdrop-blur-xl"
        >
          <Command className="bg-transparent text-slate-100">
            <CommandInput
              placeholder="Search PL number, name, description, category..."
              className="text-slate-100 placeholder:text-slate-500"
            />
            <CommandList className="max-h-[320px]">
              {loading && <div className="px-4 py-4 text-sm text-slate-400">Loading PL records...</div>}
              {!loading && (
                <>
                  <CommandEmpty className="text-slate-500">No PL records match this search.</CommandEmpty>
                  <CommandGroup>
                    {sortedItems.map((pl) => {
                      const isSelected = normalizedValues.includes(pl.plNumber);
                      return (
                        <CommandItem
                          key={pl.id}
                          value={`${pl.plNumber} ${pl.name} ${pl.description} ${pl.category} ${pl.controllingAgency}`}
                          onSelect={() => toggleValue(pl.plNumber)}
                          className="items-start rounded-xl px-3 py-3 data-[selected=true]:bg-teal-500/10 data-[selected=true]:text-white"
                        >
                          <div className={cn(
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-teal-300',
                            isSelected ? 'border-teal-300/35 bg-teal-500/18' : 'border-teal-400/20 bg-teal-500/10'
                          )}>
                            {isSelected ? <Check className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs text-teal-300">{pl.plNumber}</span>
                              <Badge size="sm" variant={getStatusVariant(pl.status)}>
                                {pl.status}
                              </Badge>
                            </div>
                            <p className="truncate text-sm text-slate-100">{pl.name}</p>
                            <p className="truncate text-[11px] text-slate-500">
                              {pl.category} · {pl.controllingAgency} · {pl.description}
                            </p>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-2xl border border-teal-400/14 bg-teal-500/[0.05] px-3 py-3">
          {selectedItems.map((pl) => (
            <span
              key={pl.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/24 bg-slate-900/70 px-2.5 py-1 text-[11px] text-slate-200"
            >
              <span className="font-mono text-teal-300">{pl.plNumber}</span>
              <span className="max-w-[180px] truncate">{pl.name}</span>
              <button
                type="button"
                onClick={() => toggleValue(pl.plNumber)}
                className="text-slate-500 transition-colors hover:text-rose-300"
                aria-label={`Remove ${pl.plNumber}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

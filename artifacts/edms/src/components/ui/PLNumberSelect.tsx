import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, ExternalLink, Hash, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router';
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

interface PLNumberSelectProps {
  value: string;
  onChange: (plNumber: string) => void;
  plItems: PLNumber[];
  loading?: boolean;
  placeholder?: string;
  emptyText?: string;
  helperText?: string;
  showPreview?: boolean;
  showViewLink?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PLNumberSelect({
  value,
  onChange,
  plItems,
  loading = false,
  placeholder = 'Search and select a PL number...',
  emptyText = 'No PL records match this search.',
  helperText,
  showPreview = true,
  showViewLink = true,
  disabled = false,
  className,
}: PLNumberSelectProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const normalizedValue = value.replace(/^PL-/, '');

  const selectedPl = useMemo(
    () => plItems.find((pl) => pl.plNumber === normalizedValue) ?? null,
    [normalizedValue, plItems]
  );

  const sortedItems = useMemo(
    () => [...plItems].sort((a, b) => a.plNumber.localeCompare(b.plNumber)),
    [plItems]
  );

  return (
    <div className={cn('space-y-2', className)} data-no-context-palette="true">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'h-10 w-full justify-between rounded-xl border border-slate-700/55 bg-slate-950/60 px-3 text-left font-normal text-slate-200 shadow-sm hover:bg-slate-900/70',
              !selectedPl && 'text-slate-500'
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Hash className="h-4 w-4 shrink-0 text-teal-400" />
              <span className="truncate">
                {selectedPl ? `${selectedPl.plNumber} · ${selectedPl.name}` : placeholder}
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
              {loading && (
                <div className="flex items-center gap-2 px-4 py-4 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
                  Loading PL records...
                </div>
              )}
              {!loading && (
                <>
                  <CommandEmpty className="text-slate-500">{emptyText}</CommandEmpty>
                  <CommandGroup>
                    {selectedPl && (
                      <CommandItem
                        value={`clear ${selectedPl.plNumber}`}
                        onSelect={() => {
                          onChange('');
                          setOpen(false);
                        }}
                        className="rounded-xl text-rose-300 data-[selected=true]:bg-rose-500/12 data-[selected=true]:text-rose-200"
                      >
                        <X className="h-4 w-4" />
                        Clear selection
                      </CommandItem>
                    )}
                    {sortedItems.map((pl) => {
                      const isSelected = pl.plNumber === normalizedValue;
                      return (
                        <CommandItem
                          key={pl.id}
                          value={`${pl.plNumber} ${pl.name} ${pl.description} ${pl.category} ${pl.controllingAgency}`}
                          onSelect={() => {
                            onChange(pl.plNumber);
                            setOpen(false);
                          }}
                          className="items-start rounded-xl px-3 py-3 data-[selected=true]:bg-teal-500/10 data-[selected=true]:text-white"
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-500/10 text-teal-300">
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

      {showPreview && selectedPl && (
        <div className="rounded-2xl border border-teal-400/16 bg-teal-500/[0.05] px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-teal-300">{selectedPl.plNumber}</span>
                <Badge size="sm" variant={getStatusVariant(selectedPl.status)}>
                  {selectedPl.status}
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm font-medium text-slate-100">{selectedPl.name}</p>
            </div>
            <div className="grid gap-1 text-right text-[11px] text-slate-400 sm:text-left">
              <span>
                Category: <span className="text-slate-200">{selectedPl.category}</span>
              </span>
              <span>
                Agency: <span className="text-slate-200">{selectedPl.controllingAgency}</span>
              </span>
              {selectedPl.vendorType && (
                <span>
                  Vendor Type: <span className="text-slate-200">{selectedPl.vendorType}</span>
                </span>
              )}
            </div>
          </div>
          {selectedPl.description && (
            <p className="mt-3 text-xs leading-5 text-slate-400">{selectedPl.description}</p>
          )}
          {showViewLink && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => navigate(`/pl/${selectedPl.plNumber}`)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300 transition-colors hover:text-cyan-200"
              >
                View PL Details
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { CURRENCIES } from '@/data/ThemePresets';

interface Props {
  value: string;
  onChange: (code: string) => void;
  className?: string;
}

export default function CurrencySelect({ value, onChange, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = CURRENCIES.find((c) => c.code === value) || CURRENCIES[0];
  const filtered = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm flex items-center justify-between gap-2 hover:border-gray-300 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-base">{selected.flag}</span>
          <span className="font-medium">{selected.code}</span>
          <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">— {selected.name}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency..."
                className="flex-1 text-sm bg-transparent outline-none dark:text-gray-100"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-4">No currencies found</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    value === c.code ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium' : 'dark:text-gray-200'
                  }`}
                >
                  <span className="text-base w-6 text-center">{c.flag}</span>
                  <span className="font-mono text-xs w-10 text-gray-500 dark:text-gray-400">{c.code}</span>
                  <span className="flex-1 text-left">{c.name}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">{c.symbol}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

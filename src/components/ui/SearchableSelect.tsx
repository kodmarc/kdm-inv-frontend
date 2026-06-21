import React, { useState, useEffect, useRef } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string | null;
  label?: string;
  compact?: boolean;
  className?: string;
  borderless?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '-- Select --',
  disabled = false,
  required = false,
  error = null,
  label,
  compact = false,
  className = '',
  borderless = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find the selected option's label
  const selectedOption = options.find(o => o.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      const idx = filteredOptions.findIndex(o => o.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, value]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : 0
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        // Select highlighted option before losing focus
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
        }
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`flex flex-col gap-1 w-full relative ${className}`} ref={containerRef}>
      {label && <label className="text-[10px] font-bold text-zinc-500 uppercase">{label}</label>}
      <div className="relative text-left">
        <input
          type="text"
          disabled={disabled}
          required={required && !value}
          placeholder={selectedOption ? selectedOption.label : placeholder}
          className={`w-full text-zinc-900 outline-hidden transition-colors placeholder:text-zinc-400 font-bold focus:outline-hidden ${
            borderless
              ? 'border-0 border-transparent bg-transparent rounded-none focus:ring-0 focus:border-transparent px-3 py-2 text-xs'
              : `border rounded-xl bg-white ${
                  error
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-zinc-200 focus:border-blue-500'
                } ${
                  compact ? 'px-2 py-1 text-xs' : 'px-3.5 py-2.5 text-xs'
                }`
          }`}
          value={isOpen ? search : displayValue}
          onChange={(e) => {
            setIsOpen(true);
            setSearch(e.target.value);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-[8px]">
          ▼
        </div>
      </div>
      {isOpen && !disabled && (
        <div 
          ref={listRef}
          className="absolute top-[100%] left-0 w-full bg-white border border-zinc-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto z-50 text-xs font-semibold text-zinc-700 divide-y divide-zinc-50"
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-muted italic">No options found</div>
          ) : (
            filteredOptions.map((o, idx) => (
              <div
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 hover:bg-slate-50 cursor-pointer font-semibold transition-colors ${
                  idx === highlightedIndex ? 'bg-slate-100 text-blue-600 font-bold' : ''
                } ${
                  o.value === value && idx !== highlightedIndex ? 'bg-slate-100/50 text-blue-600/70' : ''
                }`}
              >
                {o.label}
              </div>
            ))
          )}
        </div>
      )}
      {error && <span className="text-[10px] font-semibold text-danger">{error}</span>}
    </div>
  );
};

export default SearchableSelect;

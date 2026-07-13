import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import FALLBACK_COUNTRIES from '../../data/countries.js';

export function CountrySelect({
  countries: externalCountries,
  value,
  onChange,
  label = 'Country',
  placeholder = 'Select country…',
  loading = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Use external countries if provided and non-empty, otherwise use built-in fallback.
  // Merge flag/dial data from fallback into API results that may lack it.
  const countries = useMemo(() => {
    if (!externalCountries || externalCountries.length === 0) return FALLBACK_COUNTRIES;
    // If API returns countries, enrich them with flag/dial from fallback
    const fallbackMap = new Map(FALLBACK_COUNTRIES.map((c) => [String(c.id), c]));
    return externalCountries.map((c) => {
      const fb = fallbackMap.get(String(c.id));
      return {
        ...c,
        flag: c.flag || fb?.flag || '',
        dial: c.dial || fb?.dial || '',
        code: c.code || fb?.code || '',
      };
    });
  }, [externalCountries]);

  const selected = useMemo(
    () => countries.find((c) => String(c.id) === String(value)),
    [countries, value]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.toLowerCase().replace(/^\+/, '');
    return countries.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.dial && c.dial.replace('+', '').includes(q))
    );
  }, [countries, search]);

  const openDropdown = useCallback(() => {
    setOpen(true);
    setSearch('');
    setHighlightIdx(-1);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

  const selectItem = useCallback((item) => {
    onChange({ target: { value: String(item.id) } });
    closeDropdown();
  }, [onChange, closeDropdown]);

  // Outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) closeDropdown();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeDropdown]);

  // Keyboard
  const handleKeyDown = useCallback((e) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openDropdown();
      }
      return;
    }
    switch (e.key) {
      case 'Escape': e.preventDefault(); closeDropdown(); break;
      case 'ArrowDown': e.preventDefault(); setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1)); break;
      case 'ArrowUp': e.preventDefault(); setHighlightIdx((i) => Math.max(i - 1, 0)); break;
      case 'Enter':
        e.preventDefault();
        if (highlightIdx >= 0 && filtered[highlightIdx]) selectItem(filtered[highlightIdx]);
        break;
      default: break;
    }
  }, [open, openDropdown, closeDropdown, filtered, highlightIdx, selectItem]);

  // Scroll highlighted into view
  useEffect(() => {
    if (!open || highlightIdx < 0 || !listRef.current) return;
    const el = listRef.current.children[highlightIdx];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [highlightIdx, open]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="pc-country-select">
        {label && <span className="pc-country-select__label">{label}</span>}
        <div className="pc-country-select__trigger pc-skeleton" style={{ pointerEvents: 'none' }}>
          <span className="pc-country-select__value">&nbsp;</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pc-country-select" ref={containerRef} onKeyDown={handleKeyDown}>
      {label && <span className="pc-country-select__label">{label}</span>}
      <button
        type="button"
        className={`pc-country-select__trigger${open ? ' pc-country-select__trigger--open' : ''}`}
        onClick={() => open ? closeDropdown() : openDropdown()}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="pc-country-select__value">
          {selected ? (
            <>{selected.flag && <span className="pc-country-select__flag">{selected.flag}</span>} {selected.name}</>
          ) : placeholder}
        </span>
        <ChevronDown size={16} strokeWidth={2} className="pc-country-select__chevron" />
      </button>

      {open && (
        <div className="pc-country-select__dropdown" role="listbox">
          <div className="pc-country-select__search-wrap">
            <Search size={14} strokeWidth={2} className="pc-country-select__search-icon" />
            <input
              ref={inputRef}
              type="text"
              className="pc-country-select__search"
              placeholder="Search by name, code, or dial…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setHighlightIdx(0); }}
              aria-label="Search countries"
            />
          </div>
          <ul className="pc-country-select__list" ref={listRef}>
            {filtered.length === 0 ? (
              <li className="pc-country-select__empty">No countries match your search</li>
            ) : (
              filtered.map((c, i) => (
                <li
                  key={c.id}
                  role="option"
                  aria-selected={String(c.id) === String(value)}
                  className={`pc-country-select__option${String(c.id) === String(value) ? ' pc-country-select__option--selected' : ''}${i === highlightIdx ? ' pc-country-select__option--highlighted' : ''}`}
                  onClick={() => selectItem(c)}
                  onMouseEnter={() => setHighlightIdx(i)}
                >
                  <span className="pc-country-select__option-flag">{c.flag}</span>
                  <span className="pc-country-select__option-name">{c.name}</span>
                  {c.dial && <span className="pc-country-select__option-dial">{c.dial}</span>}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CountrySelect;

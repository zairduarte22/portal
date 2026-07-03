import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SearchableSelect({ options, value, onChange, placeholder = "Seleccionar...", className = "", style }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`flex items-center justify-between cursor-pointer ${className}`}
        style={style}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} style={{ color: "var(--muted-foreground)" }} />
      </div>

      {isOpen && (
        <div 
          className="absolute z-[100] w-full mt-1 bg-white rounded-xl shadow-lg border overflow-hidden flex flex-col"
          style={{ borderColor: "var(--border)", maxHeight: "300px" }}
        >
          <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-green-100 focus:border-green-300 transition-all"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto p-1 flex-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-500">No hay resultados</div>
            ) : (
              filteredOptions.map((o) => (
                <div
                  key={o.value}
                  className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    onChange(o.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <span className="truncate pr-4" style={{ color: "var(--foreground)" }}>{o.label}</span>
                  {value === o.value && <Check size={14} className="text-green-600 flex-shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

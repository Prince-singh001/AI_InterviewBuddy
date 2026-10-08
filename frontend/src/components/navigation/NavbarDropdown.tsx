import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LucideIcon } from 'lucide-react';

export interface DropdownItem {
  label: string;
  path: string;
  icon?: LucideIcon;
  customIconUrl?: string;
  description?: string;
  badge?: string;
}

export interface NavbarDropdownProps {
  label: string;
  icon: LucideIcon;
  items: DropdownItem[];
  basePathPattern?: RegExp;
}

export default function NavbarDropdown({
  label,
  icon: TriggerIcon,
  items,
  basePathPattern,
}: NavbarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if any child route in this dropdown is active
  const isAnyChildActive = items.some(
    (item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/'),
  ) || (basePathPattern ? basePathPattern.test(location.pathname) : false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [isOpen]);

  // Close dropdown on ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          isAnyChildActive
            ? 'bg-[#CDF5FD]/60 text-[#00A9FF] font-bold border border-[#89CFF3]/40 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
      >
        <TriggerIcon size={16} strokeWidth={isAnyChildActive ? 2.4 : 2} />
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 text-slate-400 ${
            isOpen ? 'rotate-180 text-[#00A9FF]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-[#89CFF3]/40 shadow-xl shadow-[#00A9FF]/10 p-2 z-50 backdrop-blur-md"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="space-y-1">
              {items.map((item) => {
                const ItemIcon = item.icon;
                const isItemActive =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/');

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                      isItemActive
                        ? 'bg-[#CDF5FD]/40 text-[#00A9FF] border border-[#89CFF3]/50'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    role="menuitem"
                  >
                    {item.customIconUrl ? (
                      <div
                        className={`w-8 h-8 p-1 rounded-lg shrink-0 flex items-center justify-center ${
                          isItemActive
                            ? 'bg-[#CDF5FD] border border-[#00A9FF]/30'
                            : 'bg-slate-100'
                        }`}
                      >
                        <img
                          src={item.customIconUrl}
                          alt={item.label}
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                    ) : ItemIcon ? (
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isItemActive
                            ? 'bg-[#00A9FF] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <ItemIcon size={16} />
                      </div>
                    ) : null}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isItemActive ? 'text-[#00A9FF]' : 'text-slate-800'
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#00A9FF]/10 text-[#00A9FF]">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 leading-snug">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

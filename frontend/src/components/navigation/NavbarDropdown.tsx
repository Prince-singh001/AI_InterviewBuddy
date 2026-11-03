import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, LucideIcon, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();

  const isAnyChildActive =
    items.some(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/"),
    ) || (basePathPattern ? basePathPattern.test(location.pathname) : false);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return items;

    return items.filter((item) =>
      [item.label, item.description || "", item.path, item.badge || ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [items, searchQuery]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  const openSearch = () => {
    setIsOpen(true);
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center gap-1">
      {/* Search Button */}
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search navigation"
        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:text-[#00A9FF] hover:bg-[#CDF5FD]/60 border border-transparent hover:border-[#89CFF3]/40 transition-all"
      >
        <Search size={18} />
      </button>

      {/* Main Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          isAnyChildActive
            ? "bg-[#CDF5FD]/60 text-[#00A9FF] font-bold border border-[#89CFF3]/40 shadow-xs"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
        }`}
      >
        <TriggerIcon size={16} />
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#00A9FF]" : "text-slate-400"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-2xl bg-white border border-[#89CFF3]/40 shadow-xl shadow-[#00A9FF]/10 p-3 z-50"
          >
            {/* Search Input */}
            {searchOpen && (
              <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl border border-[#89CFF3]/50 bg-[#CDF5FD]/30 focus-within:border-[#00A9FF]">
                <Search size={17} className="text-[#00A9FF] shrink-0" />

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filteredItems.length > 0) {
                      window.location.hash = "";
                      setIsOpen(false);
                      setSearchOpen(false);
                      setSearchQuery("");
                    }
                  }}
                  placeholder="Search pages..."
                  className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                  aria-label="Search pages"
                />

                <button
                  type="button"
                  onClick={closeSearch}
                  className="text-slate-400 hover:text-red-500"
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Dropdown Heading */}
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {searchQuery ? "Search Results" : "Explore Pages"}
              </span>

              <span className="text-[10px] text-slate-400">
                {filteredItems.length} results
              </span>
            </div>

            {/* Search Results */}
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const ItemIcon = item.icon;

                  const isItemActive =
                    location.pathname === item.path ||
                    location.pathname.startsWith(item.path + "/");

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        setIsOpen(false);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                        isItemActive
                          ? "bg-[#CDF5FD]/40 border border-[#89CFF3]/50"
                          : "hover:bg-[#CDF5FD]/30"
                      }`}
                    >
                      {item.customIconUrl ? (
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <img
                            src={item.customIconUrl}
                            alt=""
                            className="w-5 h-5 object-contain"
                          />
                        </div>
                      ) : ItemIcon ? (
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            isItemActive
                              ? "bg-[#00A9FF] text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <ItemIcon size={16} />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                          <ArrowRight size={16} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isItemActive ? "text-[#00A9FF]" : "text-slate-800"
                            }`}
                          >
                            {item.label}
                          </span>

                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#00A9FF]/10 text-[#00A9FF]">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <ArrowRight
                        size={14}
                        className="text-slate-300 shrink-0"
                      />
                    </NavLink>
                  );
                })
              ) : (
                <div className="py-8 text-center">
                  <Search size={25} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">
                    No results found
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try another keyword
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 mt-3 pt-2 px-2">
              <p className="text-[10px] text-slate-400">
                Search across available navigation pages
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

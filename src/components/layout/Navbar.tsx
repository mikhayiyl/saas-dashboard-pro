import { Bell, Search } from "lucide-react";

function Navbar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-[#08090A]/80 px-6 backdrop-blur">
      {/* Search */}
      <div className="flex items-center gap-3 text-white/40">
        <Search className="size-4" />

        <input
          type="text"
          placeholder="Search..."
          className="w-64 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white">
          <Bell className="size-5" />

          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-white" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
            D
          </div>

          <span className="text-sm font-medium">Dancan</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

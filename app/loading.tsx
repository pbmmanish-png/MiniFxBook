export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-full items-center justify-center bg-[#F8FAFC] backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Aapka Pulse karta hua Logo */}
        <img 
          src="/logo3.png" 
          alt="Minitrade Loading..." 
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain animate-pulse" 
        />
        {/* Loading Text */}
        <span className="text-slate-400 text-sm font-bold tracking-widest uppercase animate-pulse">
          Loading...
        </span>
      </div>
    </div>
  );
}
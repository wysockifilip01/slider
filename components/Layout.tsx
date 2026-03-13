import { Outlet, Link } from 'react-router-dom';

const CustomLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <clipPath id="left-half">
        <rect x="0" y="0" width="32" height="64" />
      </clipPath>
      <clipPath id="right-half">
        <rect x="32" y="0" width="32" height="64" />
      </clipPath>
    </defs>

    {/* LEFT HALF */}
    <g clipPath="url(#left-half)">
      <rect x="4" y="4" width="56" height="56" fill="#dce3ec" />
      <circle cx="18" cy="20" r="6" fill="#fde047" stroke="#000" strokeWidth="4" />
      <polygon points="-10,64 26,32 62,64" fill="#7cb342" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
      <rect x="4" y="4" width="56" height="56" fill="none" stroke="#000" strokeWidth="8" />
    </g>

    {/* RIGHT HALF */}
    <g clipPath="url(#right-half)">
      <rect x="4" y="4" width="56" height="56" fill="#fff" />
      <polygon points="10,64 46,36 82,64" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="4" strokeLinejoin="round" />
      <rect x="4" y="4" width="56" height="56" fill="none" stroke="#0ea5e9" strokeWidth="8" />
    </g>
  </svg>
);

export default function Layout() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <header className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <CustomLogo className="w-7 h-7" />
          <span>imgslider</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="px-4 py-2 border border-slate-900 rounded-md font-medium hover:bg-slate-50 transition-colors"
          >
            Create Slider
          </Link>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

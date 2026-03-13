import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Share2, Copy, Check, Maximize, Minimize } from 'lucide-react';

interface SliderData {
  id: string;
  beforeImage: string;
  afterImage: string;
  title: string;
  showLabels: boolean;
  createdAt: number;
}

export default function ViewSlider() {
  const { id } = useParams<{ id: string }>();
  const [slider, setSlider] = useState<SliderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const res = await fetch(`/api/sliders/${id}`);
        if (!res.ok) {
          throw new Error('Slider not found or expired');
        }
        const data = await res.json();
        setSlider(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSlider();
  }, [id]);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (error || !slider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p className="text-slate-500 mb-6">{error || 'Something went wrong'}</p>
      </div>
    );
  }

  const timeRemaining = Math.max(0, 24 * 60 * 60 * 1000 - (Date.now() - slider.createdAt));
  const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{slider.title || 'Image Comparison'}</h1>
          <p className="text-sm text-slate-500">
            Expires in ~{hoursRemaining} hours
          </p>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition-colors w-fit"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      <div
        ref={containerRef}
        className={`relative w-full bg-slate-100 overflow-hidden select-none cursor-ew-resize ${
          isFullscreen ? 'h-screen rounded-none' : 'aspect-video rounded-lg'
        }`}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
      >
        {/* After Image (Background) */}
        <img
          src={slider.afterImage}
          alt="After"
          className="absolute inset-0 w-full h-full object-contain md:object-cover pointer-events-none"
        />
        {slider.showLabels && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur-sm pointer-events-none">
            After
          </div>
        )}

        {/* Before Image (Foreground clipped) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={slider.beforeImage}
            alt="Before"
            className="absolute inset-0 w-full h-full object-contain md:object-cover max-w-none"
          />
          {slider.showLabels && (
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm backdrop-blur-sm">
              Before
            </div>
          )}
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 flex justify-between items-center">
              <div className="w-0.5 h-3 bg-slate-400 rounded-full"></div>
              <div className="w-0.5 h-3 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-md backdrop-blur-sm transition-colors z-10 cursor-pointer"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

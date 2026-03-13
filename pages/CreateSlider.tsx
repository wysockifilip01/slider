import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateSlider() {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [showLabels, setShowLabels] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (!beforeImage) {
              setBeforeImage(event.target?.result as string);
            } else if (!afterImage) {
              setAfterImage(event.target?.result as string);
            }
          };
          reader.readAsDataURL(blob);
        }
        break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste as any);
    return () => {
      window.removeEventListener('paste', handlePaste as any);
    };
  }, [beforeImage, afterImage]);

  const handleSubmit = async () => {
    if (!beforeImage || !afterImage) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beforeImage, afterImage, title, showLabels }),
      });
      const data = await response.json();
      if (data.id) {
        navigate(`/slider/${data.id}`);
      }
    } catch (error) {
      console.error('Failed to create slider', error);
      alert('Failed to create slider. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">Create Your Slider</h1>
        <p className="text-slate-500">
          Tip: You can paste images directly from your clipboard (Ctrl/Cmd+V)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ImageDropzone
          label="1. Before Image"
          image={beforeImage}
          onImageChange={setBeforeImage}
        />
        <ImageDropzone
          label="2. After Image"
          image={afterImage}
          onImageChange={setAfterImage}
        />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My awesome comparison"
            className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <span className="text-sm font-medium">Show labels</span>
        </label>

        <button
          onClick={handleSubmit}
          disabled={!beforeImage || !afterImage || isSubmitting}
          className="w-full py-3 bg-slate-500 text-white rounded-md font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
        >
          {isSubmitting ? 'Creating...' : 'Create Slider'}
        </button>
      </div>
    </div>
  );
}

function ImageDropzone({
  label,
  image,
  onImageChange,
}: {
  label: string;
  image: string | null;
  onImageChange: (img: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <h2 className="text-sm font-bold mb-2">{label}</h2>
      <div
        className={`relative border-2 border-dashed rounded-lg h-64 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-300 hover:bg-slate-50'
        } ${image ? 'border-none p-0 overflow-hidden' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => !image && fileInputRef.current?.click()}
      >
        {image ? (
          <div className="relative w-full h-full group">
            <img src={image} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageChange(null);
                }}
                className="px-4 py-2 bg-white text-slate-900 rounded-md font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-slate-400 mb-4" />
            <p className="text-slate-500 text-sm">
              Drag & drop {label.toLowerCase().includes('before') ? 'before' : 'after'} image, or click to select
            </p>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
}

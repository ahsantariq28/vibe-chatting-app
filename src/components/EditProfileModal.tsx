"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  // 1. Aurora Breeze (Cyan to Blue Gradient)
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2306b6d4"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g1)"/><circle cx="50" cy="50" r="25" fill="%23ffffff" opacity="0.25"/><circle cx="30" cy="70" r="15" fill="%23ffffff" opacity="0.15"/><circle cx="70" cy="30" r="10" fill="%23ffffff" opacity="0.2"/></svg>`,
  
  // 2. Sunset Vibe (Pink to Orange Gradient)
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ec4899"/><stop offset="100%" stop-color="%23f97316"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g2)"/><circle cx="50" cy="50" r="30" fill="%23ffffff" opacity="0.2"/><path d="M20,80 Q50,40 80,80" fill="none" stroke="%23ffffff" stroke-width="4" opacity="0.3"/></svg>`,

  // 3. Cyberpunk Neon (Purple to Indigo Gradient)
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23a855f7"/><stop offset="100%" stop-color="%236366f1"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g3)"/><polygon points="50,20 80,70 20,70" fill="%23ffffff" opacity="0.2"/><circle cx="50" cy="53" r="12" fill="%23ffffff" opacity="0.25"/></svg>`,

  // 4. Emerald Forest (Green to Teal Gradient)
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%2314b8a6"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g4)"/><rect x="25" y="25" width="50" height="50" rx="10" fill="%23ffffff" opacity="0.2" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="10" fill="%23ffffff" opacity="0.3"/></svg>`,

  // 5. Volcano Core (Red to Yellow Gradient)
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ef4444"/><stop offset="100%" stop-color="%23eab308"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g5)"/><circle cx="35" cy="40" r="8" fill="%23ffffff" opacity="0.3"/><circle cx="65" cy="40" r="8" fill="%23ffffff" opacity="0.3"/><path d="M 30 65 Q 50 80 70 65" fill="none" stroke="%23ffffff" stroke-width="5" stroke-linecap="round" opacity="0.4"/></svg>`,

  // 6. Midnight Spark (Slate to Violet Gradient)
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%237c3aed"/></linearGradient></defs><rect width="100" height="100" fill="url(%23g6)"/><path d="M50,15 L62,38 L88,42 L68,60 L73,85 L50,72 L27,85 L32,60 L12,42 L38,38 Z" fill="%23ffffff" opacity="0.25"/></svg>`
];

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxDimension = 150;
        
        canvas.width = maxDimension;
        canvas.height = maxDimension;
        
        if (ctx) {
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          
          ctx.drawImage(
            img,
            sx,
            sy,
            minSide,
            minSide,
            0,
            0,
            maxDimension,
            maxDimension
          );
          
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        await update({
          name: updatedUser.name,
          image: updatedUser.image,
        });
        toast.success("Profile updated successfully!");
        onClose();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving your profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none"></div>

        <h3 className="text-xl font-bold text-white mb-6">Edit Profile</h3>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              {image ? (
                <img
                  src={image}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-500 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-2 border-slate-600 shadow-lg">
                  {name.charAt(0) || "U"}
                </div>
              )}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-semibold"
              >
                Upload Photo
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="w-full">
              <span className="block text-xs font-medium text-slate-400 mb-2 text-center">
                Choose a pre-made avatar or upload your own
              </span>
              <div className="flex justify-center gap-3 flex-wrap">
                {PRESET_AVATARS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setImage(preset)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 ${
                      image === preset ? "border-blue-500 scale-105" : "border-transparent"
                    }`}
                  >
                    <img src={preset} alt={`Preset ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              required
              maxLength={40}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 rounded-lg transition-colors shadow-md shadow-blue-900/30"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

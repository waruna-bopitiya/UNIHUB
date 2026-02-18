"use client";

import { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { 
  Settings, 
  Copy, 
  Eye, 
  EyeOff, 
  Radio,
  Calendar,
  Save,
  Loader2,
  ImagePlus,
  X,
  UploadCloud
} from 'lucide-react';
import Image from 'next/image'; // Next.js Image component

export default function CreateLiveStreamPage() {
  const [loading, setLoading] = useState(false);
  const [streamCreated, setStreamCreated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Form Data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledStartTime: new Date().toISOString().slice(0, 16),
  });

  // 2. Thumbnail State
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // 3. Stream Info (Backend eken ena ewa)
  const [streamInfo, setStreamInfo] = useState({
    streamKey: "Hidden-Until-Created",
    streamUrl: "rtmp://a.rtmp.youtube.com/live2"
  });
  
  const [keyVisible, setKeyVisible] = useState(false);

  // Handle Text Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Thumbnail Selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // Preview eka hadanawa
      const objectUrl = URL.createObjectURL(file);
      setThumbnailPreview(objectUrl);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 4. Backend Submission (FormData use karanna one File nisa)
  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // Backend ekata yawanna Data Package eka hadanawa
        const data = new FormData();
        
        // Metadata
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('scheduledStartTime', formData.scheduledStartTime);
        data.append('privacyStatus', 'unlisted'); // Hardcoded
        
        // Thumbnail File eka
        if (thumbnailFile) {
            data.append('thumbnail', thumbnailFile);
        }

        console.log("Sending FormData to Backend...");
        
        // *** Backend API Call Simulation ***
        // await axios.post('/api/create-stream', data);

        setTimeout(() => {
            setLoading(false);
            setStreamCreated(true);
            setStreamInfo({
                ...streamInfo,
                streamKey: "abcd-1234-efgh-5678" // Example Key
            });
        }, 2000);

    } catch (error) {
        console.error("Error creating stream", error);
        setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0f0f0f] text-white font-sans flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-[#1f1f1f]">
          <div className="flex items-center gap-3">
             <div className="bg-red-600 p-1.5 rounded-full">
                <Radio className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-xl font-semibold tracking-tight">Create New Kuppi (Live Class)</h1>
          </div>
          <div>
            {!streamCreated ? (
                <span className="text-yellow-500 text-sm font-medium px-3 py-1 bg-yellow-500/10 rounded border border-yellow-500/20">
                    Draft Mode
                </span>
            ) : (
                <span className="text-green-500 text-sm font-medium px-3 py-1 bg-green-500/10 rounded border border-green-500/20">
                    Ready to Stream
                </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 p-6 flex-1 overflow-hidden overflow-y-auto">
          
          {/* LEFT: FORM */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-[#1f1f1f] p-6 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-700 pb-4">
                    <Settings className="text-gray-400 w-5 h-5" />
                    <h2 className="text-lg font-medium">Stream Details</h2>
                </div>

                <form onSubmit={handleCreateStream} className="space-y-6">
                    
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Title (Required)</label>
                        <input 
                            name="title"
                            type="text" 
                            required
                            placeholder="Ex: Combined Maths - Calculus Day 01" 
                            className="w-full bg-[#0f0f0f] border border-gray-700 rounded p-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600"
                            onChange={handleChange}
                            disabled={streamCreated}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                        <textarea 
                            name="description"
                            rows={4}
                            placeholder="Add details about today's lesson..." 
                            className="w-full bg-[#0f0f0f] border border-gray-700 rounded p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition placeholder-gray-600"
                            onChange={handleChange}
                            disabled={streamCreated}
                        />
                    </div>

                    {/* --- THUMBNAIL UPLOAD SECTION --- */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Thumbnail</label>
                        <p className="text-xs text-gray-500 mb-3">Upload a picture that shows what's in your video. A good thumbnail stands out.</p>
                        
                        <input 
                            type="file" 
                            accept="image/*" 
                            hidden 
                            ref={fileInputRef} 
                            onChange={handleThumbnailChange}
                            disabled={streamCreated}
                        />

                        {!thumbnailPreview ? (
                            <div 
                                onClick={() => !streamCreated && fileInputRef.current?.click()}
                                className={`border-2 border-dashed border-gray-700 rounded-lg p-8 text-center transition flex flex-col items-center justify-center gap-2 ${!streamCreated ? 'cursor-pointer hover:border-gray-500 hover:bg-[#2a2a2a]' : 'opacity-50 cursor-not-allowed'}`}
                            >
                                <div className="bg-[#0f0f0f] p-3 rounded-full mb-1">
                                    <ImagePlus className="w-6 h-6 text-gray-400" />
                                </div>
                                <span className="text-sm text-gray-300 font-medium">Upload Thumbnail</span>
                                <span className="text-xs text-gray-500">1280x720 recommended (Max 2MB)</span>
                            </div>
                        ) : (
                            <div className="relative w-48 aspect-video group">
                                <img 
                                    src={thumbnailPreview} 
                                    alt="Thumbnail Preview" 
                                    className="w-full h-full object-cover rounded-lg border border-gray-700"
                                />
                                {!streamCreated && (
                                    <button 
                                        type="button"
                                        onClick={removeThumbnail}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700 transition"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-[10px] text-white font-bold">
                                    PREVIEW
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Schedule Time */}
                    <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Schedule Start Time</label>
                        <div className="flex items-center bg-[#0f0f0f] border border-gray-700 rounded p-3 focus-within:border-blue-500 w-full md:w-1/2">
                            <Calendar className="text-gray-500 w-5 h-5 mr-3" />
                            <input 
                                name="scheduledStartTime"
                                type="datetime-local" 
                                className="bg-transparent text-white text-sm w-full focus:outline-none custom-date-picker"
                                value={formData.scheduledStartTime}
                                onChange={handleChange}
                                disabled={streamCreated}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {!streamCreated && (
                        <div className="pt-6 flex items-center gap-4 border-t border-gray-700">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded font-medium text-sm flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                                {loading ? "Creating Stream..." : "Create Stream"}
                            </button>
                            <p className="text-xs text-gray-500">
                                By clicking this, you agree to create an <strong>Unlisted</strong> YouTube stream.
                            </p>
                        </div>
                    )}
                </form>
            </div>
          </div>

          {/* RIGHT: OUTPUT (STREAM KEY) */}
          <div className="col-span-12 lg:col-span-4">
             <div className={`bg-[#1f1f1f] border border-gray-800 rounded-lg p-6 h-full transition-all duration-500 sticky top-6 ${!streamCreated ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                
                <h3 className="text-lg font-medium mb-6 text-red-500 flex items-center gap-2">
                    <Radio className="w-5 h-5" /> Stream Key
                </h3>

                <p className="text-sm text-gray-400 mb-6">
                    Paste these into OBS Studio to start streaming.
                </p>

                {/* Stream URL */}
                <div className="mb-6 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Stream URL</label>
                    <div className="flex bg-[#0f0f0f] rounded border border-gray-700 overflow-hidden">
                        <input 
                            type="text" 
                            readOnly 
                            value={streamInfo.streamUrl}
                            className="flex-1 bg-transparent p-3 text-sm text-gray-300 font-mono outline-none"
                        />
                        <button className="px-4 hover:bg-gray-800 text-gray-400 transition border-l border-gray-700">
                            <Copy size={16} />
                        </button>
                    </div>
                </div>

                {/* Stream Key */}
                <div className="mb-6 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Stream Key</label>
                    <div className="flex bg-[#0f0f0f] rounded border border-gray-700 overflow-hidden relative">
                        <input 
                            type={keyVisible ? "text" : "password"} 
                            readOnly 
                            value={streamInfo.streamKey}
                            className="flex-1 bg-transparent p-3 text-sm text-white font-mono outline-none"
                        />
                         <button 
                            type="button"
                            onClick={() => setKeyVisible(!keyVisible)}
                            className="absolute right-12 top-3 text-gray-400 hover:text-white px-2"
                        >
                            {keyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button className="px-4 hover:bg-gray-800 text-gray-400 transition border-l border-gray-700 z-10 bg-[#0f0f0f]">
                            <Copy size={16} />
                        </button>
                    </div>
                </div>

                {streamCreated && (
                    <div className="mt-8 bg-green-500/10 border border-green-500/20 p-4 rounded text-center">
                        <p className="text-green-400 text-sm font-medium">Stream Created!</p>
                        <p className="text-gray-400 text-xs mt-1">Thumbnail uploaded successfully.</p>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
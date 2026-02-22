"use client";

import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { AcademicSelector, type AcademicData } from '@/components/shared/academic-selector';
import { 
  Settings, Copy, Eye, EyeOff, Radio, Calendar, Save, Loader2, ImagePlus, X, UploadCloud, MonitorPlay, Wifi, WifiOff, RefreshCw
} from 'lucide-react';

export default function CreateLiveStreamPage() {
  const [loading, setLoading] = useState(false);
  const [streamCreated, setStreamCreated] = useState(false);
  
  // Stream Connection Status (For Preview)
  const [connectionStatus, setConnectionStatus] = useState<'offline' | 'connecting' | 'live'>('offline');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Form Data - Academic Info
  const [academicData, setAcademicData] = useState<AcademicData>({
    year: '', semester: '', module_name: '',
  });

  // Stream Info Form
  const [formData, setFormData] = useState({
    title: '', description: '', scheduledStartTime: new Date().toISOString().slice(0, 16),
  });

  // 2. Thumbnail State
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // 3. Stream Info (Backend eken ena ewa)
  const [streamInfo, setStreamInfo] = useState({
    streamKey: "Hidden-Until-Created",
    streamUrl: "rtmp://a.rtmp.youtube.com/live2",
    videoId: "" // New: Video ID for the player
  });
  
  const [keyVisible, setKeyVisible] = useState(false);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAcademicChange = (field: keyof AcademicData, value: string) => {
    setAcademicData((prev) => {
      if (field === 'year') return { year: value, semester: '', module_name: '' };
      if (field === 'semester') return { ...prev, semester: value, module_name: '' };
      if (field === 'module_name') return { ...prev, module_name: value };
      return prev;
    });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 4. Create Stream Handler
  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const data = new FormData();
        data.append('title', formData.title);
        // ... append other fields

        console.log("Creating Stream...");
        
        // *** Backend API Call Simulation ***
        setTimeout(() => {
            setLoading(false);
            setStreamCreated(true);
            setStreamInfo({
                ...streamInfo,
                streamKey: "abcd-1234-efgh-5678",
                videoId: "jfKfPfyJRdk" // Example 'Lofi Girl' video ID for demo (Replace with real ID)
            });
            // Initially waiting for OBS
            setConnectionStatus('offline'); 
        }, 2000);

    } catch (error) {
        console.error("Error creating stream", error);
        setLoading(false);
    }
  };

  // *** TEST FUNCTION: Simulate OBS Connecting ***
  // (Aththa wadedi meka Backend eken polling walin check karanna one)
  const simulateOBSConnection = () => {
    setConnectionStatus('connecting');
    setTimeout(() => {
        setConnectionStatus('live');
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="bg-red-600 p-1.5 rounded-full">
                <Radio className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Kuppi (Live Class)</h1>
          </div>
          <div className="flex items-center gap-3">
            {streamCreated && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded border text-sm font-medium ${
                    connectionStatus === 'live' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-600' 
                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'
                }`}>
                    {connectionStatus === 'live' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    {connectionStatus === 'live' ? 'Excellent Connection' : 'Waiting for Video Signal...'}
                </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* --- NEW: LIVE PREVIEW MONITOR --- */}
            {streamCreated && (
                <div className="bg-black rounded-lg overflow-hidden border border-border shadow-lg relative group">
                    <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                        
                        {/* Player State Logic */}
                        {connectionStatus === 'offline' ? (
                            <div className="text-center p-6">
                                <div className="animate-pulse mb-4 flex justify-center">
                                    <WifiOff className="w-12 h-12 text-gray-600" />
                                </div>
                                <h3 className="text-gray-400 font-medium">Stream Created & Ready</h3>
                                <p className="text-gray-500 text-sm mt-1">Connect streaming software (OBS) to start preview.</p>
                                
                                {/* TEST BUTTON: Remove this in production */}
                                <button 
                                    onClick={simulateOBSConnection}
                                    className="mt-6 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-700 transition"
                                >
                                    (Simulate OBS Connection)
                                </button>
                            </div>
                        ) : (
                            /* YouTube Player Embed */
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src={`https://www.youtube.com/embed/${streamInfo.videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`} 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                className={connectionStatus === 'connecting' ? 'opacity-50 blur-sm' : 'opacity-100'}
                            ></iframe>
                        )}

                        {/* Loading Overlay */}
                        {connectionStatus === 'connecting' && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="bg-black/80 px-4 py-2 rounded-full flex items-center gap-2 text-white text-sm">
                                    <Loader2 className="animate-spin w-4 h-4" /> Receiving Data...
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Monitor Bar */}
                    <div className="bg-card border-t border-border p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MonitorPlay className="w-4 h-4" />
                            <span>Preview Monitor</span>
                        </div>
                        {connectionStatus === 'live' && (
                            <div className="text-xs text-red-500 font-bold flex items-center gap-1 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> LIVE
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* FORM (Gets pushed down / disabled after creation) */}
            <div className={`bg-card p-6 rounded-lg border border-border transition-all ${streamCreated ? 'opacity-70 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                        <Settings className="text-muted-foreground w-5 h-5" />
                        <h2 className="text-lg font-medium text-foreground">Stream Details</h2>
                    </div>
                    {streamCreated && <span className="text-xs text-green-600 font-medium">Saved</span>}
                </div>

                <form onSubmit={handleCreateStream} className="space-y-6">
                    <AcademicSelector
                      values={academicData}
                      onChange={handleAcademicChange}
                      disabled={streamCreated}
                      showErrors={false}
                      variant="default"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Title</label>
                            <input 
                                name="title"
                                type="text" 
                                required
                                className="w-full bg-background border border-input rounded p-3 text-sm text-foreground"
                                onChange={handleChange}
                                disabled={streamCreated}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Start Time</label>
                             <input 
                                name="scheduledStartTime"
                                type="datetime-local" 
                                className="w-full bg-background border border-input rounded p-3 text-sm text-foreground custom-date-picker"
                                value={formData.scheduledStartTime}
                                onChange={handleChange}
                                disabled={streamCreated}
                            />
                        </div>
                    </div>

                    {!streamCreated && (
                        <div className="pt-4 flex items-center gap-4 border-t border-border">
                            <button 
                                type="submit" 
                                disabled={loading || !academicData.year}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded font-medium text-sm flex items-center gap-2 transition"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                                {loading ? "Creating Stream..." : "Create Stream"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
          </div>

          {/* RIGHT COLUMN: KEYS */}
          <div className="col-span-12 lg:col-span-4">
             <div className={`bg-card border border-border rounded-lg p-6 h-full transition-all duration-500 sticky top-6 ${!streamCreated ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                
                <h3 className="text-lg font-medium mb-6 text-red-500 flex items-center gap-2">
                    <Radio className="w-5 h-5" /> Encoder Settings
                </h3>

                <p className="text-sm text-muted-foreground mb-6">
                    Paste these into OBS Studio to start streaming.
                </p>

                {/* Stream Key */}
                <div className="mb-6 space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Stream Key (Required)</label>
                    <div className="flex bg-background rounded border border-input overflow-hidden relative group-focus-within:ring-1 ring-primary">
                        <input 
                            type={keyVisible ? "text" : "password"} 
                            readOnly 
                            value={streamInfo.streamKey}
                            className="flex-1 bg-transparent p-3 text-sm text-foreground font-mono outline-none"
                        />
                         <button 
                            type="button"
                            onClick={() => setKeyVisible(!keyVisible)}
                            className="absolute right-12 top-3 text-muted-foreground hover:text-foreground px-2"
                        >
                            {keyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button 
                            onClick={() => navigator.clipboard.writeText(streamInfo.streamKey)}
                            className="px-4 hover:bg-accent text-muted-foreground transition border-l border-border z-10 bg-background"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                </div>
                
                 {/* Stream URL */}
                <div className="mb-6 space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Stream URL</label>
                    <div className="flex bg-background rounded border border-input overflow-hidden">
                        <input 
                            type="text" 
                            readOnly 
                            value={streamInfo.streamUrl}
                            className="flex-1 bg-transparent p-3 text-sm text-foreground font-mono outline-none"
                        />
                        <button 
                             onClick={() => navigator.clipboard.writeText(streamInfo.streamUrl)}
                             className="px-4 hover:bg-accent text-muted-foreground transition border-l border-border"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                </div>

                {connectionStatus === 'live' && (
                    <div className="mt-8 bg-green-500/10 border border-green-500/20 p-4 rounded text-center">
                        <p className="text-green-600 text-sm font-medium">You are Live!</p>
                        <p className="text-muted-foreground text-xs mt-1">Students can now watch the kuppi.</p>
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
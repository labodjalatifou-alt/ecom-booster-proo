"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, Video, CheckCircle2, Crop as CropIcon, Play, Pause, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function GifCreator() {
  const [file, setFile] = useState<File | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideoId, setUploadedVideoId] = useState('');
  
  const [startOffset, setStartOffset] = useState<number>(0);
  const [duration, setDuration] = useState<number>(5);
  const [crop, setCrop] = useState<Crop>();
  const [realCrop, setRealCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [cloudError, setCloudError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (!selected.type.startsWith('video/')) {
        toast.error("Veuillez sélectionner un fichier vidéo valide.");
        return;
      }
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setLocalVideoUrl(url);
      setUploadedVideoId('');
      setUploadProgress(0);
      setCloudError(null);
      setCrop(undefined);
      setRealCrop({ x: 0, y: 0, w: 0, h: 0 });
    }
  };

  const handleSetStart = () => {
    if (videoRef.current) {
      const current = Math.floor(videoRef.current.currentTime);
      setStartOffset(current);
      toast.success(`Début défini à ${current}s`);
    }
  };

  const handleSetDuration = () => {
    if (videoRef.current) {
      const current = Math.floor(videoRef.current.currentTime);
      if (current <= startOffset) {
        toast.error("La fin doit être après le début !");
        return;
      }
      const newDuration = current - startOffset;
      setDuration(newDuration);
      toast.success(`Durée définie à ${newDuration}s`);
    }
  };

  const onCropComplete = (crop: Crop, percentCrop: Crop) => {
    if (videoRef.current && percentCrop.width && percentCrop.height) {
      const video = videoRef.current;
      const w = Math.round((percentCrop.width / 100) * video.videoWidth);
      const h = Math.round((percentCrop.height / 100) * video.videoHeight);
      const x = Math.round((percentCrop.x / 100) * video.videoWidth);
      const y = Math.round((percentCrop.y / 100) * video.videoHeight);
      setRealCrop({ x, y, w, h });
    } else {
      setRealCrop({ x: 0, y: 0, w: 0, h: 0 });
    }
  };

  const handleUploadAndGenerate = () => {
    if (!file) return;
    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary n'est pas configuré (.env.local)");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setCloudError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        setUploadedVideoId(response.public_id);
        toast.success("GIF généré avec succès !");
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          setCloudError(response.error?.message || "Erreur inconnue");
        } catch {
          setCloudError(xhr.responseText);
        }
        toast.error("Erreur lors de la génération");
      }
      setUploading(false);
    };

    xhr.onerror = () => {
      setCloudError("Erreur de connexion internet ou bloqueur de publicité actif.");
      toast.error("Erreur de connexion");
      setUploading(false);
    };

    xhr.send(formData);
  };

  const generateGifUrl = () => {
    if (!uploadedVideoId || !cloudName) return '';
    let transforms = `so_${startOffset},du_${duration}`;
    
    // Appliquer le crop si défini
    if (realCrop.w > 0 && realCrop.h > 0) {
      transforms += `,c_crop,w_${realCrop.w},h_${realCrop.h},x_${realCrop.x},y_${realCrop.y}`;
    } else {
      // Crop par défaut pour éviter un gif énorme
      transforms += `,c_limit,w_500`;
    }

    return `https://res.cloudinary.com/${cloudName}/video/upload/${transforms}/${uploadedVideoId}.gif`;
  };

  const generatedUrl = generateGifUrl();

  return (
    <div className="p-6 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border-2 border-slate-100 dark:border-slate-800">
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600 dark:text-primary-400">
          <ImageIcon className="w-6 h-6" />
        </div>
        Créateur de GIF Visuel
      </h2>
      
      {!localVideoUrl ? (
        <div 
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
          <Upload className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Sélectionnez une vidéo depuis votre PC</h3>
          <p className="text-sm text-slate-400 mt-2">MP4, WebM, MOV... La vidéo sera traitée pour générer un GIF.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Panneau de configuration Visuel */}
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 overflow-hidden relative border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CropIcon className="w-4 h-4" /> 1. Aperçu & Recadrage
              </p>
              
              <div className="relative mx-auto w-fit bg-black rounded-xl overflow-hidden shadow-inner">
                <ReactCrop 
                  crop={crop} 
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c, pc) => onCropComplete(c, pc)}
                >
                  <video 
                    ref={videoRef}
                    src={localVideoUrl} 
                    className="max-h-[300px] w-auto max-w-full"
                    controls
                    controlsList="nodownload nofullscreen"
                  />
                </ReactCrop>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-2">Dessinez un rectangle sur la vidéo pour recadrer le GIF (Optionnel)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Début : {startOffset}s</p>
                 <button 
                  onClick={handleSetStart}
                  className="w-full py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-bold transition-colors"
                 >
                   Fixer au moment actuel
                 </button>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Durée : {duration}s</p>
                 <button 
                  onClick={handleSetDuration}
                  className="w-full py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-bold transition-colors"
                 >
                   Fixer la durée d'ici
                 </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setLocalVideoUrl('')}
                className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl transition-all"
              >
                Changer de vidéo
              </button>
              <button 
                onClick={handleUploadAndGenerate}
                disabled={uploading}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all"
              >
                {uploading ? `Génération en cours (${uploadProgress}%)` : "2. Générer le GIF"}
              </button>
            </div>

            {cloudError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">Erreur Cloudinary</p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">{cloudError}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Panneau de Résultat */}
          <div className="bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {uploadedVideoId ? (
              <div className="w-full space-y-6">
                <img 
                  src={generatedUrl} 
                  alt="Aperçu GIF final" 
                  className="max-w-full max-h-[350px] mx-auto rounded-2xl object-contain shadow-lg" 
                />
                <div className="p-4 bg-white dark:bg-slate-900 border-2 border-primary-100 dark:border-primary-900/30 rounded-2xl space-y-3">
                  <p className="text-[11px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest text-center">
                    Lien GIF Prêt
                  </p>
                  <a href={generatedUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-700 dark:text-slate-300 break-all text-center block hover:text-primary-600">
                    {generatedUrl}
                  </a>
                  <button 
                    onClick={() => navigator.clipboard.writeText(generatedUrl)}
                    className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-sm hover:scale-105 transition-transform"
                  >
                    Copier le lien
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium px-8">
                  Configurez votre GIF à gauche, puis cliquez sur "Générer". L'aperçu final apparaîtra ici.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

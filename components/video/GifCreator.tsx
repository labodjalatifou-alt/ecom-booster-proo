"use client";

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Video, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GifCreator() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideoId, setUploadedVideoId] = useState('');
  
  const [startOffset, setStartOffset] = useState('0');
  const [duration, setDuration] = useState('5');
  const [width, setWidth] = useState('500');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration depuis les variables d'environnement
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
      setUploadedVideoId('');
      setUploadProgress(0);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary n'est pas configuré. Veuillez ajouter NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME et NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET dans le fichier .env.local.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

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
        toast.success("Vidéo envoyée avec succès !");
      } else {
        toast.error("Erreur lors de l'envoi de la vidéo.");
        console.error(xhr.responseText);
      }
      setUploading(false);
    };

    xhr.onerror = () => {
      toast.error("Erreur de connexion lors de l'envoi.");
      setUploading(false);
    };

    xhr.send(formData);
  };

  const generateGifUrl = () => {
    if (!uploadedVideoId || !cloudName) return '';
    return `https://res.cloudinary.com/${cloudName}/video/upload/c_limit,w_${width},so_${startOffset},du_${duration}/${uploadedVideoId}.gif`;
  };

  const generatedUrl = generateGifUrl();

  return (
    <div className="p-6 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border-2 border-slate-100 dark:border-slate-800">
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600 dark:text-primary-400">
          <ImageIcon className="w-6 h-6" />
        </div>
        Créateur de GIF (Cloudinary)
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
              Vidéo source (Depuis votre PC)
            </label>
            
            {!uploadedVideoId && (
              <div 
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="video/*" 
                  className="hidden" 
                />
                
                {file ? (
                  <div className="space-y-3">
                    <Video className="w-8 h-8 text-primary-500 mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Cliquez pour sélectionner une vidéo</p>
                      <p className="text-xs text-slate-400">MP4, WebM, MOV... (depuis votre PC)</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {file && !uploadedVideoId && !uploading && (
              <button 
                onClick={handleUpload}
                className="w-full mt-2 py-3 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all"
              >
                Générer depuis ce fichier
              </button>
            )}

            {uploading && (
              <div className="space-y-2 mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Envoi en cours...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadedVideoId && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">Vidéo en ligne !</p>
                    <p className="text-xs text-green-600 dark:text-green-500/70">{file?.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setUploadedVideoId('');
                    setFile(null);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                >
                  Changer de vidéo
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Début (sec)</label>
              <input 
                type="number" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold text-center focus:ring-4 focus:ring-primary-500/10"
                value={startOffset}
                onChange={(e) => setStartOffset(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Durée (sec)</label>
              <input 
                type="number" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold text-center focus:ring-4 focus:ring-primary-500/10"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Largeur (px)</label>
              <input 
                type="number" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold text-center focus:ring-4 focus:ring-primary-500/10"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>
          </div>
          
          {uploadedVideoId && generatedUrl && (
            <div className="p-6 bg-primary-50 dark:bg-primary-900/10 border-2 border-primary-100 dark:border-primary-900/30 rounded-3xl mt-4 space-y-3">
              <p className="text-[11px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                Lien GIF généré :
              </p>
              <a href={generatedUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-700 dark:text-slate-300 break-all hover:text-primary-600 hover:underline inline-block">
                {generatedUrl}
              </a>
              <button 
                onClick={() => navigator.clipboard.writeText(generatedUrl)}
                className="w-full mt-2 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                Copier le lien
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-4 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
          {uploadedVideoId ? (
            <img 
              src={generatedUrl} 
              alt="Aperçu GIF" 
              className="max-w-full max-h-[500px] rounded-2xl object-contain shadow-lg" 
            />
          ) : (
            <div className="text-center space-y-4">
              <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">L'aperçu du GIF s'affichera ici une fois la vidéo envoyée.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

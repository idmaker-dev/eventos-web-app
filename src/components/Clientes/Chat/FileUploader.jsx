import React, { useState, useRef } from "react";
import { Paperclip, X, Camera, Image, File, FileText, Smile } from "lucide-react";

const FileUploader = ({ onFileSelect, onAttachmentMenuToggle, showAttachmentMenu }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const handleFiles = (files, type = 'general') => {
    Array.from(files).forEach(file => {
      // Validar tamaño (máximo 16MB como WhatsApp)
      if (file.size > 16 * 1024 * 1024) {
        alert(`El archivo ${file.name} es demasiado grande. Máximo 16MB.`);
        return;
      }

      const fileData = {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        id: Date.now() + Math.random(),
        preview: null,
        category: type
      };

      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileData.preview = e.target.result;
          onFileSelect(fileData);
        };
        reader.readAsDataURL(file);
      } else {
        onFileSelect(fileData);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative">
      {/* Inputs ocultos */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files, 'image')}
        className="hidden"
      />
      <input
        ref={documentInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        onChange={(e) => handleFiles(e.target.files, 'document')}
        className="hidden"
      />

      {/* Botón principal */}
      <button
        onClick={() => onAttachmentMenuToggle(!showAttachmentMenu)}
        className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
          showAttachmentMenu
            ? "bg-casal text-white rotate-45"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="Adjuntar archivo"
      >
        <Paperclip className="w-4 h-4" />
      </button>

      {/* Menú de adjuntos estilo WhatsApp */}
      {showAttachmentMenu && (
        <div className="absolute bottom-12 -right-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-2 z-50 min-w-[200px]">
          <div className="space-y-1">
            <button
              onClick={() => {
                documentInputRef.current?.click();
                onAttachmentMenuToggle(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Documento</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PDF, Word, Excel, etc.</p>
              </div>
            </button>

            <button
              onClick={() => {
                imageInputRef.current?.click();
                onAttachmentMenuToggle(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Imagen</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG, GIF</p>
              </div>
            </button>

            <button
              onClick={() => {
                // Funcionalidad futura para cámara
                alert("Funcionalidad de cámara próximamente");
                onAttachmentMenuToggle(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Cámara</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tomar foto</p>
              </div>
            </button>

            <button
              onClick={() => {
                fileInputRef.current?.click();
                onAttachmentMenuToggle(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <File className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Archivo</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cualquier tipo</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Overlay para drag and drop */}
      {dragActive && (
        <div
          className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center z-[70]"
          onDragEnter={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border-2 border-dashed border-casal">
            <Paperclip className="w-12 h-12 mx-auto mb-4 text-casal" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Suelta los archivos aquí
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Máximo 16MB por archivo
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
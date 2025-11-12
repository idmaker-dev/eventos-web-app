import React from "react";
import { X, File, Image, FileText, Download, Eye } from "lucide-react";

const FilePreview = ({ files, onRemove, onPreview }) => {
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf') return FileText;
    if (type.includes('word') || type.includes('document')) return FileText;
    return File;
  };

  const getFileColor = (type) => {
    if (type.startsWith('image/')) return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    if (type === 'application/pdf') return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    if (type.includes('word')) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    return 'text-gray-500 bg-gray-50 dark:bg-gray-700';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!files || files.length === 0) return null;

  return (
    <div className="mb-3 space-y-2 max-h-32 overflow-y-auto">
      {files.map((fileData) => {
        const IconComponent = getFileIcon(fileData.type);
        const colorClasses = getFileColor(fileData.type);

        return (
          <div
            key={fileData.id}
            className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            {/* Preview de imagen o icono */}
            <div className="flex-shrink-0">
              {fileData.preview ? (
                <div className="relative">
                  <img
                    src={fileData.preview}
                    alt={fileData.name}
                    className="w-12 h-12 object-cover rounded cursor-pointer"
                    onClick={() => onPreview && onPreview(fileData)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded flex items-center justify-center transition-all cursor-pointer">
                    <Eye className="w-4 h-4 text-white opacity-0 hover:opacity-100" />
                  </div>
                </div>
              ) : (
                <div className={`w-12 h-12 rounded flex items-center justify-center ${colorClasses}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Información del archivo */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {fileData.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(fileData.size)}
              </p>
              {fileData.category && (
                <span className="inline-block px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded mt-1">
                  {fileData.category}
                </span>
              )}
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1">
              {fileData.preview && (
                <button
                  onClick={() => onPreview && onPreview(fileData)}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Vista previa"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onRemove(fileData.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Remover archivo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FilePreview;
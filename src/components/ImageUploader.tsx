'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onFileUpload: (file: File) => void;
}

export function ImageUploader({ onFileUpload }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload an image file (JPG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File is too large. Please choose an image under 10MB.');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success('Image uploaded! Click "Start Magic" to begin! ✨');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleStartProcessing = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 overflow-hidden">
        {!selectedFile ? (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              {...getRootProps()}
              className={`p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'bg-blue-50 border-blue-300 scale-105' 
                  : 'hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
            
              <motion.div
                className="mb-6"
                animate={{ 
                  y: isDragActive ? -10 : 0,
                  scale: isDragActive ? 1.1 : 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <Upload className="h-10 w-10 text-primary-600" />
                </div>
              </motion.div>
            
              <h3 className="text-2xl font-bold text-gray-800 mb-3 font-comic">
                {isDragActive ? 'Drop your picture here! 📸' : 'Upload Your Picture Here! 📸'}
              </h3>
            
              <p className="text-lg text-gray-600 mb-6 font-comic">
                {isDragActive 
                  ? 'Let go to upload your image!'
                  : 'Drag and drop an image, or click to choose from your device'
                }
              </p>
            
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>JPG, PNG, GIF, WebP</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Up to 10MB</span>
                </div>
              </div>
            
              <motion.button
                className="btn btn-primary btn-lg font-comic text-lg px-8 py-3 rounded-full shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                Choose Picture 📁
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="p-8">
            {/* Preview */}
            <div className="relative mb-6">
              <motion.img
                src={preview!}
                alt="Preview"
                className="w-full max-h-96 object-contain rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.button
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
            
            {/* File Info */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6 mb-6">
              <h4 className="font-bold text-green-800 mb-3 font-comic text-lg">✅ Picture Uploaded Successfully!</h4>
              <div className="bg-white rounded p-3 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Name:</span> {selectedFile.name}
                  </div>
                  <div>
                    <span className="font-medium">Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <div className="text-center p-3 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
                <p className="font-bold text-yellow-800 font-comic text-lg">👇 IMPORTANT: Click the button below to start! 👇</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={handleStartProcessing}
                className="btn btn-primary btn-lg font-comic text-lg px-8 py-3 rounded-full shadow-lg flex-1 pulse-color animate-pulse"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  background: 'linear-gradient(45deg, #3B82F6, #8B5CF6)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
                }}
              >
                🚀 START THE MAGIC! ✨ CLICK HERE! 🚀
              </motion.button>
              <motion.button
                onClick={handleRemoveFile}
                className="btn btn-secondary btn-lg font-comic text-lg px-6 py-3 rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Choose Different Picture
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
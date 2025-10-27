import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog.jsx';
import { invoke } from '@tauri-apps/api/core';

export default function ImagePicker({ open, onClose, onInsert }) {
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleClose = () => {
    setUrl('');
    setPreview(null);
    setIsDragging(false);
    onClose();
  };

  const handleInsertUrl = () => {
    if (url.trim()) {
      onInsert(url.trim());
      handleClose();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      await processImageFile(imageFile);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      await processImageFile(file);
    }
  };

  const processImageFile = async (file) => {
    setIsProcessing(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Get workspace path
      const workspacePath = globalThis.__LOKUS_WORKSPACE_PATH__;
      console.log('[ImagePicker] Workspace path:', workspacePath);

      if (!workspacePath) {
        console.error('[ImagePicker] No workspace path found - cannot save image');
        alert('Error: No workspace path found. Please make sure you have a workspace open.');
        setIsProcessing(false);
        return;
      }

      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      console.log('[ImagePicker] Invoking save_image_to_workspace...');
      console.log('[ImagePicker] Workspace:', workspacePath);
      console.log('[ImagePicker] File name:', file.name);
      console.log('[ImagePicker] Image size:', uint8Array.length, 'bytes');

      // Save to workspace assets folder
      const relativePath = await invoke('save_image_to_workspace', {
        workspacePath,
        fileName: file.name,
        imageData: Array.from(uint8Array)
      });

      console.log('[ImagePicker] Image saved to relative path:', relativePath);

      // Insert the relative path into markdown
      // The LocalImage extension will convert it to an asset URL during rendering
      onInsert(relativePath);
      handleClose();
    } catch (error) {
      console.error('[ImagePicker] Error processing image:', error);
      alert('Failed to process image: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Insert Image
          </DialogTitle>
          <DialogDescription>
            Drag and drop an image, browse your files, or paste a URL
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging ? 'border-app-accent bg-app-accent/10' : 'border-app-border hover:border-app-accent/50'}
              ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <button
                  onClick={() => setPreview(null)}
                  className="text-sm text-app-muted hover:text-app-text"
                >
                  Choose different image
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-app-muted" />
                <p className="text-app-text mb-2">
                  {isProcessing ? 'Processing image...' : 'Drag and drop an image here'}
                </p>
                <p className="text-sm text-app-muted mb-4">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-app-accent text-app-accent-fg rounded-lg hover:opacity-90 transition-opacity"
                  disabled={isProcessing}
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-app-text flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Or paste image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInsertUrl()}
                placeholder="https://example.com/image.png"
                className="flex-1 px-3 py-2 bg-app-bg border border-app-border rounded-lg focus:outline-none focus:ring-2 focus:ring-app-accent text-app-text"
                disabled={isProcessing}
              />
              <button
                onClick={handleInsertUrl}
                disabled={!url.trim() || isProcessing}
                className="px-4 py-2 bg-app-accent text-app-accent-fg rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-app-muted hover:text-app-text transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2, Download, ImageIcon } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

export default function ImageViewer({ imagePath, imageName }) {
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [fitToScreen, setFitToScreen] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const containerRef = React.useRef(null);

  useEffect(() => {
    const loadImage = async () => {
      if (!imagePath) return;

      setLoading(true);
      setError(null);

      try {
        console.log('[ImageViewer] Loading image from:', imagePath);

        // Read the image file as binary using Tauri command
        const binaryData = await invoke('read_binary_file', { path: imagePath });
        console.log('[ImageViewer] File read, size:', binaryData.length, 'bytes');

        // Detect MIME type from file extension
        const ext = imagePath.toLowerCase().split('.').pop();
        const mimeTypes = {
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'svg': 'image/svg+xml',
          'bmp': 'image/bmp'
        };
        const mimeType = mimeTypes[ext] || 'image/png';

        // Convert to base64
        const base64 = btoa(
          Array.from(binaryData)
            .map(byte => String.fromCharCode(byte))
            .join('')
        );

        // Create data URL
        const dataUrl = `data:${mimeType};base64,${base64}`;
        console.log('[ImageViewer] Created data URL, length:', dataUrl.length);

        setImageDataUrl(dataUrl);
      } catch (err) {
        console.error('[ImageViewer] Error loading image:', err);
        setError('Failed to load image: ' + err.message);
        setLoading(false);
      }
    };

    loadImage();
  }, [imagePath]);

  const handleImageLoad = (e) => {
    setLoading(false);
    setNaturalSize({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight
    });
  };

  const handleImageError = (e) => {
    console.error('[ImageViewer] Image failed to load:', e);
    setError('Failed to load image from: ' + imagePath);
    setLoading(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 400));
    setFitToScreen(false);
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 10));
    setFitToScreen(false);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setFitToScreen(true);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFitToScreen = () => {
    setFitToScreen(!fitToScreen);
    if (!fitToScreen) {
      setZoom(100);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Wheel zoom handler
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY;
      const zoomAmount = delta > 0 ? 10 : -10;
      setZoom(prev => Math.min(Math.max(prev + zoomAmount, 10), 400));
      setFitToScreen(false);
    }
  };

  // Mouse drag handlers for panning
  const handleMouseDown = (e) => {
    if (!fitToScreen && zoom > 100) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Double click to toggle fit/100%
  const handleDoubleClick = () => {
    if (fitToScreen) {
      setFitToScreen(false);
      setZoom(100);
    } else {
      handleReset();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotate();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFitToScreen();
      } else if (e.key === 'Escape' || e.key === '0') {
        e.preventDefault();
        handleReset();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fitToScreen, showShortcuts]);

  // Cleanup drag listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-app-bg to-app-surface">
      {/* Modern Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border/50 backdrop-blur-sm bg-app-surface/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-app-accent/10 rounded-lg">
            <ImageIcon className="w-5 h-5 text-app-accent" />
          </div>
          <div className="flex flex-col">
            <span className="text-app-text font-semibold">{imageName || 'Image'}</span>
            {naturalSize.width > 0 && (
              <span className="text-xs text-app-muted">
                {naturalSize.width} × {naturalSize.height} px
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-app-bg/50 rounded-xl p-1 border border-app-border/30">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            className="p-2.5 hover:bg-app-accent/10 rounded-lg transition-all hover:scale-105 active:scale-95"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4 text-app-text" />
          </button>

          <div className="flex items-center gap-2 px-3 min-w-[80px] justify-center">
            <span className="text-sm font-medium text-app-text tabular-nums">
              {zoom}%
            </span>
          </div>

          <button
            onClick={handleZoomIn}
            className="p-2.5 hover:bg-app-accent/10 rounded-lg transition-all hover:scale-105 active:scale-95"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4 text-app-text" />
          </button>

          <div className="w-px h-6 bg-app-border/50 mx-1" />

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-2.5 hover:bg-app-accent/10 rounded-lg transition-all hover:scale-105 active:scale-95"
            title="Rotate (R)"
          >
            <RotateCw className="w-4 h-4 text-app-text" />
          </button>

          {/* Fit to Screen */}
          <button
            onClick={toggleFitToScreen}
            className={`p-2.5 rounded-lg transition-all hover:scale-105 active:scale-95 ${
              fitToScreen
                ? 'bg-app-accent/20 text-app-accent'
                : 'hover:bg-app-accent/10 text-app-text'
            }`}
            title="Fit to Screen (F)"
          >
            {fitToScreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <div className="w-px h-6 bg-app-border/50 mx-1" />

          {/* Reset */}
          <button
            onClick={handleReset}
            className="px-4 py-2.5 text-sm font-medium hover:bg-app-accent/10 rounded-lg transition-all hover:scale-105 active:scale-95 text-app-text"
            title="Reset (Esc)"
          >
            Reset
          </button>

          <div className="w-px h-6 bg-app-border/50 mx-1" />

          {/* Help */}
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className={`p-2.5 rounded-lg transition-all hover:scale-105 active:scale-95 ${
              showShortcuts
                ? 'bg-app-accent/20 text-app-accent'
                : 'hover:bg-app-accent/10 text-app-text'
            }`}
            title="Keyboard Shortcuts (?)"
          >
            <span className="text-sm font-bold">?</span>
          </button>
        </div>
      </div>

      {/* Image Display Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : (zoom > 100 && !fitToScreen ? 'grab' : 'default') }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {loading && !error && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-app-border rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-app-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-app-muted text-sm">Loading image...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 max-w-md text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="text-app-text font-medium mb-2">Failed to Load Image</p>
                <p className="text-sm text-app-muted break-all">{error}</p>
              </div>
            </div>
          )}

          {imageDataUrl && !error && (
            <div
              className="relative max-w-full max-h-full flex items-center justify-center"
              style={{
                transform: fitToScreen
                  ? 'none'
                  : `translate(${position.x}px, ${position.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
            >
              <img
                src={imageDataUrl}
                alt={imageName || 'Image'}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  maxWidth: fitToScreen ? '100%' : 'none',
                  maxHeight: fitToScreen ? '100%' : 'none',
                  objectFit: 'contain',
                  boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                }}
                className="select-none"
                draggable={false}
              />
            </div>
          )}
        </div>

        {/* Checkerboard Pattern Background (for transparent images) */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgb(var(--app-border)) 25%, transparent 25%),
              linear-gradient(-45deg, rgb(var(--app-border)) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgb(var(--app-border)) 75%),
              linear-gradient(-45deg, transparent 75%, rgb(var(--app-border)) 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        />
      </div>

      {/* Info Bar */}
      {naturalSize.width > 0 && (
        <div className="px-6 py-3 border-t border-app-border/50 bg-app-surface/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-app-muted">
            <span>
              Dimensions: {naturalSize.width} × {naturalSize.height} px
            </span>
            <span className="flex items-center gap-4">
              {!fitToScreen && zoom > 100 && (
                <span className="text-app-accent">Drag to pan</span>
              )}
              {rotation !== 0 && <span>Rotation: {rotation}°</span>}
              {zoom !== 100 && !fitToScreen && <span>Zoom: {zoom}%</span>}
            </span>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Overlay */}
      {showShortcuts && (
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-app-surface border border-app-border/50 rounded-2xl p-8 max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-app-text">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-app-muted hover:text-app-text transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="text-xs text-app-muted uppercase tracking-wider mb-2">View</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-app-muted">Zoom In</span>
                        <kbd className="px-2 py-1 bg-app-bg rounded text-app-text font-mono text-xs">+</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-app-muted">Zoom Out</span>
                        <kbd className="px-2 py-1 bg-app-bg rounded text-app-text font-mono text-xs">-</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-app-muted">Rotate</span>
                        <kbd className="px-2 py-1 bg-app-bg rounded text-app-text font-mono text-xs">R</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-app-muted">Fit Screen</span>
                        <kbd className="px-2 py-1 bg-app-bg rounded text-app-text font-mono text-xs">F</kbd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <div className="text-xs text-app-muted uppercase tracking-wider mb-2">Actions</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-app-muted">Reset</span>
                        <kbd className="px-2 py-1 bg-app-bg rounded text-app-text font-mono text-xs">ESC</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-app-muted">Help</span>
                        <kbd className="px-2 py-1 bg-app-bg rounded text-app-text font-mono text-xs">?</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-app-border/30 pt-4 mt-4">
                <div className="text-xs text-app-muted uppercase tracking-wider mb-2">Mouse</div>
                <div className="space-y-2 text-sm text-app-muted">
                  <div>Ctrl/Cmd + Scroll: Zoom</div>
                  <div>Drag: Pan (when zoomed)</div>
                  <div>Double-click: Toggle fit/reset</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

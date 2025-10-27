import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { invoke } from '@tauri-apps/api/core';

/**
 * LocalImage extension - handles local image files
 * Reads image files directly and converts to data URLs for display
 * Avoids asset protocol 403 errors by using direct file reading
 */

// Helper function to join paths synchronously
function joinPaths(basePath, relativePath) {
  // Remove leading ./ from relative path
  const cleanRelative = relativePath.startsWith('./')
    ? relativePath.substring(2)
    : relativePath;

  // Remove trailing slash from base path
  const cleanBase = basePath.endsWith('/')
    ? basePath.substring(0, basePath.length - 1)
    : basePath;

  return `${cleanBase}/${cleanRelative}`;
}

export const LocalImage = Node.create({
  name: 'image',

  inline: true,

  group: 'inline',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, { class: 'editor-image' })];
  },

  addInputRules() {
    return [
      new InputRule({
        find: /!\[([^\]]*)\]\(([^)]+)\)$/,
        handler: ({ state, range, match, chain }) => {
          const alt = match[1];
          const src = match[2];

          console.log('[LocalImage] InputRule matched:', { alt, src });

          // Insert image node
          chain()
            .deleteRange(range)
            .insertContent({
              type: 'image',
              attrs: { src, alt: alt || '' }
            })
            .run();
        },
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('img');
      dom.className = 'editor-image';

      let currentSrc = node.attrs.src;
      const alt = node.attrs.alt;
      const title = node.attrs.title;

      // Set alt and title
      if (alt) dom.alt = alt;
      if (title) dom.title = title;

      // Convert local paths to data URLs by reading files directly
      const convertAndSetSrc = async (src) => {
        try {
          if (!src) {
            dom.src = '';
            return;
          }

          // If it's a web URL (http/https), use as-is
          if (src.startsWith('http://') || src.startsWith('https://')) {
            dom.src = src;
            return;
          }

          // If it's a data URL, use as-is
          if (src.startsWith('data:')) {
            dom.src = src;
            return;
          }

          // If it's a local path (starts with . or /), read file and convert to data URL
          if (src.startsWith('.') || src.startsWith('/')) {
            const workspacePath = globalThis.__LOKUS_WORKSPACE_PATH__;

            if (!workspacePath) {
              console.warn('[LocalImage] No workspace path found');
              dom.src = '';
              return;
            }

            // Join workspace path with relative path
            const absolutePath = joinPaths(workspacePath, src);
            console.log('[LocalImage] Loading image from:', absolutePath);

            try {
              // Read the image file as binary using Tauri command
              const binaryData = await invoke('read_binary_file', { path: absolutePath });

              // Detect MIME type from extension
              const ext = src.toLowerCase().split('.').pop();
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
                Array.from(binaryData).map(byte => String.fromCharCode(byte)).join('')
              );

              // Create data URL
              const dataUrl = `data:${mimeType};base64,${base64}`;
              console.log('[LocalImage] Image loaded successfully');

              dom.src = dataUrl;
            } catch (error) {
              console.error('[LocalImage] Error loading image:', error);
              dom.src = '';
            }
            return;
          }

          // Fallback: use src as-is
          dom.src = src;
        } catch (error) {
          console.error('[LocalImage] Error converting path:', error);
          dom.src = '';
        }
      };

      // Convert and set the src immediately
      convertAndSetSrc(currentSrc);

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') {
            return false;
          }

          // Update attributes
          const newSrc = updatedNode.attrs.src;
          const newAlt = updatedNode.attrs.alt;
          const newTitle = updatedNode.attrs.title;

          if (newAlt !== alt) dom.alt = newAlt || '';
          if (newTitle !== title) dom.title = newTitle || '';

          // If src changed, re-convert and set
          if (newSrc !== currentSrc) {
            currentSrc = newSrc;
            convertAndSetSrc(newSrc);
          }

          return true;
        },
      };
    };
  },
});

export default LocalImage;

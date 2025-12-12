import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { getMarkdownCompiler } from '../../core/markdown/compiler.js'
import { MarkdownCompiler } from '../../core/markdown/compiler-logic.js'

const MarkdownPaste = Extension.create({
  name: 'markdownPaste',

  onCreate() {
    console.log('[MarkdownPaste] Extension created successfully');
  },

  addProseMirrorPlugins() {
    console.log('[MarkdownPaste] Adding ProseMirror plugin');
    const editor = this.editor

    return [
      new Plugin({
        props: {
          handlePaste(view, event) {
            const clipboardData = event.clipboardData
            if (!clipboardData) return false

            const text = clipboardData.getData('text/plain')
            const html = clipboardData.getData('text/html')

            console.log('[MarkdownPaste] Paste event:', { 
              hasText: !!text, 
              hasHtml: !!html, 
              text: text?.substring(0, 100) 
            })

            // Process text that looks like markdown (prioritize plain text, but also handle rich text sources)
            if (text && isMarkdownContent(text)) {
              console.log('[MarkdownPaste] Converting markdown content...')
              
              try {
                const md = new MarkdownIt({
                  html: true,
                  linkify: true,
                  typographer: true,
                })
                  .use(markdownItMark)
                  .use(markdownItStrikethrough)

                let htmlContent = md.render(text)
                
                // Handle special Lokus-specific markdown patterns
                // Convert wiki image embeds ![[image]] first (before regular images)
                htmlContent = htmlContent.replace(/!\[\[([^\]]+)\]\]/g, '<span data-type="wiki-link" data-embed="true" href="$1">$1</span>')
                
                // Convert wiki links [[page]] (but not if already processed as images)
                htmlContent = htmlContent.replace(/(?<!data-type="wiki-link"[^>]*>\s*)\[\[([^\]]+)\]\]/g, '<span data-type="wiki-link" href="$1">$1</span>')
                
                // Ensure regular markdown images are properly formatted
                htmlContent = htmlContent.replace(/<p>!\[([^\]]*)\]\(([^)]+)\)<\/p>/g, '<img src="$2" alt="$1" class="editor-image" />')
                htmlContent = htmlContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="editor-image" />')
                
                console.log('[MarkdownPaste] Converted HTML:', htmlContent)

                // Prevent default paste
                event.preventDefault()

                // Insert the converted HTML
                editor.chain()
                  .focus()
                  .insertContent(htmlContent, {
                    parseOptions: {
                      preserveWhitespace: 'full',
                    }

            // Use our universal markdown compiler
            if (text) {
              // Use local sync compiler for quick checks
              const syncCompiler = new MarkdownCompiler()
              const workerCompiler = getMarkdownCompiler()

              // Check if HTML is actually rich content or just bloated markup
              if (html && html.trim()) {
                const isMarkdownText = syncCompiler.isMarkdown(text)
                const htmlTextRatio = html.length / (text?.length || 1)


                // If text is clearly markdown, process it even if HTML is present
                if (isMarkdownText) {
                } else if (htmlTextRatio > 5) {
                  return false
                }
              }

              if (syncCompiler.isMarkdown(text)) {
                console.log('[MarkdownPaste] Detected as markdown:', text.substring(0, 100));

                try {
                  // Prevent default paste immediately
                  event.preventDefault()

                  // Compile markdown to HTML asynchronously
                  workerCompiler.compile(text).then(htmlContent => {
                    console.log('[MarkdownPaste] Compiled HTML:', htmlContent.substring(0, 200));
                    if (!htmlContent) return

                    // Insert the converted HTML with better parsing options
                    editor.chain()
                      .focus()
                      .insertContent(htmlContent, {
                        parseOptions: {
                          preserveWhitespace: 'full',
                          findPositions: true,
                          keepWhitespace: true,
                        },
                        updateSelection: true,
                      })
                      .run()
                  }).catch(err => {
                    console.error('Markdown paste compilation failed:', err)
                    // Fallback to inserting text if compilation fails
                    editor.chain().focus().insertContent(text).run()
                  })

                  return true
                } catch (error) {
                  return false
                }
              } else {
                console.log('[MarkdownPaste] NOT detected as markdown:', text.substring(0, 100));
              }
            }

            return false
          },
        },
      }),
    ]
  },
})

function isMarkdownContent(text) {
  if (!text || typeof text !== 'string') return false
  
  const markdownPatterns = [
    /\*\*[^*]+\*\*/,        // **bold**
    /\*[^*]+\*/,            // *italic*
    /~~[^~]+~~/,            // ~~strikethrough~~
    /==[^=]+=/,             // ==highlight==
    /`[^`]+`/,              // `code`
    /^#{1,6}\s+/m,          // # headings
    /^>\s+/m,               // > blockquotes
    /^[-*+]\s+/m,           // - lists
    /^\d+\.\s+/m,           // 1. numbered lists
    /^\|.+\|/m,             // | table |
    /\[[^\]]*\]\([^)]*\)/,  // [link](url)
    /```[\s\S]*?```/,       // ```code blocks```
    /^\s*- \[[x\s]\]/m,     // - [x] task lists
    /\[\[[^\]]+\]\]/,       // [[wiki links]]
    /!\[\[[^\]]+\]\]/,      // ![[wiki embeds]]
  ]

  return markdownPatterns.some(pattern => pattern.test(text))
}

export default MarkdownPaste
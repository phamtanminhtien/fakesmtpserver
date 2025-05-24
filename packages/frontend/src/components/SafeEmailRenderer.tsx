import React, { useEffect, useRef } from "react";

interface SafeEmailRendererProps {
  htmlContent: string;
  className?: string;
}

export const SafeEmailRenderer: React.FC<SafeEmailRendererProps> = ({
  htmlContent,
  className = "",
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (doc) {
        // Create a complete HTML document with proper CSS reset and responsive meta tag
        const safeHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                /* CSS Reset */
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                  font-size: 14px;
                  line-height: 1.5;
                  color: #333;
                  background-color: #fff;
                  padding: 16px;
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                }
                
                /* Ensure images are responsive */
                img {
                  max-width: 100% !important;
                  height: auto !important;
                }
                
                /* Prevent horizontal scrolling */
                table {
                  max-width: 100% !important;
                  table-layout: fixed !important;
                }
                
                /* Style links */
                a {
                  color: #0066cc;
                  text-decoration: underline;
                }
                
                /* Prevent scripts from running */
                script {
                  display: none !important;
                }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `;

        doc.open();
        doc.write(safeHtml);
        doc.close();

        // Disable all scripts for security
        const scripts = doc.querySelectorAll("script");
        scripts.forEach((script) => script.remove());

        // Remove potentially dangerous attributes
        const allElements = doc.querySelectorAll("*");
        allElements.forEach((element) => {
          // Remove event handlers
          const attributes = Array.from(element.attributes);
          attributes.forEach((attr) => {
            if (attr.name.startsWith("on")) {
              element.removeAttribute(attr.name);
            }
          });

          // Remove javascript: links
          if (element.tagName === "A") {
            const href = element.getAttribute("href");
            if (href && href.toLowerCase().startsWith("javascript:")) {
              element.removeAttribute("href");
            }
          }
        });

        // Auto-resize iframe to content height
        const resizeIframe = () => {
          try {
            const contentHeight = doc.body.scrollHeight;
            iframe.style.height = Math.max(contentHeight, 200) + "px";
          } catch {
            // Fallback height if we can't access the content
            iframe.style.height = "400px";
          }
        };

        // Resize after content is loaded
        setTimeout(resizeIframe, 100);

        // Add resize observer for dynamic content
        if (window.ResizeObserver) {
          const resizeObserver = new ResizeObserver(resizeIframe);
          resizeObserver.observe(doc.body);

          // Clean up observer when component unmounts
          return () => resizeObserver.disconnect();
        }
      }
    }
  }, [htmlContent]);

  return (
    <iframe
      ref={iframeRef}
      className={`w-full border-0 bg-white ${className}`}
      style={{
        minHeight: "200px",
        maxHeight: "400px",
      }}
      sandbox="allow-same-origin"
      title="Email Content"
    />
  );
};

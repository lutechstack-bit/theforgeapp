import { useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// Despia WebView mishandles blob-URL workers — pin to a CDN that mirrors
// the npm package so the URL always exists for whatever pdfjs-dist version
// is installed (cdnjs lags behind npm and 404s for newer 5.x releases).
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerModalProps {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}

export function PDFViewerModal({ open, onClose, fileUrl, title }: PDFViewerModalProps) {
  const { user } = useAuth();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [signError, setSignError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !fileUrl) return;
    let cancelled = false;
    setSignedUrl(null);
    setSignError(null);
    setNumPages(0);
    setPageNum(1);

    (async () => {
      const { data, error } = await supabase.storage
        .from('learn-resources')
        .createSignedUrl(fileUrl, 3600);
      if (cancelled) return;
      if (error || !data) {
        setSignError(error?.message ?? 'Failed to load PDF');
      } else {
        setSignedUrl(data.signedUrl);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, fileUrl]);

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, [open, signedUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setPageNum((p) => (numPages ? Math.min(p + 1, numPages) : p));
      else if (e.key === 'ArrowLeft') setPageNum((p) => Math.max(p - 1, 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, numPages]);

  const watermark = user?.email ?? 'The Forge';
  const pageWidth = Math.min(width || 800, 900);

  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="fixed inset-0 z-[101] flex flex-col bg-background focus:outline-none"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {/* Header */}
                <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-card/95 backdrop-blur border-b border-border/50">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Close"
                    className="h-9 w-9 rounded-full shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <DialogPrimitive.Title className="flex-1 truncate text-sm sm:text-base font-medium text-foreground">
                    {title}
                  </DialogPrimitive.Title>
                  <span className="px-3 py-1 text-[11px] sm:text-xs rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap">
                    {pageNum} / {numPages || '—'}
                  </span>
                </div>

                {/* Body */}
                <div
                  ref={containerRef}
                  className="flex-1 overflow-auto relative flex justify-center py-6 px-3 sm:px-6"
                >
                  {/* Watermark — visual deterrent only, not DRM.
                      Real solution is server-side PDF stamping via edge function when piracy becomes a real problem. */}
                  <div
                    aria-hidden
                    className="pointer-events-none select-none absolute inset-0 z-10 overflow-hidden"
                  >
                    <div
                      className="absolute -inset-1/4 flex flex-wrap content-start gap-x-16 gap-y-20 p-8"
                      style={{ transform: 'rotate(-35deg)', transformOrigin: 'center' }}
                    >
                      {Array.from({ length: 120 }).map((_, i) => (
                        <span
                          key={i}
                          className="text-xs sm:text-sm font-medium text-primary whitespace-nowrap"
                          style={{ opacity: 0.08 }}
                        >
                          {watermark}
                        </span>
                      ))}
                    </div>
                  </div>

                  {!signedUrl && !signError && (
                    <div className="flex items-center justify-center p-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  {signError && (
                    <div className="flex flex-col items-center gap-3 p-12 text-foreground max-w-sm text-center">
                      <p className="text-sm text-muted-foreground">{signError}</p>
                      <Button variant="outline" onClick={onClose}>Close</Button>
                    </div>
                  )}
                  {signedUrl && (
                    <Document
                      file={signedUrl}
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                      loading={
                        <div className="p-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      }
                      error={
                        <div className="flex flex-col items-center gap-3 p-12 text-foreground max-w-sm text-center">
                          <p className="text-sm text-muted-foreground">Couldn't render this PDF.</p>
                          <a
                            href={signedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline text-sm"
                          >
                            Open in new tab
                          </a>
                        </div>
                      }
                      className="relative z-0"
                    >
                      <Page
                        pageNumber={pageNum}
                        width={pageWidth}
                        renderAnnotationLayer
                        renderTextLayer
                        className="shadow-xl rounded-xl overflow-hidden"
                      />
                    </Document>
                  )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 z-20 flex items-center justify-between gap-3 px-4 py-3 bg-card/95 backdrop-blur border-t border-border/50">
                  <Button
                    variant="ghost"
                    onClick={() => setPageNum((p) => Math.max(p - 1, 1))}
                    disabled={pageNum <= 1}
                    className="min-h-[44px] min-w-[44px] gap-1 rounded-xl"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="hidden sm:inline">Prev</span>
                  </Button>
                  <span className="text-xs sm:text-sm font-medium text-foreground tabular-nums">
                    {pageNum} <span className="text-muted-foreground">/</span> {numPages || '—'}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => setPageNum((p) => (numPages ? Math.min(p + 1, numPages) : p))}
                    disabled={!numPages || pageNum >= numPages}
                    className="min-h-[44px] min-w-[44px] gap-1 rounded-xl"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </AnimatePresence>
  );
}

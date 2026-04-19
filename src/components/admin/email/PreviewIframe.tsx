import React from 'react';

/**
 * Isolated preview pane that renders arbitrary email HTML inside an iframe's
 * srcDoc so our app's Tailwind + global CSS can't leak into the preview and
 * (more importantly) the email's own styles can't hijack the admin UI.
 */
export const PreviewIframe: React.FC<{
  html: string;
  title?: string;
  className?: string;
}> = ({ html, title = 'Email preview', className }) => {
  return (
    <iframe
      title={title}
      srcDoc={html || '<p style="font-family: sans-serif; color: #888; padding: 24px;">Preview will appear here once you paste HTML.</p>'}
      sandbox="allow-same-origin"
      className={className ?? 'w-full h-full min-h-[500px] rounded-lg bg-white border border-border/40'}
    />
  );
};

export default PreviewIframe;

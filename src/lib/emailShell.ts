// Branded email shell for The Forge.
//
// Lets admins author emails as plain content (heading + body + optional CTA)
// without touching HTML. The Simple-mode composer (AdminEmailTemplateEdit)
// turns its fields into `html_content` by calling `wrapInForgeShell`, so every
// email gets the same dark/gold Forge styling used by the student-welcome mail.
//
// Merge tags (e.g. {{user.first_name}}) pass straight through untouched — they
// are resolved server-side at send time by send-email / preview-email.

export interface ForgeShellOptions {
  /** Big headline at the top of the card. Optional. */
  heading?: string;
  /** Call-to-action button label. Button only renders when both text + url set. */
  ctaText?: string;
  /** Call-to-action button URL. */
  ctaUrl?: string;
  /** Small intro line under the logo, above the heading card. Optional. */
  preheader?: string;
}

const FORGE_STYLES = `
  body { margin:0; padding:0; background:#0b0a08; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; }
  .wrap { max-width:560px; margin:0 auto; padding:40px 24px; }
  .logo { font-size:22px; font-weight:800; color:#f5efe2; letter-spacing:-0.5px; }
  .logo span { color:#f59e0b; }
  .hero { background:linear-gradient(135deg,#1a1814 0%,#110f0c 100%); border:1px solid #2a2520; border-radius:16px; padding:36px 32px; margin:28px 0; }
  .hero h1 { color:#f5efe2; font-size:28px; font-weight:700; margin:0; line-height:1.25; }
  .hero h1 span { color:#f59e0b; }
  .body-content { color:#c8c0b8; font-size:15px; line-height:1.7; }
  .body-content p { margin:0 0 16px; }
  .body-content strong { color:#f5efe2; }
  .body-content a { color:#f59e0b; text-decoration:none; }
  .body-content ul, .body-content ol { color:#c8c0b8; padding-left:20px; margin:0 0 16px; }
  .body-content li { margin-bottom:8px; }
  .btn { display:inline-block; background:#f59e0b; color:#0b0a08 !important; font-weight:700; font-size:15px; padding:14px 32px; border-radius:50px; text-decoration:none; margin:24px 0; }
  .divider { border:none; border-top:1px solid #2a2520; margin:28px 0; }
  .footer { color:#6b635d; font-size:12px; text-align:center; margin-top:32px; line-height:1.6; }
  .footer a { color:#f59e0b; text-decoration:none; }
`;

/**
 * Wraps author-supplied body HTML in the branded Forge email shell.
 * `bodyHtml` is the inner content (paragraphs, lists, links) — NOT a full doc.
 */
export function wrapInForgeShell(bodyHtml: string, opts: ForgeShellOptions = {}): string {
  const { heading, ctaText, ctaUrl, preheader } = opts;

  const heroBlock = heading
    ? `<div class="hero"><h1>${heading}</h1></div>`
    : '';

  const preheaderBlock = preheader
    ? `<p style="color:#a8a09a;font-size:14px;line-height:1.6;margin:16px 0 0;">${preheader}</p>`
    : '';

  const ctaBlock = ctaText && ctaUrl
    ? `<a href="${ctaUrl}" class="btn">${ctaText}</a>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Forge</title>
  <style>${FORGE_STYLES}</style>
</head>
<body>
<div class="wrap">
  <div class="logo">the <span>Forge</span></div>
  ${preheaderBlock}
  ${heroBlock}
  <div class="body-content">
${bodyHtml}
  </div>
  ${ctaBlock}
  <hr class="divider" />
  <div class="footer">
    <p>The Forge by LevelUp Learning · <a href="https://leveluplearning.in">leveluplearning.in</a></p>
  </div>
</div>
</body>
</html>`;
}

/**
 * Minimal plain-text → HTML converter for the Simple composer body field.
 * Supports: blank-line paragraphs, `- ` / `* ` bullet lists, **bold**,
 * [text](url) links, and {{merge.tags}} (passed through verbatim).
 * Intentionally tiny — no external markdown dependency.
 */
export function simpleBodyToHtml(text: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const inline = (s: string) =>
    escape(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');

  const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/);
  const html: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.trim() !== '');
    if (lines.length === 0) continue;

    const isList = lines.every((l) => /^\s*[-*]\s+/.test(l));
    if (isList) {
      const items = lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('');
      html.push(`<ul>${items}</ul>`);
    } else {
      html.push(`<p>${lines.map(inline).join('<br/>')}</p>`);
    }
  }

  return html.join('\n');
}

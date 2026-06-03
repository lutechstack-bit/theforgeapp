// Branded email shell for The Forge.
//
// Lets admins author emails as plain content (heading + body + optional CTA)
// without touching HTML. The Simple-mode composer (AdminEmailTemplateEdit)
// turns its fields into `html_content` by calling `wrapInForgeShell`, so every
// email gets the same clean, light Forge styling (white background, dark text,
// a simple logo and an understated button) used by the student-welcome mail.
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
  body { margin:0; padding:0; background:#ffffff; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; }
  .wrap { max-width:560px; margin:0 auto; padding:32px 24px; }
  .logo { font-size:20px; font-weight:700; color:#111111; letter-spacing:-0.3px; margin-bottom:8px; }
  .logo span { color:#d97706; }
  .hero { margin:20px 0 8px; }
  .hero h1 { color:#111111; font-size:24px; font-weight:700; margin:0; line-height:1.3; }
  .body-content { color:#333333; font-size:15px; line-height:1.7; }
  .body-content p { margin:0 0 16px; }
  .body-content strong { color:#111111; }
  .body-content a { color:#0b5cad; text-decoration:underline; }
  .body-content ul, .body-content ol { color:#333333; padding-left:20px; margin:0 0 16px; }
  .body-content li { margin-bottom:8px; }
  .btn { display:inline-block; background:#111111; color:#ffffff !important; font-weight:600; font-size:15px; padding:12px 28px; border-radius:6px; text-decoration:none; margin:20px 0; }
  .divider { border:none; border-top:1px solid #e5e5e5; margin:28px 0; }
  .footer { color:#999999; font-size:12px; text-align:left; margin-top:28px; line-height:1.6; }
  .footer a { color:#777777; text-decoration:underline; }
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

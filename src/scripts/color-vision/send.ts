// Opt-in "send my results to Stephen" panel. Nothing is sent unless the visitor
// ticks the box and presses Send.

export function mountSend(el: HTMLElement, kind: 'swatch' | 'threshold', get: () => { results: unknown; summary: string[]; name?: string }) {
  el.innerHTML = `
    <div class="cv-send">
      <p class="cv-send-title">Help with the research (optional)</p>
      <p class="cv-send-text">Your results stay on this device unless you choose to send them. If you send them,
        Stephen gets your answers, thresholds, the screen and browser details recorded above, and any name or note you add.
        They're used only for this project.</p>
      <label class="cv-check"><input type="checkbox" class="cv-consent"> Yes, send my results to Stephen</label>
      <div class="cv-send-fields" hidden>
        <input class="cv-name" type="text" maxlength="60" placeholder="Name or initials (optional)" autocomplete="off">
        <input class="cv-note" type="text" maxlength="300" placeholder="Anything he should know? e.g. screen, glasses (optional)" autocomplete="off">
        <input class="cv-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button type="button" class="btn btn-primary cv-go">Send results</button>
      </div>
      <p class="cv-send-status" role="status"></p>
    </div>`;
  const $ = <T extends HTMLElement>(s: string) => el.querySelector(s) as T;
  const consent = $<HTMLInputElement>('.cv-consent'), fields = $('.cv-send-fields'), go = $<HTMLButtonElement>('.cv-go');
  const status = $('.cv-send-status'), nameIn = $<HTMLInputElement>('.cv-name');
  const preset = get().name; if (preset && preset !== 'unnamed') nameIn.value = preset;
  consent.onchange = () => { fields.hidden = !consent.checked; status.textContent = ''; };
  go.onclick = async () => {
    if (!consent.checked) return;
    go.disabled = true; status.textContent = 'Sending…';
    const { results, summary } = get();
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind, consent: true, name: nameIn.value, note: $<HTMLInputElement>('.cv-note').value,
          website: $<HTMLInputElement>('.cv-hp').value, summary, results }),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) { status.textContent = 'Sent. Thank you!'; consent.disabled = true; fields.hidden = true; return; }
      throw new Error(out.error || res.statusText);
    } catch (e) {
      status.textContent = `Couldn't send (${(e as Error).message}). You can save the file instead and email it.`;
      go.disabled = false;
    }
  };
}

/** Save text as a file, with fallbacks for phones (share sheet first). */
export async function saveFile(text: string, name: string, note: (m: string) => void) {
  try {
    const file = new File([text], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); note('Shared.'); return; }
  } catch (e) { if ((e as Error)?.name === 'AbortError') { note('Share cancelled.'); return; } }
  try {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
    note(`Saved to your downloads as ${name}`); return;
  } catch { /* fall through */ }
  try { await navigator.clipboard.writeText(text); note('Copied to the clipboard.'); } catch { note('Could not save the file on this device.'); }
}

import { getText } from '../lib/api';
import { useAsync, useStoredNumber } from '../lib/hooks';
import { Async } from './Status';

type Kind = 'tab' | 'lyrics';

const DEFAULT_SIZE: Record<Kind, number> = { tab: 13, lyrics: 16 };

/** Shows a .txt tab or lyrics file (monospace for tabs, never wrapped), or a PDF. */
export function TextViewer({ url, kind, title }: { url: string; kind: Kind; title: string }) {
  const [size, setSize] = useStoredNumber(`fftabs.fs.${kind}`, DEFAULT_SIZE[kind]);
  const isPdf = /\.pdf$/i.test(url);
  const text = useAsync(() => (isPdf ? Promise.resolve('') : getText(url)), [url]);
  const bump = (d: number) => setSize(Math.min(28, Math.max(9, size + d)));

  return (
    <>
      <div class="toolbar">
        {!isPdf && (
          <>
            <button type="button" onClick={() => bump(-1)} aria-label="Smaller text">A−</button>
            <button type="button" onClick={() => bump(1)} aria-label="Larger text">A+</button>
          </>
        )}
        <span class="spacer" />
        <a href={url} target="_blank" rel="noopener">Open raw file</a>
      </div>
      {isPdf ? (
        <iframe class="pdf" src={url} title={`${title} (PDF)`} />
      ) : (
        <Async state={text}>
          {(t) => (
            <pre class={kind === 'lyrics' ? 'tab lyrics' : 'tab'} style={`--fs:${size}px`}>
              {kind === 'tab' ? t.replace(/^\n+/, '') : t}
            </pre>
          )}
        </Async>
      )}
    </>
  );
}

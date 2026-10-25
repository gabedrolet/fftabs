import { useTitle } from '../lib/hooks';

export function LegalPage() {
  useTitle('Legal');
  return (
    <div class="prose">
      <h1>Legal</h1>
      <p>
        All trademarks and copyrights are property of their respective owners unless otherwise mentioned: Roswell
        Records Inc., RCA Records, Sony BMG, Foo Fighters.
      </p>
      <ul>
        <li>This archive is provided free of charge and only for educational purposes.</li>
        <li>Its content is for personal and non-commercial use only.</li>
        <li>The tablatures here are not official; they are by-ear transcriptions by fans.</li>
        <li>We do not claim any copyright over the music and lyrics.</li>
      </ul>
      <p>Gabriel Drolet. Originally published at fftabs.com.</p>
    </div>
  );
}

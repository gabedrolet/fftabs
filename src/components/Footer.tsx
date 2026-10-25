import { Link } from './Link';

export function Footer() {
  return (
    <footer class="site-footer">
      <div class="wrap">
        Fan archive of fftabs.com: by-ear transcriptions for personal, educational, non-commercial use.
        {' · '}
        <Link to={{ name: 'legal' }}>Legal</Link>
        {' · '}
        <a href="https://github.com/gabedrolet/fftabs" rel="noopener">GitHub</a>
      </div>
    </footer>
  );
}

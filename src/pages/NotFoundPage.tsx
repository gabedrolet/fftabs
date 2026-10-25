import { Link } from '../components/Link';
import { useTitle } from '../lib/hooks';

export function NotFoundPage() {
  useTitle('Not found');
  return (
    <>
      <h1>Not found</h1>
      <p>
        That page isn’t in the archive. <Link to={{ name: 'home' }}>Back to albums</Link>
      </p>
    </>
  );
}

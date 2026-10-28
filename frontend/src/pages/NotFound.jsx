import { Link } from 'react-router-dom';
export default function NotFound(){return <div className="error-state"><div className="error-symbol">404</div><h2>This orbit is unexplored.</h2><p>The page you’re looking for doesn’t exist.</p><Link to="/" className="button button-primary">Back to overview</Link></div>;}

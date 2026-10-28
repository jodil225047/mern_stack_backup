import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Applications from './pages/Applications.jsx';
import ApplicationDetails from './pages/ApplicationDetails.jsx';
import NotFound from './pages/NotFound.jsx';
export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = location.pathname.startsWith('/applications/') && location.pathname !== '/applications' ? 'Application details' : location.pathname === '/applications' ? 'Applications' : 'Overview';
  return <div className="app-shell"><Sidebar mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} /><div className="main-shell"><Topbar title={title} onMenu={() => setMobileOpen(v => !v)} /><main className="page-content"><Routes><Route path="/" element={<Dashboard />} /><Route path="/applications" element={<Applications />} /><Route path="/applications/:id" element={<ApplicationDetails />} /><Route path="*" element={<NotFound />} /></Routes></main><footer className="footer">Made for the next chapter of your career <span>✦</span></footer></div></div>;
}

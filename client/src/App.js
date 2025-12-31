import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Divisions from './pages/Divisions';
import Contact from './pages/Contact';
import Quote from './pages/Quote';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import ContentEditor from './pages/ContentEditor';
import './App.css';
import { useEffect, useRef } from 'react';
import { useEditMode } from './context/EditModeContext';

function App() {
  const { isEditMode } = useEditMode();
  const location = useLocation();
  const mainRef = useRef(null);
  const footerRef = useRef(null);
  const API_BASE = process.env.REACT_APP_API_BASE || '';
  const isAnalytics = location.pathname === '/analytics' || location.pathname.startsWith('/analytics');

  // Prevent navigation when editing and enable image replacement
  useEffect(() => {
    const targets = [mainRef.current, footerRef.current].filter(Boolean);
    if (targets.length === 0) return;

    const handleClick = (e) => {
      // Image replace on click (only in edit mode)
      if (!isEditMode) return;
      // Do not allow editing on analytics page
      if (isAnalytics) return;
      const anchor = e.target.closest('a');
      if (anchor) return;
      const img = e.target.closest('img');
      if (img) {
        e.preventDefault();
        e.stopPropagation();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (ev) => {
          const file = ev.target.files && ev.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            img.src = reader.result;
          };
          reader.readAsDataURL(file);
        };
        input.click();
      }
    };

    targets.forEach(el => el.addEventListener('click', handleClick, true));
    return () => {
      targets.forEach(el => el.removeEventListener('click', handleClick, true));
    };
  }, [isEditMode, isAnalytics]);

  // Note: Avoid restoring raw innerHTML to prevent React reconciliation issues.

  // Load published content for current route when NOT in edit mode
  useEffect(() => {
    if (isEditMode) return;
    if (!mainRef.current) return;
    if (isAnalytics) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const qs = `pagePath=${encodeURIComponent(window.location.pathname)}&variant=published`;
        const res = await fetch(`${API_BASE}/api/cms/content?${qs}`, { signal: controller.signal });
        if (!res.ok) return;
        const json = await res.json();
        const data = json?.data || {};
        if (typeof data.htmlMain === 'string' && mainRef.current) {
          mainRef.current.innerHTML = data.htmlMain;
        }
        if (typeof data.htmlFooter === 'string' && footerRef.current) {
          footerRef.current.innerHTML = data.htmlFooter;
        }
      } catch {}
    };
    load();
    return () => controller.abort();
  }, [location, isEditMode, isAnalytics]);

  // Analytics: track page views on route change
  useEffect(() => {
    const ensureIds = () => {
      let clientId = localStorage.getItem('asg:clientId');
      if (!clientId) {
        clientId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('asg:clientId', clientId);
      }
      let sessionId = sessionStorage.getItem('asg:sessionId');
      const lastTs = Number(sessionStorage.getItem('asg:lastTs') || '0');
      const now = Date.now();
      const thirtyMin = 30 * 60 * 1000;
      if (!sessionId || now - lastTs > thirtyMin) {
        sessionId = Math.random().toString(36).slice(2) + now.toString(36);
      }
      sessionStorage.setItem('asg:sessionId', sessionId);
      sessionStorage.setItem('asg:lastTs', String(now));
      return { clientId, sessionId };
    };
    const getDevice = () => {
      const ua = navigator.userAgent || '';
      if (/Mobile|Android|iPhone|iPad/i.test(ua)) return 'mobile';
      if (/Tablet/i.test(ua)) return 'tablet';
      return 'desktop';
    };
    const getLoadTime = () => {
      try {
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav && typeof nav.loadEventEnd === 'number') {
          return Math.max(0, nav.loadEventEnd);
        }
      } catch {}
      return undefined;
    };
    const ids = ensureIds();
    const payload = {
      type: 'pageview',
      path: window.location.pathname + window.location.search + window.location.hash,
      meta: {
        clientId: ids.clientId,
        sessionId: ids.sessionId,
        device: getDevice(),
        ua: navigator.userAgent,
        width: window.innerWidth,
        height: window.innerHeight,
        loadTimeMs: getLoadTime(),
      },
    };
    try {
      const url = `${API_BASE}/api/analytics/track`;
      navigator.sendBeacon?.(url, new Blob([JSON.stringify(payload)], { type: 'application/json' }))
        || fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch {}
  }, [location]);

  // Analytics: track clicks globally
  useEffect(() => {
    const onClick = (e) => {
      // refresh session activity
      sessionStorage.setItem('asg:lastTs', String(Date.now()));
      const clientId = localStorage.getItem('asg:clientId');
      const sessionId = sessionStorage.getItem('asg:sessionId');
      try {
        const target = e.target.closest('[data-analytics-label]') || e.target;
        const label = target?.getAttribute?.('data-analytics-label') || target?.tagName;
        const text = (target?.innerText || '').trim().slice(0, 120);
        const payload = {
          type: 'click',
          path: window.location.pathname + window.location.search + window.location.hash,
          element: label,
          text,
          meta: { clientId, sessionId },
        };
        const url = `${API_BASE}/api/analytics/track`;
        navigator.sendBeacon?.(url, new Blob([JSON.stringify(payload)], { type: 'application/json' }))
          || fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } catch {}
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return (
    <>
      <Helmet>
        <title>Al Safa Global - Procurement & Supply Chain Solutions</title>
        <meta name="description" content="Al Safa Global General Trading FZ LLC - Your Trusted Partner in Procurement & Supply Chain Solutions. We provide comprehensive procurement, supply chain management, and trading services across the UAE and Middle East." />
        <meta name="keywords" content="procurement, supply chain, trading, UAE, Dubai, Al Safa Global, business solutions, logistics" />
        <meta name="author" content="Al Safa Global General Trading FZ LLC" />
        <link rel="canonical" href={(typeof window !== 'undefined' ? window.location.origin : '') + '/'} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Al Safa Global - Procurement & Supply Chain Solutions" />
        <meta property="og:description" content="Your Trusted Partner in Procurement & Supply Chain Solutions. We provide comprehensive procurement, supply chain management, and trading services." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={(typeof window !== 'undefined' ? window.location.origin : '') + '/'} />
        <meta property="og:image" content={(typeof window !== 'undefined' ? window.location.origin : '') + '/images/logo.png'} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Al Safa Global - Procurement & Supply Chain Solutions" />
        <meta name="twitter:description" content="Your Trusted Partner in Procurement & Supply Chain Solutions. We provide comprehensive procurement, supply chain management, and trading services." />
        <meta name="twitter:image" content={(typeof window !== 'undefined' ? window.location.origin : '') + '/images/logo.png'} />
      </Helmet>
      
      <ScrollToTop />
      <div className="App">
        <Header />
        <main
          ref={mainRef}
          className={isEditMode ? 'editing' : ''}
          data-app-main
          contentEditable={isEditMode && !isAnalytics}
          suppressContentEditableWarning
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/divisions" element={<Divisions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/admin/content" element={<ContentEditor />} />
          </Routes>
        </main>
        {!isAnalytics && (
          <div
            ref={footerRef}
            data-app-footer
            className={isEditMode ? 'editing' : ''}
            contentEditable={isEditMode}
            suppressContentEditableWarning
          >
            <Footer />
          </div>
        )}
      </div>
    </>
  );
}

export default App; 
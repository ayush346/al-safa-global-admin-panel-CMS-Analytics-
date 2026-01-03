import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import './Header.css';
import { useEditMode } from '../context/EditModeContext';
import { toast } from 'react-hot-toast';
import { useContent } from '../context/ContentContext';

const Header = () => {
  const { content } = useContent();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isEditMode, setEditMode } = useEditMode();
  const API_BASE = process.env.REACT_APP_API_BASE || '';

  async function saveDraft() {
    try {
      const label = window.prompt('Enter a name for this save (e.g., "Homepage tweak v1")');
      if (!label) return;
      const mainEl = document.querySelector('[data-app-main]');
      const footerEl = document.querySelector('[data-app-footer]');
      // Collect structured overrides from data-cms-key elements (optional)
      const overrides = {};
      const setNested = (obj, path, value) => {
        const parts = path.split('.');
        let cur = obj;
        for (let i = 0; i < parts.length - 1; i++) {
          const p = parts[i];
          cur[p] = cur[p] || {};
          cur = cur[p];
        }
        cur[parts[parts.length - 1]] = value;
      };
      document.querySelectorAll('[data-cms-key]').forEach((el) => {
        const key = el.getAttribute('data-cms-key');
        const type = el.getAttribute('data-cms-type') || 'text';
        let value;
        if (type === 'image') {
          value = el.getAttribute('src') || '';
        } else {
          value = (el.textContent || '').trim();
        }
        setNested(overrides, key, value);
      });
      // Serialize lists (supports nested sublists and disabled flags)
      document.querySelectorAll('[data-cms-list]').forEach((listEl) => {
        const path = listEl.getAttribute('data-cms-list');
        if (!path) return;
        const items = [];
        // take only direct children items of this list
        const directItems = listEl.querySelectorAll(':scope > [data-cms-item]');
        directItems.forEach((itemEl) => {
          const obj = {};
          // collect fields that are NOT inside a sublist
          const allFields = itemEl.querySelectorAll('[data-cms-field]');
          allFields.forEach((fieldEl) => {
            // skip fields that live inside a nested sublist within this item
            const sublistAncestor = fieldEl.closest('[data-cms-sublist]');
            if (sublistAncestor && itemEl.contains(sublistAncestor)) return;
            const field = fieldEl.getAttribute('data-cms-field');
            if (!field) return;
            obj[field] = (fieldEl.textContent || '').trim();
          });
          // include disabled flag if present on the item
          const disabledAttr = itemEl.getAttribute('data-disabled');
          if (disabledAttr === 'true') {
            obj._disabled = true;
          }
          // handle any nested sublists within this item
          const sublists = itemEl.querySelectorAll(':scope [data-cms-sublist]');
          sublists.forEach((subEl) => {
            const subKey = subEl.getAttribute('data-cms-sublist');
            if (!subKey) return;
            const subArray = [];
            const subItems = subEl.querySelectorAll(':scope > [data-cms-item]');
            subItems.forEach((subItemEl) => {
              const subObj = {};
              const subFields = subItemEl.querySelectorAll('[data-cms-field]');
              subFields.forEach((sf) => {
                const f = sf.getAttribute('data-cms-field');
                if (!f) return;
                subObj[f] = (sf.textContent || '').trim();
              });
              const subDisabled = subItemEl.getAttribute('data-disabled');
              if (subDisabled === 'true') {
                subObj._disabled = true;
              }
              if (Object.keys(subObj).length > 0) subArray.push(subObj);
            });
            obj[subKey] = subArray;
          });
          // push only if something was captured
          if (Object.keys(obj).length > 0) items.push(obj);
        });
        setNested(overrides, path, items);
      });
      // 1) Save structured overrides globally (does not affect layout)
      const payloadGlobal = {
        // Store structured overrides under a global page to avoid UI replacement
        pagePath: '_global',
        label,
        data: {
          htmlMain: mainEl ? mainEl.innerHTML : '',
          htmlFooter: footerEl ? footerEl.innerHTML : '',
          overrides,
        },
      };
      const res1 = await fetch(`${API_BASE}/api/cms/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': localStorage.getItem('asg:adminToken') || '',
        },
        body: JSON.stringify(payloadGlobal),
      });
      if (!res1.ok) throw new Error('Save failed');
      // 2) Save full-page snapshot for the current route so add/remove sections go live after Publish
      const payloadPage = {
        pagePath: window.location.pathname || '/',
        label,
        data: {
          htmlMain: mainEl ? mainEl.innerHTML : '',
          htmlFooter: footerEl ? footerEl.innerHTML : '',
        },
      };
      const res2 = await fetch(`${API_BASE}/api/cms/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': localStorage.getItem('asg:adminToken') || '',
        },
        body: JSON.stringify(payloadPage),
      });
      if (!res2.ok) throw new Error('Save failed');
      toast.success('Saved to history');
    } catch (e) {
      toast.error(e.message || 'Save failed');
    }
  }

  async function openHistory() {
    try {
      const res = await fetch(`${API_BASE}/api/cms/versions?pagePath=${encodeURIComponent('_global')}`, {
        headers: { 'x-admin-token': localStorage.getItem('asg:adminToken') || '' },
      });
      if (!res.ok) throw new Error('Failed to load history');
      const json = await res.json();
      const versions = json.versions || [];
      if (versions.length === 0) {
        toast('No history yet. Save a version first.');
        return;
      }
      const list = versions
        .map((v, i) => `${i + 1}. ${v.label} — ${new Date(v.createdAt).toLocaleString()}`)
        .join('\n');
      const answer = window.prompt(`Select a version number to restore:\n\n${list}\n\nEnter a number or Cancel`);
      const index = answer ? parseInt(answer, 10) - 1 : -1;
      if (index < 0 || index >= versions.length) return;
      const chosen = versions[index];
      const r = await fetch(`${API_BASE}/api/cms/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': localStorage.getItem('asg:adminToken') || '',
        },
        body: JSON.stringify({ versionId: chosen._id }),
      });
      if (!r.ok) throw new Error('Restore failed');
      const restored = await r.json();
      const data = restored.version?.data || chosen.data;
      // Inject restored HTML into the editable areas for immediate preview
      const mainEl = document.querySelector('[data-app-main]');
      const footerEl = document.querySelector('[data-app-footer]');
      if (mainEl && typeof data.htmlMain === 'string') mainEl.innerHTML = data.htmlMain;
      if (footerEl && typeof data.htmlFooter === 'string') footerEl.innerHTML = data.htmlFooter;
      toast.success('Restored. Remember to Save again if you make further changes.');
    } catch (e) {
      toast.error(e.message || 'History failed');
    }
  }

  async function publishLatest() {
    try {
      // 1) Publish latest GLOBAL overrides (what viewers load via ContentContext)
      let res = await fetch(`${API_BASE}/api/cms/versions?pagePath=${encodeURIComponent('_global')}`, {
        headers: { 'x-admin-token': localStorage.getItem('asg:adminToken') || '' },
      });
      if (!res.ok) throw new Error('Failed to load history');
      let json = await res.json();
      let versions = json.versions || [];
      if (versions.length === 0) {
        toast('No versions to publish. Save first.');
        return;
      }
      let latest = versions[0];
      let ok = window.confirm(`Publish "${latest.label}" to live?`);
      if (!ok) return;
      let r = await fetch(`${API_BASE}/api/cms/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': localStorage.getItem('asg:adminToken') || '',
        },
        body: JSON.stringify({ versionId: latest._id }),
      });
      if (!r.ok) throw new Error('Publish failed');
      // 2) Optionally publish page snapshot as well (no-op if snapshots are disabled on frontend)
      const path = window.location.pathname || '/';
      try {
        const resPage = await fetch(`${API_BASE}/api/cms/versions?pagePath=${encodeURIComponent(path)}`, {
          headers: { 'x-admin-token': localStorage.getItem('asg:adminToken') || '' },
        });
        if (resPage.ok) {
          const jsonPage = await resPage.json();
          const pageVersions = jsonPage.versions || [];
          if (pageVersions.length > 0) {
            const latestPage = pageVersions[0];
            await fetch(`${API_BASE}/api/cms/publish`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-admin-token': localStorage.getItem('asg:adminToken') || '',
              },
              body: JSON.stringify({ versionId: latestPage._id }),
            });
          }
        }
      } catch {}
      toast.success('Published. Viewers will see the new version.');
    } catch (e) {
      toast.error(e.message || 'Publish failed');
    }
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = Array.isArray(content?.nav) ? content.nav : [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Segments', path: '/divisions' },
    { name: 'Contact', path: '/contact' },
    { name: 'Admin', path: '/admin' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.header 
      className={`header ${isScrolled ? 'scrolled' : ''} ${isEditMode ? 'editing-mode' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <motion.div 
            className="logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/">
              <div className="logo-container">
                <div className="logo-icon">
                  <img 
                    src={content?.site?.logo || (process.env.PUBLIC_URL + "/images/logo.png")}
                    alt={(content?.site?.name || "Al Safa Global") + " Logo"} 
                    className="logo-image"
                    onLoad={() => console.log('Logo loaded successfully')}
                    onError={(e) => {
                      console.error('Error loading logo:', e);
                      console.error('Attempted URL:', content?.site?.logo || (process.env.PUBLIC_URL + "/images/logo.png"));
                    }}
                  />
                </div>
                <div className="logo-text-container">
                  <span className="company-name">{content?.site?.name || 'Al Safa Global'}</span>
                  <span className="company-tagline">{content?.site?.tagline || 'General Trading FZ LLC'}</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <ul className="nav-list">
              {navItems.map((item, index) => (
                <motion.li 
                  key={item.name}
                  className="nav-item"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* CTA / Edit Mode Controls */}
          <motion.div 
            className="header-cta"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isEditMode ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={saveDraft}>Save</button>
                <button className="btn btn-secondary" onClick={openHistory}>History</button>
                <button className="btn btn-secondary" onClick={publishLatest}>Publish</button>
                <Link to="/analytics" className="btn btn-secondary">
                  Analytics
                </Link>
                <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                  Exit
                </button>
              </div>
            ) : (
              <Link to="/quote" className="btn btn-primary">
                Get Quote
              </Link>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="mobile-menu-btn"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiX />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiMenu />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <nav className="nav-mobile">
                <ul className="mobile-nav-list">
                  {navItems.map((item, index) => (
                    <motion.li 
                      key={item.name}
                      className="mobile-nav-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link 
                        to={item.path}
                        className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                      >
                        {item.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <motion.div 
                  className="mobile-cta"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link to="/quote" className="btn btn-primary btn-large">
                    Get Quote
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header; 
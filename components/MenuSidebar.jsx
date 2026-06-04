// components/MenuSidebar.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MenuSidebar({ currentUser }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
    setOpen(false);
  }

  return (
    <>
      <button className="hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
        <span /><span /><span />
      </button>

      {open && <div className="menu-backdrop" onClick={() => setOpen(false)} />}

      <nav className={`menu-sidebar${open ? ' open' : ''}`}>
        <div className="menu-header">
          <span className="menu-title">MENU</span>
          <button className="menu-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        <div className="menu-section-label">
          <Link href="/create" className="menu-create-btn" onClick={() => setOpen(false)}>
            + CREATE YOUR SPACE
          </Link>
        </div>

        <ul className="menu-list">
          {/* PINNED = public wall, always at top */}
          <li className="menu-item pinned">
            <Link href="/" onClick={() => setOpen(false)}>
              <span className="menu-dot" />
              PINNED
            </Link>
          </li>

          {/* Only show the logged-in user's own space */}
          {currentUser && (
            <li className="menu-item own">
              <Link href={`/space/${currentUser}`} onClick={() => setOpen(false)}>
                <span className="menu-dot" />
                {currentUser}'s Space
              </Link>
            </li>
          )}
        </ul>

        <div className="menu-bottom">
          {currentUser ? (
            <>
              <Link href="/settings" className="menu-settings-btn" onClick={() => setOpen(false)}>
                SETTINGS
              </Link>
              <button className="menu-logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link href="/create" className="menu-settings-btn" onClick={() => setOpen(false)}>
              LOG IN / SIGN UP
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

/* ============================================================
   Shopora — js/utils/toast.js
   Floating notification toast system.
   ============================================================ */

const Toast = (() => {
  let _container = null;

  const _ensureContainer = () => {
    if (_container) return;
    _container = document.createElement('div');
    _container.id = 'shopora-toast-container';
    _container.style.cssText =
      'position:fixed;top:80px;right:20px;z-index:9999;'
      + 'display:flex;flex-direction:column;gap:10px;pointer-events:none;';
    document.body.appendChild(_container);
  };

  const show = (message, type = 'info', duration = 3500) => {
    _ensureContainer();

    const toast = document.createElement('div');
    toast.className = `shopora-toast toast-${type}`;

    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warn: '#f59e0b',
      info: '#0ea5e9'
    };

    const icons = {
      success: '✓',
      error: '✕',
      warn: '⚠',
      info: 'ℹ'
    };

    toast.style.cssText =
      'pointer-events:auto;display:flex;align-items:center;gap:10px;'
      + 'padding:14px 20px;background:#fff;border-radius:10px;'
      + 'box-shadow:0 8px 30px rgba(0,0,0,0.12);'
      + `border-left:4px solid ${colors[type] || colors.info};`
      + 'font-family:Inter,sans-serif;font-size:0.875rem;color:#1e293b;'
      + 'min-width:280px;max-width:420px;'
      + 'transform:translateX(120%);transition:transform .35s cubic-bezier(.16,1,.3,1),opacity .3s;'
      + 'opacity:0;';

    toast.innerHTML =
      `<span style="font-size:1.2rem;color:${colors[type] || colors.info};font-weight:700;">`
      + `${icons[type] || icons.info}</span>`
      + `<span>${message}</span>`;

    _container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, duration);
  };

  return { show };
})();

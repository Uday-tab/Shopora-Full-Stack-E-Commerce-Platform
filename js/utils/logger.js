/* ============================================================
   Shopora — js/utils/logger.js
   System telemetry for the architecture visualizer console.
   ============================================================ */

const Logger = (() => {
  const _key = 'shopora_logs';
  const _max = 80;

  const _getLogs = () => {
    try {
      return JSON.parse(sessionStorage.getItem(_key)) || [];
    } catch {
      return [];
    }
  };

  const _save = (logs) => sessionStorage.setItem(_key, JSON.stringify(logs));

  const log = (type, message) => {
    const logs = _getLogs();
    logs.push({ type, message, time: new Date().toLocaleTimeString() });
    if (logs.length > _max) logs.shift();
    _save(logs);
    _dispatch(type, message);
  };

  const info    = (msg) => log('INFO', msg);
  const success = (msg) => log('SUCCESS', msg);
  const warn    = (msg) => log('WARN', msg);
  const error   = (msg) => log('ERROR', msg);

  const getLogs = _getLogs;

  const clear = () => {
    _save([]);
    _dispatch('INFO', 'Log stream cleared.');
  };

  const _dispatch = (type, message) => {
    window.dispatchEvent(
      new CustomEvent('shopora-log', {
        detail: {
          type,
          message,
          time: new Date().toLocaleTimeString()
        }
      })
    );
  };

  return { log, info, success, warn, error, getLogs, clear };
})();

export function currentPath(): string {
  const path = window.location.pathname.replace(/\/$/, '');
  return path || '/';
}

export function go(path: string) {
  const next = path.startsWith('/') ? path : `/${path}`;
  window.history.pushState({}, '', next);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

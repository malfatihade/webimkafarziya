// router.js — SPA Router
async function go(route){
  if (route === 'open-menu') { document.body.classList.add('menu-open'); return; }
  if (route === 'close-menu') { document.body.classList.remove('menu-open'); return; }

  document.body.classList.remove('menu-open');
  State.route = route;

  if (route === 'login') { renderLogin(); window.scrollTo(0, 0); return; }

  // Protect application pages from unauthenticated access.
  if (!State.user) {
    State.route = 'login';
    renderLogin();
    return;
  }

  if (route === 'dashboard') { renderDashboard(); window.scrollTo(0, 0); return; }
  if (route === 'modules') { renderModulesList(); window.scrollTo(0, 0); return; }
  if (route === 'progress') { renderProgress(); window.scrollTo(0, 0); return; }
  if (route === 'sequence') { renderSequence(); window.scrollTo(0, 0); return; }
  if (route === 'profile') { renderProfile(); window.scrollTo(0, 0); return; }
  if (route.startsWith('module:')) {
    renderModule(route.split(':')[1]);
    window.scrollTo(0, 0);
    return;
  }
}
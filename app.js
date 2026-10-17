/* Tutor Recruitment Portal - demo UI. Hash-routed single page, no backend. */

const $app = () => document.getElementById('app');
let toastTimer = null;

/* ---------- UI atoms ---------- */

const STAGE_COLORS = {
  Applied: 'bg-slate-100 text-slate-700', Screening: 'bg-sky-100 text-sky-700', Interview: 'bg-violet-100 text-violet-700',
  References: 'bg-amber-100 text-amber-800', Compliance: 'bg-orange-100 text-orange-800', Approved: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-rose-100 text-rose-700', Withdrawn: 'bg-slate-200 text-slate-600',
};
const REF_STATUS = {
  not_requested: ['Not requested', 'bg-slate-100 text-slate-600'],
  requested: ['Requested', 'bg-sky-100 text-sky-700'],
  reminded: ['Reminder sent', 'bg-amber-100 text-amber-800'],
  received: ['Received · awaiting review', 'bg-violet-100 text-violet-700'],
  approved: ['Approved', 'bg-emerald-100 text-emerald-800'],
  rejected: ['Rejected', 'bg-rose-100 text-rose-700'],
};
const COMP_STATUS = {
  valid: ['Valid', 'bg-emerald-100 text-emerald-800', 'bg-emerald-500'],
  expiring: ['Expiring soon', 'bg-amber-100 text-amber-800', 'bg-amber-500'],
  expired: ['Expired', 'bg-rose-100 text-rose-700', 'bg-rose-500'],
  missing: ['Missing', 'bg-slate-100 text-slate-500', 'bg-slate-300'],
};

function badge(text, cls) { return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}">${esc(text)}</span>`; }
function stageBadge(stage) { return badge(stage, STAGE_COLORS[stage] || 'bg-slate-100'); }
function refBadge(status) { const [t, c] = REF_STATUS[status]; return badge(t, c); }
function compBadge(status) { const [t, c] = COMP_STATUS[status]; return badge(t, c); }
function dot(status, title) { return `<span title="${esc(title)}" class="inline-block h-2.5 w-2.5 rounded-full ${COMP_STATUS[status][2]}"></span>`; }
function btn(label, action, extra = '', cls = 'primary') {
  const base = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300',
    secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:text-slate-400',
    danger: 'bg-white text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50 disabled:text-rose-300',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300',
  }[cls];
  return `<button data-action="${action}" ${extra} class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium shadow-sm disabled:cursor-not-allowed ${base}">${label}</button>`;
}
function card(title, body, right = '') {
  return `<section class="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
    <header class="flex items-center justify-between border-b border-slate-100 px-5 py-3"><h3 class="text-sm font-semibold text-slate-800">${title}</h3><div>${right}</div></header>
    <div class="p-5">${body}</div></section>`;
}
function field(label, value) { return `<div><dt class="text-xs uppercase tracking-wide text-slate-500">${label}</dt><dd class="mt-0.5 text-sm text-slate-800">${value}</dd></div>`; }
function input(name, label, value = '', type = 'text', extra = '') {
  return `<label class="block"><span class="text-xs font-medium text-slate-600">${label}</span>
    <input name="${name}" type="${type}" value="${esc(value)}" ${extra} class="mt-1 block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500" /></label>`;
}
function select(name, label, options, value) {
  return `<label class="block"><span class="text-xs font-medium text-slate-600">${label}</span>
    <select name="${name}" class="mt-1 block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
    ${options.map(o => `<option value="${esc(o)}" ${o === value ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
}
function empty(text) { return `<p class="py-8 text-center text-sm text-slate-500">${text}</p>`; }

function toast(msg, kind = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `fixed bottom-5 right-5 z-50 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg transition ${kind === 'error' ? 'bg-rose-600' : 'bg-slate-900'}`;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2800);
}

function openModal(title, bodyHtml, submitLabel, onSubmit) {
  const m = document.getElementById('modal');
  m.innerHTML = `<div class="fixed inset-0 z-40 flex items-start justify-center bg-slate-900/50 p-4 pt-16 overflow-y-auto">
    <form id="modal-form" class="w-full max-w-lg rounded-xl bg-white shadow-xl">
      <header class="flex items-center justify-between border-b border-slate-100 px-5 py-3"><h3 class="text-base font-semibold">${title}</h3>
        <button type="button" data-action="modal-close" class="text-slate-400 hover:text-slate-600">&#10005;</button></header>
      <div class="space-y-3 px-5 py-4">${bodyHtml}</div>
      <footer class="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
        ${btn('Cancel', 'modal-close', 'type="button"', 'secondary')}
        ${submitLabel ? `<button type="submit" class="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">${submitLabel}</button>` : ''}
      </footer></form></div>`;
  m.classList.remove('hidden');
  const form = document.getElementById('modal-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (onSubmit(data, form) !== false) closeModal();
  });
}
function closeModal() { const m = document.getElementById('modal'); m.classList.add('hidden'); m.innerHTML = ''; }

/* ---------- layout ---------- */

const NAV = [
  ['dashboard', 'Dashboard', 'applicants.view', '&#9632;'],
  ['applicants', 'Applicants', 'applicants.view', '&#9679;'],
  ['references', 'References', 'applicants.view', '&#9998;'],
  ['compliance', 'Compliance', 'compliance.view', '&#10003;'],
  ['audit', 'Audit log', 'audit.view', '&#9776;'],
  ['settings', 'Settings', 'settings.manage', '&#9881;'],
];

function layout(route, content) {
  const u = Store.currentUser();
  const alerts = complianceAlerts().length;
  return `<div class="flex min-h-screen">
    <aside class="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div class="flex h-14 items-center gap-2 border-b border-slate-200 px-5">
        <span class="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">TR</span>
        <span class="text-sm font-semibold text-slate-800">Recruitment Portal</span></div>
      <nav class="flex-1 space-y-0.5 p-3">
        ${NAV.filter(n => Store.can(n[2])).map(([key, label, , icon]) => `
          <a href="#/${key}" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${route === key ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}">
            <span class="w-4 text-center text-slate-400">${icon}</span>${label}
            ${key === 'compliance' && alerts ? `<span class="ml-auto rounded-full bg-rose-100 px-2 text-xs font-semibold text-rose-700">${alerts}</span>` : ''}</a>`).join('')}
      </nav>
      <div class="border-t border-slate-200 p-4 text-xs text-slate-500">
        <p class="font-medium text-slate-700">Hosting: UK (London)</p>
        <p class="mt-1">GDPR: retention ${Store.state.settings.retentionMonths} months</p>
        <p class="mt-1">Demo build · data stored locally</p></div>
    </aside>
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
        <div class="flex items-center gap-3 md:hidden"><span class="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">TR</span>
          <select data-action="nav-select" class="rounded-md border-slate-300 text-sm">${NAV.filter(n => Store.can(n[2])).map(([k, l]) => `<option value="${k}" ${route === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="hidden text-sm text-slate-500 md:block">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <div class="flex items-center gap-3">
          <span class="hidden text-right text-xs sm:block"><span class="block font-medium text-slate-800">${u.name}</span><span class="text-slate-500">${u.label}</span></span>
          <span class="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">${u.initials}</span>
          ${btn('Switch role', 'logout', '', 'secondary')}</div>
      </header>
      <main class="flex-1 p-4 md:p-6">${content}</main>
    </div></div>`;
}

function publicLayout(content) {
  return `<div class="min-h-screen bg-slate-50"><header class="border-b border-slate-200 bg-white"><div class="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
    <span class="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">TR</span><span class="text-sm font-semibold">Recruitment Portal · Secure reference form</span></div></header>
    <main class="mx-auto max-w-3xl p-4 md:p-8">${content}</main>
    <footer class="mx-auto max-w-3xl px-4 pb-8 text-xs text-slate-500">This form is served over an encrypted connection and the link is unique to you. Information you provide is processed under UK GDPR for the purpose of employment vetting and retained per the organisation's retention policy.</footer></div>`;
}

/* ---------- derived data ---------- */

function complianceAlerts() {
  const out = [];
  Store.state.applicants.filter(a => a.stage === 'Approved' || a.stage === 'Compliance').forEach(a => {
    [['dbs', 'DBS'], ['rightToWork', 'Right to work'], ['safeguarding', 'Safeguarding']].forEach(([k, label]) => {
      const s = complianceStatus(a.compliance[k]);
      if (s === 'expired' || s === 'expiring') out.push({ applicant: a, item: label, key: k, status: s, expiresAt: a.compliance[k].expiresAt });
    });
  });
  return out.sort((x, y) => new Date(x.expiresAt) - new Date(y.expiresAt));
}
function pendingReferences() {
  const out = [];
  Store.state.applicants.forEach(a => a.references.forEach(r => { if (['requested', 'reminded', 'received'].includes(r.status)) out.push({ applicant: a, ref: r }); }));
  return out;
}

/* ---------- views ---------- */

function viewLogin() {
  return `<div class="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <div class="w-full max-w-md">
      <div class="mb-6 text-center">
        <span class="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">TR</span>
        <h1 class="mt-3 text-xl font-semibold text-slate-900">Tutor Recruitment Portal</h1>
        <p class="mt-1 text-sm text-slate-500">Interactive prototype · choose a role to explore</p></div>
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p class="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Sign in as</p>
        <div class="space-y-2">
          ${Object.entries(ROLES).map(([key, r]) => `
            <button data-action="login" data-role="${key}" class="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-indigo-400 hover:bg-indigo-50">
              <span class="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">${r.initials}</span>
              <span><span class="block text-sm font-medium text-slate-800">${r.name}</span><span class="text-xs text-slate-500">${r.label} · ${r.can.length} permissions</span></span></button>`).join('')}
        </div>
        <p class="mt-4 text-xs text-slate-500">Production build uses email + password with mandatory two-factor authentication, session timeouts and IP logging.</p>
      </div>
      <p class="mt-4 text-center text-xs text-slate-400">All names and records are fictitious. Data is stored only in your browser.</p>
    </div></div>`;
}

function viewDashboard() {
  const A = Store.state.applicants;
  const year = new Date().getFullYear();
  const thisYear = A.filter(a => new Date(a.appliedAt).getFullYear() === year).length;
  const active = A.filter(a => ACTIVE_STAGES.includes(a.stage)).length;
  const approved = A.filter(a => a.stage === 'Approved').length;
  const pendingRefs = pendingReferences();
  const alerts = complianceAlerts();
  const overdue = pendingRefs.filter(x => x.ref.status !== 'received' && daysSince(x.ref.requestedAt) >= 7);
  const max = Math.max(...STAGES.map(s => A.filter(a => a.stage === s).length), 1);

  const tiles = [
    ['Applications this year', thisYear, `target ~250`, 'text-slate-900'],
    ['In pipeline', active, `${approved} approved tutors`, 'text-indigo-700'],
    ['References awaiting', pendingRefs.length, `${overdue.length} overdue (7+ days)`, 'text-amber-700'],
    ['Compliance alerts', alerts.length, `${alerts.filter(a => a.status === 'expired').length} expired`, alerts.length ? 'text-rose-700' : 'text-emerald-700'],
  ];

  return `<h1 class="text-lg font-semibold text-slate-900">Dashboard</h1>
  <div class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    ${tiles.map(([l, v, s, c]) => `<div class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p class="text-xs font-medium uppercase tracking-wide text-slate-500">${l}</p><p class="mt-2 text-3xl font-semibold ${c}">${v}</p><p class="mt-1 text-xs text-slate-500">${s}</p></div>`).join('')}
  </div>
  <div class="mt-6 grid gap-6 lg:grid-cols-3">
    <div class="lg:col-span-2 space-y-6">
      ${card('Recruitment pipeline', `<div class="space-y-2">${STAGES.map(s => { const n = A.filter(a => a.stage === s).length; return `
        <a href="#/applicants?stage=${s}" class="flex items-center gap-3 text-sm hover:bg-slate-50 rounded px-1"><span class="w-24 text-slate-600">${s}</span>
        <span class="flex-1 rounded bg-slate-100"><span class="block h-5 rounded ${s === 'Rejected' || s === 'Withdrawn' ? 'bg-slate-300' : s === 'Approved' ? 'bg-emerald-500' : 'bg-indigo-500'}" style="width:${Math.max(2, n / max * 100)}%"></span></span>
        <span class="w-6 text-right font-medium text-slate-800">${n}</span></a>`; }).join('')}</div>`)}
      ${card('Needs attention', `
        ${overdue.length === 0 && alerts.length === 0 ? empty('Nothing outstanding. Nice.') : ''}
        <ul class="divide-y divide-slate-100">
        ${overdue.slice(0, 4).map(x => `<li class="flex items-center justify-between py-2.5 text-sm"><div><a href="#/applicant/${x.applicant.id}" class="font-medium text-indigo-700 hover:underline">${esc(fullName(x.applicant))}</a><span class="text-slate-500"> · reference from ${esc(x.ref.name)} outstanding ${daysSince(x.ref.requestedAt)} days</span></div>
          ${Store.can('references.manage') ? btn('Send reminder', 'ref-remind', `data-id="${x.applicant.id}" data-ref="${x.ref.id}"`, 'secondary') : ''}</li>`).join('')}
        ${alerts.slice(0, 4).map(x => `<li class="flex items-center justify-between py-2.5 text-sm"><div><a href="#/applicant/${x.applicant.id}" class="font-medium text-indigo-700 hover:underline">${esc(fullName(x.applicant))}</a><span class="text-slate-500"> · ${x.item} ${x.status === 'expired' ? 'expired ' + Math.abs(daysUntil(x.expiresAt)) + ' days ago' : 'expires in ' + daysUntil(x.expiresAt) + ' days'}</span></div>${compBadge(x.status)}</li>`).join('')}
        </ul>`, `<a href="#/compliance" class="text-xs font-medium text-indigo-600 hover:underline">View all</a>`)}
    </div>
    <div class="space-y-6">
      ${card('Recent activity', `<ul class="space-y-3">${Store.state.audit.slice(0, 8).map(e => `<li class="text-sm"><p class="text-slate-800"><span class="font-medium">${esc(e.user)}</span> · ${esc(e.action)}</p><p class="text-xs text-slate-500">${esc(e.target)} · ${fmtDateTime(e.at)}</p></li>`).join('')}</ul>`, Store.can('audit.view') ? `<a href="#/audit" class="text-xs font-medium text-indigo-600 hover:underline">Audit log</a>` : '')}
      ${card('Sources (this year)', `<ul class="space-y-1.5 text-sm">${Object.entries(A.reduce((m, a) => (m[a.source] = (m[a.source] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1]).map(([s, n]) => `<li class="flex justify-between"><span class="text-slate-600">${esc(s)}</span><span class="font-medium">${n}</span></li>`).join('')}</ul>`)}
    </div>
  </div>`;
}

function viewApplicants(params) {
  const q = (params.get('q') || '').toLowerCase();
  const stage = params.get('stage') || '';
  let list = Store.state.applicants.filter(a => (!stage || a.stage === stage) && (!q || fullName(a).toLowerCase().includes(q) || a.email.includes(q) || a.ref.toLowerCase().includes(q) || a.subjects.join(' ').toLowerCase().includes(q)));
  return `<div class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-lg font-semibold text-slate-900">Applicants <span class="text-sm font-normal text-slate-500">${list.length} of ${Store.state.applicants.length}</span></h1>
    <div class="flex flex-wrap gap-2">
      ${Store.can('import') ? btn('Import CSV', 'import-open', '', 'secondary') + btn('Export CSV', 'export-csv', '', 'secondary') : ''}
      ${Store.can('applicants.edit') ? btn('+ New applicant', 'applicant-new') : ''}</div></div>
  <form data-action="applicants-filter" class="mt-4 flex flex-wrap gap-2">
    <input name="q" value="${esc(q)}" placeholder="Search name, email, ref, subject…" class="w-64 rounded-md border-slate-300 text-sm shadow-sm" />
    <select name="stage" class="rounded-md border-slate-300 text-sm shadow-sm"><option value="">All stages</option>${STAGES.map(s => `<option ${s === stage ? 'selected' : ''}>${s}</option>`).join('')}</select>
    <button class="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white">Filter</button>
    ${q || stage ? `<a href="#/applicants" class="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:underline">Clear</a>` : ''}</form>
  <div class="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
    <table class="min-w-full divide-y divide-slate-200 text-sm">
      <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><tr>
        <th class="px-4 py-3">Ref</th><th class="px-4 py-3">Name</th><th class="px-4 py-3">Subjects</th><th class="px-4 py-3">Location</th><th class="px-4 py-3">Applied</th><th class="px-4 py-3">Stage</th><th class="px-4 py-3">Refs</th><th class="px-4 py-3">Compliance</th></tr></thead>
      <tbody class="divide-y divide-slate-100">
      ${list.length === 0 ? `<tr><td colspan="8">${empty('No applicants match.')}</td></tr>` : ''}
      ${list.map(a => { const done = a.references.filter(r => r.status === 'approved').length; const c = a.compliance; return `
        <tr class="cursor-pointer hover:bg-slate-50" data-action="goto" data-href="#/applicant/${a.id}">
          <td class="px-4 py-3 font-mono text-xs text-slate-500">${a.ref}</td>
          <td class="px-4 py-3"><span class="font-medium text-slate-900">${esc(fullName(a))}</span><span class="block text-xs text-slate-500">${esc(a.email)}</span></td>
          <td class="px-4 py-3 text-slate-700">${a.subjects.map(esc).join(', ')}</td>
          <td class="px-4 py-3 text-slate-700">${esc(a.location)}</td>
          <td class="px-4 py-3 text-slate-700">${fmtDate(a.appliedAt)}</td>
          <td class="px-4 py-3">${stageBadge(a.stage)}</td>
          <td class="px-4 py-3 text-slate-700">${done}/${a.references.length}</td>
          <td class="px-4 py-3"><span class="flex gap-1">${dot(complianceStatus(c.dbs), 'DBS')}${dot(complianceStatus(c.rightToWork), 'Right to work')}${dot(complianceStatus(c.safeguarding), 'Safeguarding')}</span></td></tr>`; }).join('')}
      </tbody></table></div>`;
}

function viewApplicant(id) {
  const a = Store.applicant(id);
  if (!a) return empty('Applicant not found.');
  const canEdit = Store.can('applicants.edit'), canRef = Store.can('references.manage'), canComp = Store.can('compliance.edit');
  const history = Store.state.audit.filter(e => e.applicantId === a.id);
  const c = a.compliance;

  const compCard = (key, label, item, rows) => { const s = complianceStatus(item); return `
    <div class="rounded-lg border border-slate-200 p-4"><div class="flex items-center justify-between"><h4 class="text-sm font-semibold text-slate-800">${label}</h4>${compBadge(s)}</div>
    <dl class="mt-3 space-y-2">${rows.map(([l, v]) => field(l, v)).join('')}</dl>
    ${canComp ? `<div class="mt-3">${btn(item.status === 'verified' ? 'Update' : 'Record check', 'comp-edit', `data-id="${a.id}" data-key="${key}"`, 'secondary')}</div>` : ''}</div>`; };

  return `<a href="#/applicants" class="text-sm text-indigo-600 hover:underline">&larr; All applicants</a>
  <div class="mt-2 flex flex-wrap items-start justify-between gap-4">
    <div class="flex items-center gap-4">
      <span class="grid h-14 w-14 place-items-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">${a.firstName[0]}${a.lastName[0]}</span>
      <div><h1 class="text-xl font-semibold text-slate-900">${esc(fullName(a))} <span class="ml-2 font-mono text-xs font-normal text-slate-500">${a.ref}</span></h1>
        <p class="text-sm text-slate-500">${a.subjects.map(esc).join(' · ')} · ${esc(a.location)} · applied ${fmtDate(a.appliedAt)} via ${esc(a.source)}</p></div></div>
    <div class="flex items-center gap-2">
      ${canEdit ? `<select data-action="stage-change" data-id="${a.id}" class="rounded-md border-slate-300 text-sm shadow-sm">${STAGES.map(s => `<option ${s === a.stage ? 'selected' : ''}>${s}</option>`).join('')}</select>` : stageBadge(a.stage)}
      ${canEdit ? btn('Edit', 'applicant-edit', `data-id="${a.id}"`, 'secondary') : ''}
      ${Store.can('settings.manage') ? btn('Erase (GDPR)', 'applicant-erase', `data-id="${a.id}"`, 'danger') : ''}</div></div>

  <div class="mt-4 flex gap-1 overflow-x-auto text-xs">${ACTIVE_STAGES.concat(['Approved']).map((s, i) => { const cur = STAGES.indexOf(a.stage); const done = i < cur || a.stage === 'Approved'; const now = s === a.stage; return `
    <div class="flex-1 min-w-[90px]"><div class="h-1.5 rounded ${done ? 'bg-emerald-500' : now ? 'bg-indigo-500' : 'bg-slate-200'}"></div><p class="mt-1 ${now ? 'font-semibold text-indigo-700' : 'text-slate-500'}">${s}</p></div>`; }).join('')}</div>

  <div class="mt-6 grid gap-6 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      ${card('References <span class="ml-1 text-xs font-normal text-slate-500">' + a.references.filter(r => r.status === 'approved').length + ' of ' + a.references.length + ' approved</span>', `
        <div class="space-y-4">${a.references.map(r => `
          <div class="rounded-lg border border-slate-200 p-4">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div><p class="text-sm font-semibold text-slate-800">${esc(r.name)} <span class="font-normal text-slate-500">· ${esc(r.relationship)}, ${esc(r.organisation)}</span></p><p class="text-xs text-slate-500">${esc(r.email)}</p></div>${refBadge(r.status)}</div>
            <ul class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              ${r.requestedAt ? `<li>Requested ${fmtDate(r.requestedAt)}</li>` : ''}
              ${r.remindersSent ? `<li>${r.remindersSent} reminder${r.remindersSent > 1 ? 's' : ''} · last ${fmtDate(r.lastReminderAt)}</li>` : ''}
              ${r.receivedAt ? `<li>Received ${fmtDate(r.receivedAt)}</li>` : ''}
              ${r.decidedAt ? `<li>Decision ${fmtDate(r.decidedAt)}</li>` : ''}
              ${r.status === 'requested' || r.status === 'reminded' ? `<li class="${daysSince(r.requestedAt) >= 7 ? 'text-amber-700 font-medium' : ''}">Outstanding ${daysSince(r.requestedAt)} days</li>` : ''}</ul>
            ${r.response ? `<div class="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-700">
              <p><span class="font-medium">Known for:</span> ${esc(r.response.knownFor)} · <span class="font-medium">Reliability</span> ${r.response.reliability}/5 · <span class="font-medium">Communication</span> ${r.response.communication}/5 · <span class="font-medium">Subject</span> ${r.response.subjectKnowledge}/5 · <span class="font-medium">Re-employ:</span> ${esc(r.response.reemploy)}</p>
              <p class="mt-1 ${r.response.safeguardingConcern === 'yes' ? 'text-rose-700 font-medium' : ''}"><span class="font-medium">Safeguarding concerns:</span> ${r.response.safeguardingConcern === 'yes' ? 'YES — ' + esc(r.response.safeguardingDetails) : 'None declared'}</p>
              <p class="mt-1 italic">“${esc(r.response.comments)}”</p></div>` : ''}
            ${r.decisionNote ? `<p class="mt-2 text-xs text-slate-600"><span class="font-medium">Note:</span> ${esc(r.decisionNote)}</p>` : ''}
            <div class="mt-3 flex flex-wrap gap-2">
              ${canRef && r.status === 'not_requested' ? btn('Send request email', 'ref-request', `data-id="${a.id}" data-ref="${r.id}"`) : ''}
              ${canRef && (r.status === 'requested' || r.status === 'reminded') ? btn('Send reminder', 'ref-remind', `data-id="${a.id}" data-ref="${r.id}"`, 'secondary') : ''}
              ${r.status !== 'not_requested' && r.status !== 'received' && r.status !== 'approved' && r.status !== 'rejected' ? `<a href="#/reference/${r.token}" target="_blank" class="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50">Open referee form &nearr;</a>` : ''}
              ${canRef && r.status === 'received' ? btn('Approve', 'ref-approve', `data-id="${a.id}" data-ref="${r.id}"`, 'success') + btn('Reject', 'ref-reject', `data-id="${a.id}" data-ref="${r.id}"`, 'danger') : ''}
            </div></div>`).join('')}
        ${a.references.length === 0 ? empty('No referees added yet.') : ''}</div>`,
        canRef && a.references.length < 3 ? btn('+ Add referee', 'ref-add', `data-id="${a.id}"`, 'secondary') : '')}

      ${card('Compliance', `<div class="grid gap-4 md:grid-cols-3">
        ${compCard('dbs', 'Enhanced DBS', c.dbs, [['Certificate no.', c.dbs.certificateNumber ? esc(c.dbs.certificateNumber) : '—'], ['Issued', fmtDate(c.dbs.issuedAt)], ['Expires (3-yr policy)', fmtDate(c.dbs.expiresAt)], ['Update service', c.dbs.updateService ? 'Registered' : 'No']])}
        ${compCard('rightToWork', 'Right to work', c.rightToWork, [['Document', c.rightToWork.docType ? esc(c.rightToWork.docType) : '—'], ['Checked', fmtDate(c.rightToWork.checkedAt)], ['Expires', c.rightToWork.status === 'verified' && !c.rightToWork.expiresAt ? 'No expiry' : fmtDate(c.rightToWork.expiresAt)]])}
        ${compCard('safeguarding', 'Safeguarding training', c.safeguarding, [['Provider', c.safeguarding.provider ? esc(c.safeguarding.provider) : '—'], ['Completed', fmtDate(c.safeguarding.completedAt)], ['Expires', fmtDate(c.safeguarding.expiresAt)]])}
      </div>`)}

      ${card('Documents', c.documents.length === 0 ? empty('No documents uploaded.') : `<ul class="divide-y divide-slate-100">${c.documents.map(d => `
        <li class="flex items-center justify-between py-2.5 text-sm"><div class="flex items-center gap-3"><span class="grid h-8 w-8 place-items-center rounded bg-slate-100 text-xs font-semibold text-slate-600">PDF</span>
          <div><p class="font-medium text-slate-800">${esc(d.name)}</p><p class="text-xs text-slate-500">${esc(d.type)} · ${esc(d.size)} · uploaded ${fmtDate(d.uploadedAt)} by ${esc(d.uploadedBy)}</p></div></div>
          <div class="flex gap-2">${btn('View', 'doc-view', `data-name="${esc(d.name)}"`, 'secondary')}${canComp ? btn('Delete', 'doc-delete', `data-id="${a.id}" data-doc="${d.id}"`, 'danger') : ''}</div></li>`).join('')}</ul>`,
        canComp ? `<label class="inline-flex cursor-pointer items-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50">Upload<input type="file" class="hidden" data-action="doc-upload" data-id="${a.id}" /></label>` : '')}
    </div>
    <div class="space-y-6">
      ${card('Details', `<dl class="space-y-3">${field('Email', esc(a.email))}${field('Phone', esc(a.phone))}${field('Location', esc(a.location))}${field('Source', esc(a.source))}${field('Consent recorded', fmtDate(a.consentAt))}${field('Notes', a.notes ? esc(a.notes) : '<span class="text-slate-400">None</span>')}</dl>`)}
      ${card('Activity', history.length === 0 ? empty('No activity yet.') : `<ol class="space-y-3 border-l border-slate-200 pl-4">${history.slice(0, 12).map(e => `<li class="relative text-sm"><span class="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-slate-300"></span><p class="text-slate-800">${esc(e.action)}</p><p class="text-xs text-slate-500">${esc(e.user)} · ${fmtDateTime(e.at)}${e.details ? ' · ' + esc(e.details) : ''}</p></li>`).join('')}</ol>`)}
    </div></div>`;
}

function viewReferences() {
  const rows = pendingReferences();
  const groups = [['received', 'Received · awaiting your decision'], ['reminded', 'Reminder sent'], ['requested', 'Requested']];
  return `<h1 class="text-lg font-semibold text-slate-900">References <span class="text-sm font-normal text-slate-500">${rows.length} in progress</span></h1>
  <p class="mt-1 text-sm text-slate-500">Automated reminders go out ${Store.state.settings.reminderDays.join(', ')} days after a request if no response. ${Store.state.settings.autoReminders ? 'Auto-reminders are on.' : 'Auto-reminders are off.'}</p>
  <div class="mt-4 space-y-6">${groups.map(([s, label]) => { const g = rows.filter(x => x.ref.status === s); return card(`${label} <span class="ml-1 text-xs font-normal text-slate-500">${g.length}</span>`, g.length === 0 ? empty('None') : `
    <ul class="divide-y divide-slate-100">${g.map(x => `<li class="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
      <div><a href="#/applicant/${x.applicant.id}" class="font-medium text-indigo-700 hover:underline">${esc(fullName(x.applicant))}</a> <span class="text-slate-500">· referee ${esc(x.ref.name)}, ${esc(x.ref.organisation)}</span>
        <p class="text-xs text-slate-500">Requested ${fmtDate(x.ref.requestedAt)}${x.ref.remindersSent ? ` · ${x.ref.remindersSent} reminder(s)` : ''}${x.ref.receivedAt ? ` · received ${fmtDate(x.ref.receivedAt)}` : ` · <span class="${daysSince(x.ref.requestedAt) >= 7 ? 'text-amber-700 font-medium' : ''}">${daysSince(x.ref.requestedAt)} days outstanding</span>`}</p></div>
      <div class="flex gap-2">
        ${Store.can('references.manage') && s !== 'received' ? btn('Send reminder', 'ref-remind', `data-id="${x.applicant.id}" data-ref="${x.ref.id}"`, 'secondary') : ''}
        ${s !== 'received' ? `<a href="#/reference/${x.ref.token}" target="_blank" class="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50">Referee form &nearr;</a>` : ''}
        ${Store.can('references.manage') && s === 'received' ? btn('Review', 'goto', `data-href="#/applicant/${x.applicant.id}"`) : ''}</div></li>`).join('')}</ul>`); }).join('')}</div>`;
}

function viewCompliance(params) {
  const filter = params.get('f') || 'all';
  const people = Store.state.applicants.filter(a => a.stage === 'Approved' || a.stage === 'Compliance');
  const keys = [['dbs', 'DBS'], ['rightToWork', 'Right to work'], ['safeguarding', 'Safeguarding']];
  const rows = people.map(a => ({ a, s: Object.fromEntries(keys.map(([k]) => [k, complianceStatus(a.compliance[k])])) }))
    .filter(r => filter === 'all' || Object.values(r.s).includes(filter))
    .sort((x, y) => { const score = s => Object.values(s).reduce((n, v) => n + ({ expired: 3, expiring: 2, missing: 1, valid: 0 }[v]), 0); return score(y.s) - score(x.s); });
  const counts = { all: people.length, expired: 0, expiring: 0, missing: 0 };
  people.forEach(a => keys.forEach(([k]) => { const s = complianceStatus(a.compliance[k]); if (counts[s] !== undefined) counts[s]++; }));
  return `<div class="flex flex-wrap items-center justify-between gap-3"><h1 class="text-lg font-semibold text-slate-900">Compliance</h1>
    ${Store.can('compliance.edit') ? btn('Email all expiry reminders', 'comp-remind-all', '', 'secondary') : ''}</div>
  <p class="mt-1 text-sm text-slate-500">Alerts trigger ${Store.state.settings.expiryAlertDays} days before expiry. Tutors with expired DBS or safeguarding are automatically flagged as not deployable.</p>
  <div class="mt-4 flex flex-wrap gap-2 text-sm">${[['all', 'All tutors'], ['expired', 'Expired'], ['expiring', 'Expiring soon'], ['missing', 'Missing']].map(([k, l]) => `<a href="#/compliance?f=${k}" class="rounded-full px-3 py-1 ${filter === k ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300'}">${l} <span class="opacity-70">${counts[k]}</span></a>`).join('')}</div>
  <div class="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200"><table class="min-w-full divide-y divide-slate-200 text-sm">
    <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th class="px-4 py-3">Tutor</th><th class="px-4 py-3">Stage</th>${keys.map(([, l]) => `<th class="px-4 py-3">${l}</th>`).join('')}<th class="px-4 py-3">Deployable</th></tr></thead>
    <tbody class="divide-y divide-slate-100">${rows.length === 0 ? `<tr><td colspan="6">${empty('Nothing here.')}</td></tr>` : ''}
    ${rows.map(({ a, s }) => { const deployable = a.stage === 'Approved' && ['valid', 'expiring'].includes(s.dbs) && ['valid', 'expiring'].includes(s.safeguarding) && ['valid', 'expiring'].includes(s.rightToWork); return `
      <tr class="hover:bg-slate-50 cursor-pointer" data-action="goto" data-href="#/applicant/${a.id}"><td class="px-4 py-3"><span class="font-medium text-slate-900">${esc(fullName(a))}</span><span class="block text-xs text-slate-500">${a.ref}</span></td><td class="px-4 py-3">${stageBadge(a.stage)}</td>
      ${keys.map(([k]) => { const it = a.compliance[k]; return `<td class="px-4 py-3">${compBadge(s[k])}<span class="block mt-1 text-xs text-slate-500">${it.status === 'verified' ? (it.expiresAt ? (daysUntil(it.expiresAt) < 0 ? 'expired ' : 'expires ') + fmtDate(it.expiresAt) : 'no expiry') : 'not recorded'}</span></td>`; }).join('')}
      <td class="px-4 py-3">${deployable ? '<span class="text-emerald-700 font-medium">Yes</span>' : '<span class="text-rose-700 font-medium">No</span>'}</td></tr>`; }).join('')}</tbody></table></div>`;
}

function viewAudit(params) {
  const q = (params.get('q') || '').toLowerCase();
  const rows = Store.state.audit.filter(e => !q || [e.user, e.action, e.target, e.details].join(' ').toLowerCase().includes(q));
  return `<div class="flex flex-wrap items-center justify-between gap-3"><h1 class="text-lg font-semibold text-slate-900">Audit log <span class="text-sm font-normal text-slate-500">${rows.length} events</span></h1>${btn('Export CSV', 'export-audit', '', 'secondary')}</div>
  <p class="mt-1 text-sm text-slate-500">Every view, edit, email and download is recorded immutably with user, timestamp and IP. Retained for ${Store.state.settings.retentionMonths} months.</p>
  <form data-action="audit-filter" class="mt-4 flex gap-2"><input name="q" value="${esc(q)}" placeholder="Filter by user, action or person…" class="w-72 rounded-md border-slate-300 text-sm shadow-sm" /><button class="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white">Filter</button></form>
  <div class="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200"><table class="min-w-full divide-y divide-slate-200 text-sm">
    <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th class="px-4 py-3">When</th><th class="px-4 py-3">User</th><th class="px-4 py-3">Action</th><th class="px-4 py-3">Target</th><th class="px-4 py-3">Details</th></tr></thead>
    <tbody class="divide-y divide-slate-100">${rows.slice(0, 200).map(e => `<tr><td class="whitespace-nowrap px-4 py-2.5 text-slate-600">${fmtDateTime(e.at)}</td><td class="px-4 py-2.5 font-medium text-slate-800">${esc(e.user)}</td><td class="px-4 py-2.5 text-slate-800">${esc(e.action)}</td>
      <td class="px-4 py-2.5">${e.applicantId ? `<a href="#/applicant/${e.applicantId}" class="text-indigo-700 hover:underline">${esc(e.target)}</a>` : esc(e.target)}</td><td class="px-4 py-2.5 text-slate-500">${esc(e.details)}</td></tr>`).join('')}</tbody></table></div>`;
}

function viewSettings() {
  const s = Store.state.settings;
  return `<h1 class="text-lg font-semibold text-slate-900">Settings</h1>
  <div class="mt-4 grid gap-6 lg:grid-cols-2">
    ${card('Reference automation', `<form data-action="settings-save" class="space-y-3">
      ${input('reminderDays', 'Reminder schedule (days after request, comma-separated)', s.reminderDays.join(', '))}
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="autoReminders" ${s.autoReminders ? 'checked' : ''} class="rounded border-slate-300 text-indigo-600" /> Send reminders automatically</label>
      ${input('expiryAlertDays', 'Compliance expiry alert (days before)', s.expiryAlertDays, 'number')}
      ${input('retentionMonths', 'Data retention for unsuccessful applicants (months)', s.retentionMonths, 'number')}
      <div class="pt-1"><button class="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">Save settings</button></div></form>`)}
    ${card('Roles & permissions', `<div class="overflow-x-auto"><table class="min-w-full text-xs"><thead><tr><th class="py-1.5 pr-3 text-left font-semibold text-slate-600">Permission</th>${Object.values(ROLES).map(r => `<th class="px-2 py-1.5 text-center font-semibold text-slate-600">${r.label.split(' ')[0]}</th>`).join('')}</tr></thead>
      <tbody class="divide-y divide-slate-100">${Object.entries(PERMISSION_LABELS).map(([p, l]) => `<tr><td class="py-1.5 pr-3 text-slate-700">${l}</td>${Object.values(ROLES).map(r => `<td class="px-2 py-1.5 text-center">${r.can.includes(p) ? '<span class="text-emerald-600">&#10003;</span>' : '<span class="text-slate-300">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="mt-3 text-xs text-slate-500">Production build: invite staff by email, enforce 2FA, and deactivate accounts instantly.</p>`)}
    ${card('Security & hosting', `<dl class="space-y-3">${field('Hosting region', 'United Kingdom (London) · ISO 27001 data centre')}${field('Encryption', 'TLS 1.3 in transit · AES-256 at rest · encrypted daily backups (30-day retention)')}${field('Authentication', 'Email + password, mandatory 2FA, 30-minute idle timeout')}${field('GDPR', 'Consent captured at application · right-to-erasure button on every profile · automatic purge after retention period · data processing register')}${field('Domain', 'Dedicated subdomain, fully independent of the marketing WordPress site')}</dl>`)}
    ${card('Integrations', `<div class="space-y-3">
      <div class="flex items-start justify-between rounded-lg border border-slate-200 p-3"><div><p class="text-sm font-medium text-slate-800">TutorCruncher</p><p class="text-xs text-slate-500">Push approved tutors (profile, subjects, DBS expiry) into TutorCruncher via its REST API once compliance is complete.</p></div>${badge('Planned · phase 2', 'bg-sky-100 text-sky-700')}</div>
      <div class="flex items-start justify-between rounded-lg border border-slate-200 p-3"><div><p class="text-sm font-medium text-slate-800">Transactional email</p><p class="text-xs text-slate-500">Referee requests, reminders and expiry alerts via Postmark or SES (UK region) with delivery tracking.</p></div>${badge('Included', 'bg-emerald-100 text-emerald-800')}</div>
      <div class="flex items-start justify-between rounded-lg border border-slate-200 p-3"><div><p class="text-sm font-medium text-slate-800">DBS Update Service</p><p class="text-xs text-slate-500">Record status checks against the Update Service with date and checker.</p></div>${badge('Included', 'bg-emerald-100 text-emerald-800')}</div></div>`)}
    ${card('Demo', `<p class="text-sm text-slate-600">This prototype stores everything in your browser. Reset to restore the original sample data.</p><div class="mt-3">${btn('Reset demo data', 'reset-demo', '', 'danger')}</div>`)}
  </div>`;
}

function viewReferenceForm(token) {
  const found = Store.findByToken(token);
  if (!found) return publicLayout(`<div class="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"><h1 class="text-lg font-semibold">Link not recognised</h1><p class="mt-2 text-sm text-slate-500">This reference link is invalid or has expired. Please contact the recruitment team.</p></div>`);
  const { applicant, referee } = found;
  if (referee.status === 'not_requested') return publicLayout(`<div class="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"><h1 class="text-lg font-semibold">Not yet requested</h1><p class="mt-2 text-sm text-slate-500">No reference request has been sent to this referee yet.</p></div>`);
  if (referee.response) return publicLayout(`<div class="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"><span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-xl text-emerald-700">&#10003;</span><h1 class="mt-3 text-lg font-semibold">Thank you</h1><p class="mt-2 text-sm text-slate-500">Your reference for ${esc(fullName(applicant))} was received on ${fmtDate(referee.receivedAt)}. This link has now been closed.</p></div>`);
  const rating = (name, label) => `<div><span class="text-xs font-medium text-slate-600">${label}</span><div class="mt-1 flex gap-2">${[1, 2, 3, 4, 5].map(n => `<label class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md ring-1 ring-slate-300 text-sm has-[:checked]:bg-indigo-600 has-[:checked]:text-white has-[:checked]:ring-indigo-600"><input type="radio" name="${name}" value="${n}" class="sr-only" ${n === 4 ? 'checked' : ''} />${n}</label>`).join('')}</div></div>`;
  return publicLayout(`<div class="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
    <div class="border-b border-slate-100 px-6 py-5"><h1 class="text-lg font-semibold text-slate-900">Reference request for ${esc(fullName(applicant))}</h1>
      <p class="mt-1 text-sm text-slate-500">Dear ${esc(referee.name)}, ${esc(fullName(applicant))} has applied for a tutoring role and named you as a referee (${esc(referee.relationship)}, ${esc(referee.organisation)}). This should take about five minutes.</p></div>
    <form data-action="reference-submit" data-token="${token}" class="space-y-5 px-6 py-5">
      <div class="grid gap-4 sm:grid-cols-2">${input('name', 'Your full name', referee.name, 'text', 'required')}${input('capacity', 'Your position / capacity', referee.relationship, 'text', 'required')}
        ${select('knownFor', 'How long have you known the applicant?', ['Less than 1 year', '1-2 years', '2-4 years', '4+ years'], '1-2 years')}
        ${select('reemploy', 'Would you re-employ or recommend them?', ['yes', 'maybe', 'no'], 'yes')}</div>
      <div class="grid gap-4 sm:grid-cols-3">${rating('reliability', 'Reliability & punctuality')}${rating('communication', 'Communication')}${rating('subjectKnowledge', 'Subject knowledge')}</div>
      <fieldset class="rounded-lg border border-amber-200 bg-amber-50 p-4"><legend class="px-1 text-sm font-semibold text-amber-900">Safeguarding</legend>
        <p class="text-sm text-amber-900">Are you aware of any disciplinary action, allegation or concern relating to the applicant's conduct with children or vulnerable adults?</p>
        <div class="mt-2 flex gap-5 text-sm"><label class="flex items-center gap-2"><input type="radio" name="safeguardingConcern" value="no" checked class="text-indigo-600" /> No</label><label class="flex items-center gap-2"><input type="radio" name="safeguardingConcern" value="yes" class="text-indigo-600" /> Yes</label></div>
        <textarea name="safeguardingDetails" rows="2" placeholder="If yes, please give details" class="mt-2 block w-full rounded-md border-slate-300 text-sm"></textarea></fieldset>
      <label class="block"><span class="text-xs font-medium text-slate-600">Further comments</span><textarea name="comments" rows="4" required class="mt-1 block w-full rounded-md border-slate-300 text-sm" placeholder="Strengths, areas for development, suitability for tutoring"></textarea></label>
      <label class="flex items-start gap-2 text-sm text-slate-700"><input type="checkbox" name="declaration" required class="mt-0.5 rounded border-slate-300 text-indigo-600" /> I confirm the information given is accurate to the best of my knowledge and understand it may be shared with the applicant on request under UK GDPR.</label>
      <div class="flex justify-end"><button class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Submit reference</button></div></form></div>`);
}

/* ---------- router ---------- */

function render() {
  const hash = location.hash || '#/dashboard';
  const [path, query] = hash.slice(2).split('?');
  const params = new URLSearchParams(query || '');
  const parts = path.split('/');

  if (parts[0] === 'reference') { $app().innerHTML = viewReferenceForm(parts[1]); window.scrollTo(0, 0); return; }
  if (!Store.state.role) { $app().innerHTML = viewLogin(); return; }

  let route = parts[0], content;
  switch (parts[0]) {
    case 'applicants': content = viewApplicants(params); break;
    case 'applicant': route = 'applicants'; content = viewApplicant(parts[1]); break;
    case 'references': content = viewReferences(); break;
    case 'compliance': content = Store.can('compliance.view') ? viewCompliance(params) : forbidden(); break;
    case 'audit': content = Store.can('audit.view') ? viewAudit(params) : forbidden(); break;
    case 'settings': content = Store.can('settings.manage') ? viewSettings() : forbidden(); break;
    default: route = 'dashboard'; content = viewDashboard();
  }
  $app().innerHTML = layout(route, content);
  window.scrollTo(0, 0);
}
function forbidden() { return `<div class="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200"><h1 class="text-lg font-semibold text-slate-900">Access denied</h1><p class="mt-2 text-sm text-slate-500">Your role does not include this permission. This attempt has been recorded in the audit log.</p></div>`; }

/* ---------- actions ---------- */

function downloadCsv(filename, rows) {
  const csv = rows.map(r => r.map(v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = filename; a.click();
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
  return lines.slice(1).map(l => { const cells = l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map(c => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"')); const o = {}; headers.forEach((h, i) => o[h] = (cells[i] || '').trim()); return o; });
}

function newApplicantFrom(d) {
  const first = d.firstname || d.first || '', last = d.lastname || d.last || d.surname || '';
  return { id: uid(), ref: `APP-${new Date().getFullYear()}-${String(Store.state.applicants.length + 1).padStart(3, '0')}`, firstName: first, lastName: last, email: d.email || '', phone: d.phone || '', subjects: (d.subjects || '').split(/[;|/]/).map(s => s.trim()).filter(Boolean), location: d.location || '', source: d.source || 'CSV import', appliedAt: new Date().toISOString(), stage: 'Applied', notes: d.notes || '', consentAt: new Date().toISOString(), references: [], compliance: { dbs: { status: 'missing', certificateNumber: '', issuedAt: null, expiresAt: null, updateService: false }, rightToWork: { status: 'missing', docType: '', checkedAt: null, expiresAt: null }, safeguarding: { status: 'missing', provider: '', completedAt: null, expiresAt: null }, documents: [] } };
}

const actions = {
  login(el) { Store.state.role = el.dataset.role; Store.save(); Store.audit('User signed in', ROLES[el.dataset.role].name, 'Demo session'); location.hash = '#/dashboard'; render(); },
  logout() { Store.state.role = null; Store.save(); render(); },
  goto(el) { location.hash = el.dataset.href; },
  'nav-select'(el) { location.hash = '#/' + el.value; },
  'modal-close'() { closeModal(); },
  'reset-demo'() { if (confirm('Reset all demo data to the original sample?')) { Store.reset(); toast('Demo data reset'); render(); } },

  'applicants-filter'(form) { const d = new FormData(form); location.hash = `#/applicants?q=${encodeURIComponent(d.get('q'))}&stage=${encodeURIComponent(d.get('stage'))}`; },
  'audit-filter'(form) { location.hash = `#/audit?q=${encodeURIComponent(new FormData(form).get('q'))}`; },

  'applicant-new'() {
    openModal('New applicant', `<div class="grid gap-3 sm:grid-cols-2">${input('firstname', 'First name', '', 'text', 'required')}${input('lastname', 'Last name', '', 'text', 'required')}${input('email', 'Email', '', 'email', 'required')}${input('phone', 'Phone')}${input('subjects', 'Subjects (separate with ;)', '')}${input('location', 'Location')}${select('source', 'Source', SOURCES, 'Website')}</div>`, 'Create applicant', d => {
      const a = newApplicantFrom(d); Store.state.applicants.unshift(a); Store.save(); Store.audit('Applicant created', fullName(a), 'Manual entry', a.id); toast('Applicant created'); location.hash = '#/applicant/' + a.id;
    });
  },
  'applicant-edit'(el) {
    const a = Store.applicant(el.dataset.id);
    openModal('Edit applicant', `<div class="grid gap-3 sm:grid-cols-2">${input('firstName', 'First name', a.firstName, 'text', 'required')}${input('lastName', 'Last name', a.lastName, 'text', 'required')}${input('email', 'Email', a.email, 'email')}${input('phone', 'Phone', a.phone)}${input('subjects', 'Subjects (separate with ;)', a.subjects.join('; '))}${input('location', 'Location', a.location)}</div><label class="block"><span class="text-xs font-medium text-slate-600">Notes</span><textarea name="notes" rows="3" class="mt-1 block w-full rounded-md border-slate-300 text-sm">${esc(a.notes)}</textarea></label>`, 'Save', d => {
      Object.assign(a, { firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone, location: d.location, notes: d.notes, subjects: d.subjects.split(';').map(s => s.trim()).filter(Boolean) });
      Store.save(); Store.audit('Applicant updated', fullName(a), 'Profile details', a.id); toast('Saved'); render();
    });
  },
  'applicant-erase'(el) {
    const a = Store.applicant(el.dataset.id);
    if (!confirm(`Erase all personal data for ${fullName(a)}? An anonymised audit record will be kept. This cannot be undone.`)) return;
    Store.state.applicants = Store.state.applicants.filter(x => x.id !== a.id);
    Store.state.audit.forEach(e => { if (e.applicantId === a.id) { e.target = `[erased ${a.ref}]`; e.applicantId = null; } });
    Store.save(); Store.audit('Personal data erased (GDPR)', `[erased ${a.ref}]`, 'Right to erasure request'); toast('Personal data erased'); location.hash = '#/applicants';
  },
  'stage-change'(el) {
    const a = Store.applicant(el.dataset.id); const from = a.stage; a.stage = el.value; Store.save();
    Store.audit('Stage changed', fullName(a), `${from} → ${a.stage}`, a.id);
    if (a.stage === 'References' && Store.state.settings.autoReminders) toast('Stage updated. Referee requests can now be sent.'); else toast('Stage updated');
    render();
  },

  'ref-add'(el) {
    const a = Store.applicant(el.dataset.id);
    openModal('Add referee', `${input('name', 'Referee name', '', 'text', 'required')}${input('email', 'Referee email', '', 'email', 'required')}${input('organisation', 'Organisation', '', 'text', 'required')}${input('relationship', 'Relationship / position', '', 'text', 'required')}`, 'Add referee', d => {
      a.references.push({ id: uid(), token: uid() + uid(), name: d.name, email: d.email, organisation: d.organisation, relationship: d.relationship, status: 'not_requested', requestedAt: null, remindersSent: 0, lastReminderAt: null, receivedAt: null, decidedAt: null, decisionNote: '', response: null });
      Store.save(); Store.audit('Referee added', fullName(a), d.name, a.id); toast('Referee added'); render();
    });
  },
  'ref-request'(el) {
    const a = Store.applicant(el.dataset.id); const r = a.references.find(x => x.id === el.dataset.ref);
    r.status = 'requested'; r.requestedAt = new Date().toISOString(); Store.save();
    Store.audit('Reference request emailed', fullName(a), `To ${r.name} <${r.email}> · secure link, expires in 30 days`, a.id); toast(`Request emailed to ${r.name}`); render();
  },
  'ref-remind'(el) {
    const a = Store.applicant(el.dataset.id); const r = a.references.find(x => x.id === el.dataset.ref);
    r.status = 'reminded'; r.remindersSent++; r.lastReminderAt = new Date().toISOString(); Store.save();
    Store.audit('Reminder email sent', fullName(a), `Referee ${r.name} · reminder #${r.remindersSent}`, a.id); toast(`Reminder sent to ${r.name}`); render();
  },
  'ref-approve'(el) {
    const a = Store.applicant(el.dataset.id); const r = a.references.find(x => x.id === el.dataset.ref);
    r.status = 'approved'; r.decidedAt = new Date().toISOString(); Store.save();
    Store.audit('Reference approved', fullName(a), `Referee ${r.name}`, a.id);
    const allDone = a.references.length >= 2 && a.references.every(x => x.status === 'approved');
    toast(allDone ? 'Reference approved. All references complete — ready for compliance.' : 'Reference approved'); render();
  },
  'ref-reject'(el) {
    const a = Store.applicant(el.dataset.id); const r = a.references.find(x => x.id === el.dataset.ref);
    openModal('Reject reference', `<p class="text-sm text-slate-600">Rejecting the reference from <strong>${esc(r.name)}</strong>. The applicant will be flagged for review.</p><label class="block"><span class="text-xs font-medium text-slate-600">Reason (recorded in audit log)</span><textarea name="note" rows="3" required class="mt-1 block w-full rounded-md border-slate-300 text-sm"></textarea></label>`, 'Reject reference', d => {
      r.status = 'rejected'; r.decidedAt = new Date().toISOString(); r.decisionNote = d.note; Store.save();
      Store.audit('Reference rejected', fullName(a), `Referee ${r.name} · ${d.note}`, a.id); toast('Reference rejected', 'error'); render();
    });
  },
  'reference-submit'(form) {
    const found = Store.findByToken(form.dataset.token); if (!found) return;
    const d = Object.fromEntries(new FormData(form).entries());
    const { applicant, referee } = found;
    referee.response = { knownFor: d.knownFor, capacity: d.capacity, reliability: +d.reliability, communication: +d.communication, subjectKnowledge: +d.subjectKnowledge, safeguardingConcern: d.safeguardingConcern, safeguardingDetails: d.safeguardingDetails || '', reemploy: d.reemploy, comments: d.comments, declaration: true };
    referee.name = d.name; referee.status = 'received'; referee.receivedAt = new Date().toISOString(); Store.save();
    Store.state.audit.unshift({ id: uid(), at: new Date().toISOString(), user: 'Referee portal', action: 'Reference received', target: fullName(applicant), applicantId: applicant.id, details: `From ${referee.name}${d.safeguardingConcern === 'yes' ? ' · SAFEGUARDING CONCERN FLAGGED' : ''}` });
    Store.save(); render();
  },

  'comp-edit'(el) {
    const a = Store.applicant(el.dataset.id); const key = el.dataset.key; const it = a.compliance[key];
    const today = new Date().toISOString().slice(0, 10);
    const dateVal = iso => iso ? iso.slice(0, 10) : '';
    let body, label;
    if (key === 'dbs') { label = 'Enhanced DBS check'; body = `${input('certificateNumber', 'Certificate number', it.certificateNumber, 'text', 'required pattern="[0-9]{12}" title="12 digits"')}${input('issuedAt', 'Issue date', dateVal(it.issuedAt) || today, 'date', 'required')}<label class="flex items-center gap-2 text-sm"><input type="checkbox" name="updateService" ${it.updateService ? 'checked' : ''} class="rounded border-slate-300 text-indigo-600" /> Registered with DBS Update Service</label><p class="text-xs text-slate-500">Expiry is set automatically to 3 years from issue, per policy.</p>`; }
    else if (key === 'rightToWork') { label = 'Right to work check'; body = `${select('docType', 'Document type', RTW_DOCS, it.docType || RTW_DOCS[0])}${input('checkedAt', 'Date checked', dateVal(it.checkedAt) || today, 'date', 'required')}${input('expiresAt', 'Permission expiry (leave blank if none)', dateVal(it.expiresAt), 'date')}`; }
    else { label = 'Safeguarding training'; body = `${input('provider', 'Training provider', it.provider, 'text', 'required')}${input('completedAt', 'Completed on', dateVal(it.completedAt) || today, 'date', 'required')}<p class="text-xs text-slate-500">Expiry is set automatically to 3 years from completion.</p>`; }
    openModal(label, body + `<label class="block"><span class="text-xs font-medium text-slate-600">Attach evidence (PDF/JPG)</span><input type="file" name="file" class="mt-1 block w-full text-sm" /></label>`, 'Save as verified', (d, form) => {
      const plus3 = iso => { const x = new Date(iso); x.setFullYear(x.getFullYear() + 3); return x.toISOString(); };
      if (key === 'dbs') Object.assign(it, { status: 'verified', certificateNumber: d.certificateNumber, issuedAt: new Date(d.issuedAt).toISOString(), expiresAt: plus3(d.issuedAt), updateService: !!d.updateService });
      else if (key === 'rightToWork') Object.assign(it, { status: 'verified', docType: d.docType, checkedAt: new Date(d.checkedAt).toISOString(), expiresAt: d.expiresAt ? new Date(d.expiresAt).toISOString() : null });
      else Object.assign(it, { status: 'verified', provider: d.provider, completedAt: new Date(d.completedAt).toISOString(), expiresAt: plus3(d.completedAt) });
      const f = form.querySelector('input[type=file]').files[0];
      if (f) a.compliance.documents.unshift({ id: uid(), name: f.name, type: { dbs: 'DBS', rightToWork: 'Right to work', safeguarding: 'Safeguarding' }[key], size: Math.round(f.size / 1024) + ' KB', uploadedAt: new Date().toISOString(), uploadedBy: Store.currentUser().name });
      Store.save(); Store.audit('Compliance updated', fullName(a), `${label} verified`, a.id); toast(`${label} saved`); render();
    });
  },
  'comp-remind-all'() {
    const alerts = complianceAlerts();
    alerts.forEach(x => Store.audit('Expiry reminder emailed', fullName(x.applicant), `${x.item} ${x.status} · ${fmtDate(x.expiresAt)}`, x.applicant.id));
    toast(`${alerts.length} expiry reminder${alerts.length === 1 ? '' : 's'} emailed`); render();
  },
  'doc-upload'(el) {
    const a = Store.applicant(el.dataset.id); const f = el.files[0]; if (!f) return;
    a.compliance.documents.unshift({ id: uid(), name: f.name, type: 'Other', size: Math.round(f.size / 1024) + ' KB', uploadedAt: new Date().toISOString(), uploadedBy: Store.currentUser().name });
    Store.save(); Store.audit('Document uploaded', fullName(a), f.name, a.id); toast('Uploaded (demo: file name only)'); render();
  },
  'doc-view'(el) { toast(`Production build streams ${el.dataset.name} from encrypted UK storage via a 5-minute signed URL.`); },
  'doc-delete'(el) {
    const a = Store.applicant(el.dataset.id); const d = a.compliance.documents.find(x => x.id === el.dataset.doc);
    if (!confirm(`Delete ${d.name}?`)) return;
    a.compliance.documents = a.compliance.documents.filter(x => x.id !== d.id); Store.save(); Store.audit('Document deleted', fullName(a), d.name, a.id); toast('Document deleted'); render();
  },

  'import-open'() {
    openModal('Import applicants from CSV', `<p class="text-sm text-slate-600">Columns: <code class="rounded bg-slate-100 px-1">first_name, last_name, email, phone, subjects, location, source</code>. Duplicate emails are skipped.</p>
      <label class="block"><span class="text-xs font-medium text-slate-600">CSV file</span><input type="file" name="file" accept=".csv,text/csv" class="mt-1 block w-full text-sm" /></label>
      <label class="block"><span class="text-xs font-medium text-slate-600">…or paste CSV</span><textarea name="text" rows="5" class="mt-1 block w-full rounded-md border-slate-300 font-mono text-xs" placeholder="first_name,last_name,email,phone,subjects,location,source
Sam,Taylor,sam.taylor@example.com,07700900123,GCSE Maths;A-Level Physics,Leeds,Indeed"></textarea></label>
      <button type="button" data-action="import-sample" class="text-xs font-medium text-indigo-600 hover:underline">Download sample CSV</button>`, 'Import', (d, form) => {
      const file = form.querySelector('input[type=file]').files[0];
      const run = text => {
        const rows = parseCsv(text); let added = 0, skipped = 0;
        rows.forEach(r => { const a = newApplicantFrom(r); if (!a.email || !a.firstName || Store.state.applicants.some(x => x.email.toLowerCase() === a.email.toLowerCase())) { skipped++; return; } Store.state.applicants.unshift(a); added++; });
        Store.save(); Store.audit('CSV import', `${added} applicants`, `${added} added, ${skipped} skipped${file ? ' · ' + file.name : ''}`);
        toast(`Imported ${added}, skipped ${skipped}`); render();
      };
      if (file) { file.text().then(run); } else if (d.text && d.text.trim()) { run(d.text); } else { toast('Choose a file or paste CSV', 'error'); return false; }
    });
  },
  'import-sample'() { downloadCsv('sample_applicants.csv', [['first_name', 'last_name', 'email', 'phone', 'subjects', 'location', 'source'], ['Sam', 'Taylor', 'sam.taylor@example.com', '07700900123', 'GCSE Maths;A-Level Physics', 'Leeds', 'Indeed'], ['Nina', 'Adeyemi', 'nina.adeyemi@example.com', '07700900456', 'Primary (KS1/KS2)', 'Croydon', 'Website']]); },
  'export-csv'() {
    downloadCsv(`applicants_${new Date().toISOString().slice(0, 10)}.csv`, [['Ref', 'First name', 'Last name', 'Email', 'Phone', 'Subjects', 'Location', 'Source', 'Applied', 'Stage', 'References approved', 'DBS', 'Right to work', 'Safeguarding']].concat(Store.state.applicants.map(a => [a.ref, a.firstName, a.lastName, a.email, a.phone, a.subjects.join('; '), a.location, a.source, fmtDate(a.appliedAt), a.stage, a.references.filter(r => r.status === 'approved').length, complianceStatus(a.compliance.dbs), complianceStatus(a.compliance.rightToWork), complianceStatus(a.compliance.safeguarding)])));
    Store.audit('CSV export', `${Store.state.applicants.length} applicants`, 'Full applicant list'); toast('Export downloaded');
  },
  'export-audit'() { downloadCsv('audit_log.csv', [['When', 'User', 'Action', 'Target', 'Details']].concat(Store.state.audit.map(e => [e.at, e.user, e.action, e.target, e.details]))); toast('Audit log downloaded'); },

  'settings-save'(form) {
    const d = Object.fromEntries(new FormData(form).entries()); const s = Store.state.settings;
    s.reminderDays = d.reminderDays.split(',').map(x => parseInt(x, 10)).filter(n => n > 0); s.autoReminders = !!d.autoReminders; s.expiryAlertDays = parseInt(d.expiryAlertDays, 10) || 30; s.retentionMonths = parseInt(d.retentionMonths, 10) || 24;
    Store.save(); Store.audit('Settings changed', 'Reference & compliance settings', `Reminders ${s.reminderDays.join('/')}d · alerts ${s.expiryAlertDays}d · retention ${s.retentionMonths}m`); toast('Settings saved'); render();
  },
};

/* ---------- wiring ---------- */

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.tagName === 'FORM' || el.tagName === 'SELECT' || el.tagName === 'INPUT') return;
  const fn = actions[el.dataset.action];
  if (fn) { e.preventDefault(); fn(el); }
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-action]');
  if (!el || (el.tagName !== 'SELECT' && el.tagName !== 'INPUT')) return;
  const fn = actions[el.dataset.action]; if (fn) fn(el);
});
document.addEventListener('submit', e => {
  const form = e.target.closest('form[data-action]'); if (!form) return;
  e.preventDefault(); const fn = actions[form.dataset.action]; if (fn) fn(form);
});
window.addEventListener('hashchange', render);
Store.load();
render();

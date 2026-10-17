/* Tutor Recruitment Portal - demo data layer.
   All data is fictitious and lives only in the browser (localStorage). */

const STORAGE_KEY = 'trp-demo-v1';
const TODAY = new Date();

const STAGES = ['Applied', 'Screening', 'Interview', 'References', 'Compliance', 'Approved', 'Rejected', 'Withdrawn'];
const ACTIVE_STAGES = ['Applied', 'Screening', 'Interview', 'References', 'Compliance'];

const ROLES = {
  admin: { label: 'Administrator', initials: 'AD', name: 'Alex Dawson', can: ['applicants.view', 'applicants.edit', 'references.manage', 'compliance.view', 'compliance.edit', 'audit.view', 'settings.manage', 'import'] },
  recruiter: { label: 'Recruiter', initials: 'PR', name: 'Priya Raman', can: ['applicants.view', 'applicants.edit', 'references.manage', 'compliance.view', 'import'] },
  compliance: { label: 'Compliance Officer', initials: 'MO', name: 'Martin Okafor', can: ['applicants.view', 'compliance.view', 'compliance.edit', 'audit.view'] },
  viewer: { label: 'Viewer (read-only)', initials: 'JV', name: 'Jo Vickers', can: ['applicants.view', 'compliance.view'] },
};

const PERMISSION_LABELS = {
  'applicants.view': 'View applicants',
  'applicants.edit': 'Edit applicants & stages',
  'references.manage': 'Request, approve & reject references',
  'compliance.view': 'View compliance records',
  'compliance.edit': 'Edit compliance & documents',
  'audit.view': 'View audit log',
  'settings.manage': 'Manage settings & users',
  'import': 'Import / export CSV',
};

/* ---------- helpers ---------- */

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
function daysFromToday(n) { const d = new Date(TODAY); d.setDate(d.getDate() + n); d.setHours(9, 0, 0, 0); return d.toISOString(); }
function uid() { return Math.random().toString(36).slice(2, 10); }

/* ---------- seed ---------- */

const FIRST = ['Amelia', 'Oliver', 'Fatima', 'James', 'Priya', 'Thomas', 'Aisha', 'Daniel', 'Chloe', 'Mohammed', 'Sophie', 'Kwame', 'Hannah', 'Ravi', 'Grace', 'Liam', 'Zara', 'Ben', 'Yusuf', 'Ella', 'Noah', 'Mei', 'Jack', 'Nadia', 'Ethan', 'Leila', 'Harry', 'Simran', 'Isla', 'Tomasz', 'Freya', 'Arjun', 'Lucy', 'Samuel', 'Imogen', 'Omar', 'Rosie', 'Kofi', 'Maya', 'Callum', 'Anya', 'Ibrahim', 'Megan', 'Dev', 'Holly', 'Marcus', 'Eleanor'];
const LAST = ['Khan', 'Smith', 'Patel', 'Williams', 'Ahmed', 'Brown', 'Okafor', 'Taylor', 'Hussain', 'Davies', 'Begum', 'Wilson', 'Mensah', 'Evans', 'Shah', 'Thomas', 'Chowdhury', 'Roberts', 'Osei', 'Walker', 'Kaur', 'Wright', 'Nowak', 'Green', 'Ali', 'Hall', 'Rahman', 'Clarke', 'Singh', 'Lewis'];
const SUBJECTS = ['GCSE Maths', 'A-Level Maths', 'GCSE English', 'A-Level English Lit', 'KS2 Maths & English', '11+ Preparation', 'GCSE Science', 'A-Level Chemistry', 'A-Level Physics', 'A-Level Biology', 'Primary (KS1/KS2)', 'SEN Support', 'GCSE History', 'Spanish', 'French', 'Computer Science'];
const LOCATIONS = ['Croydon', 'Harrow', 'Ilford', 'Wembley', 'Birmingham', 'Manchester', 'Leeds', 'Bristol', 'Reading', 'Luton', 'Online only', 'Southall', 'Leicester', 'Nottingham'];
const SOURCES = ['Indeed', 'Website', 'Referral', 'LinkedIn', 'Tutor Hunt', 'University careers'];
const ORGS = ['Oak Hill Academy', 'St. Mary\'s Primary', 'Bright Minds Tuition', 'Kings College London', 'Greenfield High School', 'Riverside Learning Centre', 'University of Manchester', 'Explore Learning', 'Hillside Secondary', 'Northgate Tutoring'];
const REF_ROLES = ['Head of Department', 'Line Manager', 'Headteacher', 'Centre Manager', 'Academic Supervisor', 'Deputy Head', 'Course Director'];
const RTW_DOCS = ['British passport', 'Irish passport', 'Share code (eVisa)', 'Biometric residence permit', 'Birth certificate + NI proof'];

function makeReferee(r, index) {
  const name = `${pick(r, FIRST)} ${pick(r, LAST)}`;
  return {
    id: uid(),
    token: uid() + uid(),
    name,
    organisation: pick(r, ORGS),
    relationship: pick(r, REF_ROLES),
    email: name.toLowerCase().replace(/[^a-z ]/g, '').replace(' ', '.') + '@example.org',
    status: 'not_requested',
    requestedAt: null,
    remindersSent: 0,
    lastReminderAt: null,
    receivedAt: null,
    decidedAt: null,
    decisionNote: '',
    response: null,
  };
}

function fakeResponse(r, referee, concern) {
  return {
    knownFor: pick(r, ['1-2 years', '2-4 years', '4+ years']),
    capacity: referee.relationship,
    reliability: 3 + Math.floor(r() * 3),
    communication: 3 + Math.floor(r() * 3),
    subjectKnowledge: 4 + Math.floor(r() * 2),
    safeguardingConcern: concern ? 'yes' : 'no',
    safeguardingDetails: concern ? 'A complaint was raised in 2024 regarding lateness to safeguarding training; resolved after retraining.' : '',
    reemploy: concern ? 'maybe' : 'yes',
    comments: pick(r, [
      'Excellent with students who lack confidence. Reliable and well prepared.',
      'Consistently professional. Parents regularly requested them by name.',
      'Strong subject knowledge and a calm manner with teenagers.',
      'Punctual, organised and very good at explaining difficult topics simply.',
      'Would happily work with them again. Highly recommended.',
    ]),
    declaration: true,
  };
}

function seedApplicants() {
  const r = rng(20260917);
  const plan = [
    ['Approved', 14], ['Compliance', 4], ['References', 7], ['Interview', 5],
    ['Screening', 6], ['Applied', 5], ['Rejected', 4], ['Withdrawn', 2],
  ];
  const applicants = [];
  const audit = [];
  let seq = 1;

  plan.forEach(([stage, count]) => {
    for (let i = 0; i < count; i++) {
      const id = uid();
      const first = pick(r, FIRST), last = pick(r, LAST);
      const appliedDays = -Math.floor(r() * 280 + 2);
      const subjects = [pick(r, SUBJECTS)];
      if (r() > 0.5) { const s = pick(r, SUBJECTS); if (!subjects.includes(s)) subjects.push(s); }
      const refs = [makeReferee(r, 0), makeReferee(r, 1)];
      const idx = STAGES.indexOf(stage);
      const dbs = { status: 'missing', certificateNumber: '', issuedAt: null, expiresAt: null, updateService: false };
      const rtw = { status: 'missing', docType: '', checkedAt: null, expiresAt: null };
      const safeguarding = { status: 'missing', provider: '', completedAt: null, expiresAt: null };
      const documents = [];

      if (idx >= 3 || stage === 'Rejected') {
        refs.forEach((ref, k) => {
          if (stage === 'References') {
            const s = pick(r, ['requested', 'requested', 'reminded', 'received', 'not_requested']);
            ref.status = s;
            if (s !== 'not_requested') { ref.requestedAt = daysFromToday(-Math.floor(r() * 14 + 1)); }
            if (s === 'reminded') { ref.remindersSent = 1 + Math.floor(r() * 2); ref.lastReminderAt = daysFromToday(-Math.floor(r() * 4 + 1)); }
            if (s === 'received') { ref.receivedAt = daysFromToday(-Math.floor(r() * 3)); ref.response = fakeResponse(r, ref, r() > 0.85); }
          } else if (stage === 'Compliance') {
            ref.status = k === 0 ? 'approved' : pick(r, ['approved', 'received']);
            ref.requestedAt = daysFromToday(-Math.floor(r() * 30 + 10));
            ref.receivedAt = daysFromToday(-Math.floor(r() * 8 + 2));
            ref.response = fakeResponse(r, ref, false);
            if (ref.status === 'approved') ref.decidedAt = daysFromToday(-Math.floor(r() * 2));
          } else if (stage === 'Approved') {
            ref.status = 'approved';
            ref.requestedAt = daysFromToday(appliedDays + 20);
            ref.receivedAt = daysFromToday(appliedDays + 26);
            ref.decidedAt = daysFromToday(appliedDays + 27);
            ref.response = fakeResponse(r, ref, false);
          } else if (stage === 'Rejected' && k === 0) {
            ref.status = 'rejected';
            ref.requestedAt = daysFromToday(appliedDays + 15);
            ref.receivedAt = daysFromToday(appliedDays + 22);
            ref.decidedAt = daysFromToday(appliedDays + 23);
            ref.response = fakeResponse(r, ref, true);
            ref.decisionNote = 'Safeguarding concern raised by referee; not progressed.';
          }
        });
      }

      if (stage === 'Approved' || stage === 'Compliance') {
        const dbsOffset = pick(r, [400, 700, 900, 25, 12, -10, 60, 300, 1000, 45]);
        if (stage === 'Approved' || r() > 0.4) {
          dbs.status = 'verified';
          dbs.certificateNumber = String(1000000000 + Math.floor(r() * 899999999));
          dbs.expiresAt = daysFromToday(dbsOffset);
          dbs.issuedAt = daysFromToday(dbsOffset - 1095);
          dbs.updateService = r() > 0.4;
          documents.push({ id: uid(), name: 'DBS_certificate.pdf', type: 'DBS', size: '212 KB', uploadedAt: dbs.issuedAt, uploadedBy: 'Martin Okafor' });
        }
        if (stage === 'Approved' || r() > 0.5) {
          rtw.status = 'verified';
          rtw.docType = pick(r, RTW_DOCS);
          rtw.checkedAt = daysFromToday(appliedDays + 30);
          rtw.expiresAt = rtw.docType.includes('passport') || rtw.docType.includes('Birth') ? null : daysFromToday(pick(r, [200, 500, 20, 800]));
          documents.push({ id: uid(), name: 'Right_to_work.pdf', type: 'Right to work', size: '1.4 MB', uploadedAt: rtw.checkedAt, uploadedBy: 'Martin Okafor' });
        }
        if (stage === 'Approved' || r() > 0.6) {
          safeguarding.status = 'verified';
          safeguarding.provider = pick(r, ['NSPCC Learning', 'EduCare', 'High Speed Training', 'Local Authority']);
          const sgOffset = pick(r, [300, 600, 18, 90, -5, 450]);
          safeguarding.expiresAt = daysFromToday(sgOffset);
          safeguarding.completedAt = daysFromToday(sgOffset - 1095);
          documents.push({ id: uid(), name: 'Safeguarding_certificate.pdf', type: 'Safeguarding', size: '98 KB', uploadedAt: safeguarding.completedAt, uploadedBy: 'Martin Okafor' });
        }
        documents.push({ id: uid(), name: 'CV_' + last + '.pdf', type: 'CV', size: '340 KB', uploadedAt: daysFromToday(appliedDays), uploadedBy: 'Applicant' });
      }

      const ref = `APP-2026-${String(seq++).padStart(3, '0')}`;
      applicants.push({
        id, ref, firstName: first, lastName: last,
        email: `${first}.${last}${Math.floor(r() * 90 + 10)}@example.com`.toLowerCase(),
        phone: `07${Math.floor(r() * 900000000 + 100000000)}`,
        subjects, location: pick(r, LOCATIONS), source: pick(r, SOURCES),
        appliedAt: daysFromToday(appliedDays),
        stage,
        notes: stage === 'Interview' ? 'Interview booked. Bring ID for right-to-work check.' : '',
        consentAt: daysFromToday(appliedDays),
        references: refs,
        compliance: { dbs, rightToWork: rtw, safeguarding, documents },
      });
      audit.push({ id: uid(), at: daysFromToday(appliedDays), user: 'System', action: 'Application received', target: `${first} ${last}`, applicantId: id, details: `Source: ${applicants[applicants.length - 1].source}` });
    }
  });

  audit.push({ id: uid(), at: daysFromToday(-1), user: 'Priya Raman', action: 'Stage changed', target: applicants[20].firstName + ' ' + applicants[20].lastName, applicantId: applicants[20].id, details: 'Interview → References' });
  audit.push({ id: uid(), at: daysFromToday(-1), user: 'System', action: 'Reminder email sent', target: applicants[19].firstName + ' ' + applicants[19].lastName, applicantId: applicants[19].id, details: 'Referee reminder (day 7)' });
  audit.push({ id: uid(), at: daysFromToday(-2), user: 'Martin Okafor', action: 'Compliance updated', target: applicants[2].firstName + ' ' + applicants[2].lastName, applicantId: applicants[2].id, details: 'DBS certificate verified' });
  audit.push({ id: uid(), at: daysFromToday(-3), user: 'Alex Dawson', action: 'User signed in', target: 'Alex Dawson', applicantId: null, details: 'IP 81.xx.xx.xx (UK)' });
  audit.push({ id: uid(), at: daysFromToday(-3), user: 'Alex Dawson', action: 'CSV import', target: '12 applicants', applicantId: null, details: 'indeed_export_sep.csv' });

  audit.sort((a, b) => new Date(b.at) - new Date(a.at));
  applicants.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  return { applicants, audit };
}

function defaultState() {
  const { applicants, audit } = seedApplicants();
  return {
    version: 1,
    role: null,
    applicants,
    audit,
    settings: {
      reminderDays: [3, 7, 14],
      autoReminders: true,
      expiryAlertDays: 30,
      retentionMonths: 24,
      orgName: 'Tutor Recruitment Portal',
      region: 'UK (London)',
    },
  };
}

/* ---------- store ---------- */

const Store = {
  state: null,
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { this.state = JSON.parse(raw); return this.state; }
    } catch (e) { /* ignore */ }
    this.state = defaultState();
    this.save();
    return this.state;
  },
  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch (e) { /* ignore */ }
  },
  reset() {
    const role = this.state ? this.state.role : null;
    this.state = defaultState();
    this.state.role = role;
    this.save();
  },
  currentUser() {
    return this.state.role ? ROLES[this.state.role] : null;
  },
  can(perm) {
    const u = this.currentUser();
    return !!u && u.can.includes(perm);
  },
  applicant(id) { return this.state.applicants.find(a => a.id === id); },
  findByToken(token) {
    for (const a of this.state.applicants) {
      const ref = a.references.find(x => x.token === token);
      if (ref) return { applicant: a, referee: ref };
    }
    return null;
  },
  audit(action, target, details, applicantId) {
    const u = this.currentUser();
    this.state.audit.unshift({ id: uid(), at: new Date().toISOString(), user: u ? u.name : 'System', action, target, details: details || '', applicantId: applicantId || null });
    this.save();
  },
};

/* ---------- derived ---------- */

function complianceStatus(item) {
  if (!item || item.status !== 'verified') return 'missing';
  if (!item.expiresAt) return 'valid';
  const days = Math.ceil((new Date(item.expiresAt) - TODAY) / 86400000);
  if (days < 0) return 'expired';
  if (days <= (Store.state ? Store.state.settings.expiryAlertDays : 30)) return 'expiring';
  return 'valid';
}

function fullName(a) { return `${a.firstName} ${a.lastName}`; }

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function daysUntil(iso) { return Math.ceil((new Date(iso) - TODAY) / 86400000); }
function daysSince(iso) { return Math.floor((TODAY - new Date(iso)) / 86400000); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

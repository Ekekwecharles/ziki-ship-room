// Sample data for the Ship Room prototype.
// Issue totals and issue numbers (#1264, #1187, #1171) come from the real Ziki Zedu workspace.
// Per-platform progress, timings and 24h counts are illustrative.

export const OWNER = { name: 'Mark', initial: 'M' };

export const TOTALS = { all: 1380, waiting: 958, fixing: 73, testing: 18, shipped: 343 };

// Base state of each platform when nothing is waiting on the owner.
export const PLATFORMS = [
  { id: 'desktop', name: 'Desktop', base: { kind: 'ready', note: 'Every high-severity bug is fixed and tested.' } },
  { id: 'web', name: 'Web', base: { kind: 'ready', note: 'Every high-severity bug is fixed and tested.' } },
  { id: 'mobile', name: 'Mobile', base: { kind: 'agents', days: 3, note: '11 high-severity bugs being fixed. Nothing needs you.' } },
  { id: 'backend', name: 'Backend', base: { kind: 'ready', note: 'Every high-severity bug is fixed and tested.' } },
];

export const HANDLED = [
  { icon: 'check', text: '26 duplicate reports closed by triagers' },
  { icon: 'check', text: '14 new bugs confirmed by 2 independent reviewers' },
  { icon: 'check', text: '6 low-risk fixes merged after passing tests' },
  { icon: 'retry', text: '2 abandoned claims re-offered after their agents went silent' },
];

export const DECISIONS = [
  {
    id: '1264',
    kind: 'disagree',
    tag: 'Reviewers disagree',
    platforms: ['desktop', 'backend'],
    title: 'The fix for #1264 is stuck: 4 testers say merge, 1 says it\'s incomplete',
    short: 'Fix for #1264: 4 say merge, 1 says DM calls are still open',
    body: 'The fix stops strangers from ending channel calls, but the dissenting tester traced a path where DM and group calls can still be ended by anyone.',
    waiting: '3 days',
    question: 'Should the fix for #1264 be merged?',
    intro: 'Ziki paused this merge because the testers don\'t agree. Here is each side in plain words, and what each choice does to your release.',
    facts: [
      { label: 'The problem', value: 'Any logged-in user can end someone else\'s call.' },
      { label: 'What it blocks', value: 'The Desktop and Backend releases' },
      { label: 'Waiting', value: '3 days' },
    ],
    sides: [
      {
        title: '"Merge it"', count: '4 testers', tone: 'good',
        text: 'In channel calls, only the host can end the call now. Anyone else gets refused and the call keeps going. The code builds and the updated test passes.',
        checks: [
          { label: 'Read the code: 4', tone: 'plain' },
          { label: 'Ran the tests: 1', tone: 'plain' },
          { label: 'Checked DM calls: 0', tone: 'bad' },
        ],
        who: 'Titan, LynMax, Bolu Triager, Bolu Reviewer',
      },
      {
        title: '"Not ready"', count: '1 tester', tone: 'bad',
        text: 'DM and group calls skip the new check. They take an earlier exit in the code, so anyone who knows the call\'s id can still cancel it for everyone.',
        checks: [
          { label: 'Read the code: yes', tone: 'plain' },
          { label: 'Traced the DM call path: yes', tone: 'good' },
        ],
        who: 'Jeagal Eddy. The solver\'s own agent also flagged DM calls as unfinished in its PR.',
      },
    ],
    suggestion: {
      title: 'Ziki\'s suggestion: send it back',
      text: 'The single "not ready" vote points to a specific gap, and none of the 4 approvals tested DM calls. The solver agent says covering DM calls takes about 1 day.',
    },
    options: [
      { id: 'send-back', label: 'Send back to the solver', sub: 'Release moves about 1 day. Calls are fully protected.', primary: true,
        log: 'You sent the #1264 fix back to the solver to cover DM calls', effect: { kind: 'agents', days: 1, why: '#1264 fix covering DM calls' } },
      { id: 'merge-now', label: 'Merge now, track DM calls separately', sub: 'Desktop can ship today. DM and group calls stay exposed until the follow-up lands.',
        log: 'You merged the #1264 fix and opened a follow-up for DM calls', effect: null },
      { id: 'third', label: 'Ask a third tester to check DM calls', sub: 'Settles the disagreement with a test. Usually answered within a few hours.',
        log: 'You asked a third tester to check DM calls on #1264', effect: { kind: 'agents', days: 0.25, why: 'a third tester on #1264' } },
    ],
    cardOptions: ['send-back'],
  },
  {
    id: '1187',
    kind: 'security',
    tag: 'Security risk',
    platforms: ['backend'],
    title: 'Anyone on the internet can read your server logs (#1187)',
    short: 'Server logs are public (#1187). Fix is tested and ready.',
    body: 'The fix is done and 2 independent agents reproduced the leak and confirmed it\'s closed. It only needs your OK to merge.',
    waiting: '1 day',
    question: 'Merge the fix for the public logs endpoint?',
    intro: 'This one has no disagreement. It is here because it touches security, and your rule is to sign off on every security fix yourself.',
    facts: [
      { label: 'The problem', value: 'The /logs endpoint answers without a login, so request logs are public.' },
      { label: 'What it blocks', value: 'The Backend release' },
      { label: 'Waiting', value: '1 day' },
    ],
    sides: [
      {
        title: 'Evidence', count: '2 testers', tone: 'good',
        text: 'Both testers called /logs without a login before the fix and got logs back. After the fix, the same call is refused.',
        checks: [
          { label: 'Reproduced the leak: 2', tone: 'good' },
          { label: 'Confirmed it\'s closed: 2', tone: 'good' },
          { label: 'Ran the tests: 2', tone: 'plain' },
        ],
        who: 'Two independent reviewer agents from different owners',
      },
    ],
    suggestion: {
      title: 'Ziki\'s suggestion: approve it',
      text: 'The fix is small, both testers agree, and every day it waits the logs stay public.',
    },
    options: [
      { id: 'approve', label: 'Approve merge', sub: 'Ships with the next Backend release.', primary: true,
        log: 'You approved the security fix for #1187', effect: null },
      { id: 'hold', label: 'Hold it', sub: 'Keeps the Backend release blocked until you decide.',
        log: 'You put the #1187 security fix on hold', effect: { kind: 'held', why: 'you held #1187' } },
    ],
    cardOptions: ['approve'],
  },
  {
    id: '1171',
    kind: 'ask',
    tag: 'An agent is asking',
    platforms: ['backend'],
    title: 'Fixing the private channel leak (#1171) properly needs a database change',
    short: '#1171 needs a database change to fix properly. Adds 2 days.',
    body: 'The solver can patch the search today, or change 2 tables so the leak can\'t come back. The bigger fix adds about 2 days.',
    waiting: '5 hours',
    question: 'How should the channel search leak (#1171) be fixed?',
    intro: 'The solver agent stopped and asked, because the proper fix goes beyond what the issue described.',
    facts: [
      { label: 'The problem', value: 'Channel search shows private channels from other organizations.' },
      { label: 'What it blocks', value: 'The Backend release' },
      { label: 'Waiting', value: '5 hours' },
    ],
    sides: [
      {
        title: 'Quick patch', count: 'today', tone: 'plain',
        text: 'Filter the search results so other organizations\' private channels are hidden. Fast, but any new search feature could leak again.',
        checks: [{ label: 'Ready in hours', tone: 'good' }, { label: 'Can come back', tone: 'bad' }],
        who: 'Proposed by the solver agent',
      },
      {
        title: 'Database change', count: '+2 days', tone: 'good',
        text: 'Store which organization owns each channel so every query is limited automatically. Touches 2 tables.',
        checks: [{ label: 'Fixes the root cause', tone: 'good' }, { label: 'Needs a migration', tone: 'plain' }],
        who: 'Proposed by the solver agent',
      },
    ],
    suggestion: {
      title: 'Ziki\'s suggestion: allow the database change',
      text: 'Leaks between organizations are the kind of bug that comes back. The 2 days are cheaper than a second incident.',
    },
    options: [
      { id: 'migrate', label: 'Allow the database change', sub: 'Backend release moves about 2 days. The leak can\'t come back.', primary: true,
        log: 'You allowed a database change for #1171', effect: { kind: 'agents', days: 2, why: 'the #1171 database change' } },
      { id: 'patch', label: 'Patch now, fix later', sub: 'Backend can ship sooner. A follow-up issue tracks the real fix.',
        log: 'You chose a quick patch for #1171 and a follow-up for the real fix', effect: null },
    ],
    cardOptions: ['migrate'],
  },
];

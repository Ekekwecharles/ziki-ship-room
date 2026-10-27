import { useEffect, useMemo, useState } from 'react';
import { DECISIONS, HANDLED, OWNER, PLATFORMS, TOTALS } from './data.js';

const STORE_KEY = 'ziki-ship-room-v1';

function loadResolved() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveResolved(value) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable: the demo still works for this visit */
  }
}

function useRoute() {
  const read = () => window.location.hash.replace(/^#/, '') || '/';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onHash = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

const joinAnd = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

const optionOf = (decision, optionId) => decision.options.find((o) => o.id === optionId);

function formatDays(days) {
  if (days < 1) return 'a few hours';
  return days === 1 ? 'about 1 day' : `about ${days} days`;
}

function platformStatus(platform, resolved) {
  const pending = DECISIONS.filter((d) => !resolved[d.id] && d.platforms.includes(platform.id));
  if (pending.length) {
    const security = pending.some((d) => d.kind === 'security');
    return {
      tone: security ? 'red' : 'gold',
      label: `${pending.length} call${pending.length > 1 ? 's' : ''} away`,
      note: `Waiting on you: ${joinAnd(pending.map((d) => `#${d.id}`))}.`,
      progress: 92 - pending.length * 7,
    };
  }

  const effects = DECISIONS.filter((d) => resolved[d.id] && d.platforms.includes(platform.id))
    .map((d) => optionOf(d, resolved[d.id])?.effect)
    .filter(Boolean);

  const held = effects.find((e) => e.kind === 'held');
  if (held) {
    return { tone: 'gold', label: 'Held by you', note: `Blocked because ${held.why}.`, progress: 85 };
  }

  const work = effects.filter((e) => e.kind === 'agents');
  if (platform.base.kind === 'agents') work.push({ days: platform.base.days, why: null });
  if (work.length) {
    const days = Math.max(...work.map((w) => w.days));
    const whys = work.map((w) => w.why).filter(Boolean);
    const note = whys.length
      ? `Agents are finishing ${joinAnd(whys)}. Ready in ${formatDays(days)}.`
      : platform.base.note;
    return { tone: 'blue', label: 'Agents on it', note, progress: days >= 3 ? 61 : 80, days };
  }

  return { tone: 'green', label: 'Ready to ship', note: platform.base.note, progress: 100 };
}

/* ---------- small pieces ---------- */

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5AA9FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 5h14L5 19h14" />
      <path d="M9 12h6" />
    </svg>
  );
}

function Icon({ name, color = 'currentColor' }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (name === 'check') return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
  if (name === 'retry') return <svg {...common}><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>;
  if (name === 'you') return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
  if (name === 'bell') return <svg {...common}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
  if (name === 'product') return <svg {...common}><path d="m12 2 9 5v10l-9 5-9-5V7z" /></svg>;
  if (name === 'marketing') return <svg {...common}><path d="M3 11v2l13 5V6z" /><path d="M19 9a4 4 0 0 1 0 6" /></svg>;
  if (name === 'security') return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
  return null;
}

const TAG_TONE = { disagree: 'gold', security: 'red', ask: 'blue' };

function Pill({ tone = 'muted', children }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function Header({ pendingCount }) {
  return (
    <header className="topbar">
      <a href="#/" className="brand" aria-label="Ship Room home">
        <Logo />
        <span className="brand-name">ziki</span>
        <span className="brand-divider" />
        <span className="brand-workspace">Zedu</span>
      </a>
      <nav aria-label="Workspace areas" className="tabs">
        <a href="#/" className="tab tab-active">Product</a>
        <a href="https://ziki.dev/marketing" className="tab">Marketing</a>
        <a href="https://ziki.dev/security" className="tab">Security</a>
      </nav>
      <div className="topbar-right">
        <span className="pill pill-blue owner-pill">Owner view</span>
        <a href="#/" className="bell" aria-label={`${pendingCount} decisions waiting on you`}>
          <Icon name="bell" />
          {pendingCount > 0 && <span className="bell-count">{pendingCount}</span>}
        </a>
        <div className="account">
          <span className="avatar">{OWNER.initial}</span>
          <span className="account-name">{OWNER.name}</span>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav aria-label="Workspace areas" className="bottomnav">
      <a href="#/" className="bottomnav-item active"><Icon name="product" />Product</a>
      <a href="https://ziki.dev/marketing" className="bottomnav-item"><Icon name="marketing" />Marketing</a>
      <a href="https://ziki.dev/security" className="bottomnav-item"><Icon name="security" />Security</a>
    </nav>
  );
}

/* ---------- Ship Room ---------- */

function Verdict({ pending, statuses }) {
  if (pending.length) {
    return (
      <p className="lede">
        <strong className="answer answer-gold">Not yet.</strong> Agents have worked through {TOTALS.all.toLocaleString()} issues.{' '}
        {pending.length === 1 ? 'One decision' : `${['', '', 'Two', 'Three'][pending.length] || pending.length} decisions`} only you can make{' '}
        {pending.length === 1 ? 'stands' : 'stand'} between you and a release.
      </p>
    );
  }
  const ready = statuses.filter((s) => s.status.tone === 'green').map((s) => s.platform.name);
  const notReady = statuses.filter((s) => s.status.tone !== 'green');
  if (!notReady.length) {
    return <p className="lede"><strong className="answer answer-green">Yes.</strong> Every platform is ready to ship.</p>;
  }
  const finishing = notReady.map((s) => (s.status.days ? `${s.platform.name} (${formatDays(s.status.days)})` : s.platform.name));
  return (
    <p className="lede">
      <strong className="answer answer-green">Nothing needs you.</strong> {ready.length ? `${joinAnd(ready)} can ship now. ` : ''}
      Agents are finishing {joinAnd(finishing)}.
    </p>
  );
}

function DecisionCard({ decision, onDecide }) {
  const primary = decision.options.find((o) => o.id === decision.cardOptions[0]);
  return (
    <article className="card decision">
      <div className="decision-body">
        <div className="pill-row">
          <Pill tone={TAG_TONE[decision.kind]}>{decision.tag}</Pill>
          <Pill>Blocks {decision.platforms.map((p) => PLATFORMS.find((x) => x.id === p).name).join(' and ')}</Pill>
          <Pill>Waiting {decision.waiting}</Pill>
        </div>
        <h3>{decision.title}</h3>
        <p className="muted">{decision.body}</p>
      </div>
      <div className="decision-actions">
        <button type="button" className="btn btn-primary" onClick={() => onDecide(decision.id, primary.id)}>{primary.label}</button>
        <a href={`#/decision/${decision.id}`} className="btn btn-secondary">
          {decision.kind === 'disagree' ? 'See both sides' : decision.kind === 'security' ? 'Show me the evidence' : 'See the options'}
        </a>
      </div>
    </article>
  );
}

function ShipRoom({ resolved, onDecide, onReset }) {
  const pending = DECISIONS.filter((d) => !resolved[d.id]);
  const statuses = PLATFORMS.map((platform) => ({ platform, status: platformStatus(platform, resolved) }));
  const yourActions = DECISIONS.filter((d) => resolved[d.id]).map((d) => optionOf(d, resolved[d.id]).log);

  return (
    <main className="page">
      <section aria-labelledby="ship-q" className="stack-20">
        <div className="stack-8">
          <span className="eyebrow">PRODUCT · ZEDU</span>
          <h1 id="ship-q">Is Zedu ready to ship?</h1>
          <Verdict pending={pending} statuses={statuses} />
        </div>
        <div className="platforms">
          {statuses.map(({ platform, status }) => (
            <article key={platform.id} className="card platform">
              <div className="platform-head">
                <h2>{platform.name}</h2>
                <Pill tone={status.tone}>{status.label}</Pill>
              </div>
              <div className="bar" role="img" aria-label={`${platform.name} ${status.progress}% of the way to shippable`}>
                <div className={`bar-fill fill-${status.tone}`} style={{ width: `${status.progress}%` }} />
              </div>
              <p className="muted small">{status.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="needs-you" className="stack-16">
        <div className="section-head">
          <h2 id="needs-you">Needs you</h2>
          <Pill tone={pending.length ? 'gold' : 'green'}>{pending.length}</Pill>
          <span className="muted">Only the decisions agents can't make. Everything else is handled.</span>
        </div>
        {pending.length ? (
          pending.map((d) => <DecisionCard key={d.id} decision={d} onDecide={onDecide} />)
        ) : (
          <div className="card empty">
            <Icon name="check" color="#74E0A6" />
            <div>
              <h3>You're all caught up</h3>
              <p className="muted">Agents will bring you the next decision when one needs a human. You can close Ziki.</p>
            </div>
          </div>
        )}
      </section>

      <section className="split">
        <div className="card factory">
          <div className="stack-6">
            <h2>The factory right now</h2>
            <p className="muted small">Where every issue sits. You watch the flow, the agents move the work.</p>
          </div>
          <div className="flow">
            <div className="flow-step"><span>Waiting for an agent</span><strong>{TOTALS.waiting}</strong></div>
            <div className="flow-step"><span>Being fixed</span><strong>{TOTALS.fixing}</strong></div>
            <div className="flow-step"><span>In testing</span><strong>{TOTALS.testing}</strong></div>
            <div className={`flow-step ${pending.length ? 'flow-gold' : ''}`}><span>Waiting on you</span><strong>{pending.length}</strong></div>
            <div className="flow-step flow-green"><span>Shipped</span><strong>{TOTALS.shipped}</strong></div>
          </div>
          <p className="muted small">The slowest step this week is <strong className="text">testing</strong>: fixes wait about 20 hours for a second independent tester.</p>
        </div>

        <div className="card handled">
          <div className="stack-6">
            <h2>Handled without you</h2>
            <p className="muted small">Last 24 hours</p>
          </div>
          <ul>
            {yourActions.map((text) => (
              <li key={text} className="you-did"><Icon name="you" color="#8FC9FF" /><span>{text}</span></li>
            ))}
            {HANDLED.map((h) => (
              <li key={h.text}><Icon name={h.icon} color={h.icon === 'check' ? '#74E0A6' : '#8FC9FF'} /><span>{h.text}</span></li>
            ))}
          </ul>
          <a href="https://ziki.dev/issues" className="link">See everything agents did</a>
        </div>
      </section>

      <footer className="page-foot">
        <p className="muted small">The full issue list still exists. Agents work from it, and you can open it when you want to dig in.</p>
        <div className="foot-links">
          <a href="https://ziki.dev/issues" className="link">Open all {TOTALS.all.toLocaleString()} issues</a>
          <button type="button" className="link-button" onClick={onReset}>Reset demo</button>
        </div>
      </footer>
    </main>
  );
}

/* ---------- Decision page ---------- */

function DecisionPage({ id, resolved, onDecide, onUndo }) {
  const decision = DECISIONS.find((d) => d.id === id);
  if (!decision) {
    return (
      <main className="page">
        <a href="#/" className="link">← Back to Ship Room</a>
        <h1>That decision doesn't exist.</h1>
      </main>
    );
  }
  const chosen = resolved[decision.id] && optionOf(decision, resolved[decision.id]);

  return (
    <main className="page">
      <a href="#/" className="link back">← Back to Ship Room</a>

      <section className="stack-12">
        <div className="pill-row">
          <Pill tone={TAG_TONE[decision.kind]}>{decision.tag}</Pill>
          <Pill>#{decision.id}</Pill>
        </div>
        <h1 className="h1-sm">{decision.question}</h1>
        <p className="lede">{decision.intro}</p>
      </section>

      {chosen && (
        <div className="card decided" role="status">
          <Icon name="check" color="#74E0A6" />
          <div className="decided-body">
            <strong>You decided: {chosen.label}</strong>
            <span className="muted small">The agents are carrying it out. You won't hear about #{decision.id} again unless something new needs you.</span>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => onUndo(decision.id)}>Change decision</button>
        </div>
      )}

      <section className="card facts">
        {decision.facts.map((f) => (
          <div key={f.label} className="fact">
            <span className="muted small strong">{f.label}</span>
            <span>{f.value}</span>
          </div>
        ))}
      </section>

      <section className="sides">
        {decision.sides.map((side) => (
          <article key={side.title} className="card side">
            <div className="platform-head">
              <h2>{side.title}</h2>
              <Pill tone={side.tone === 'bad' ? 'red' : side.tone === 'good' ? 'green' : 'muted'}>{side.count}</Pill>
            </div>
            <p className="body">{side.text}</p>
            <div className="stack-8">
              <span className="muted small strong">What they actually checked</span>
              <div className="pill-row">
                {side.checks.map((c) => (
                  <span key={c.label} className={`chip chip-${c.tone}`}>{c.label}</span>
                ))}
              </div>
            </div>
            <p className="muted small">{side.who}</p>
          </article>
        ))}
      </section>

      <section className="card suggestion" aria-labelledby="rec">
        <h2 id="rec">{decision.suggestion.title}</h2>
        <p className="body">{decision.suggestion.text}</p>
      </section>

      <section className="stack-12" aria-labelledby="choose">
        <h2 id="choose">Your call</h2>
        <div className="choices">
          {decision.options.map((o) => {
            const isChosen = chosen && chosen.id === o.id;
            return (
              <button
                key={o.id}
                type="button"
                className={`choice ${o.primary ? 'choice-primary' : ''} ${isChosen ? 'choice-chosen' : ''}`}
                aria-pressed={isChosen ? 'true' : 'false'}
                onClick={() => onDecide(decision.id, o.id)}
              >
                <span className="choice-title">{o.label}{isChosen ? ' ✓' : ''}</span>
                <span className="choice-sub">{o.sub}</span>
              </button>
            );
          })}
        </div>
        <p className="muted small">Your choice is posted on the issue as {OWNER.name}'s decision, and the agents carry it out.</p>
      </section>
    </main>
  );
}

/* ---------- App ---------- */

export default function App() {
  const route = useRoute();
  const [resolved, setResolved] = useState(loadResolved);
  const [toast, setToast] = useState(null);

  useEffect(() => saveResolved(resolved), [resolved]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const pendingCount = useMemo(() => DECISIONS.filter((d) => !resolved[d.id]).length, [resolved]);

  const decide = (id, optionId) => {
    const decision = DECISIONS.find((d) => d.id === id);
    const option = optionOf(decision, optionId);
    const previous = resolved[id];
    setResolved((r) => ({ ...r, [id]: optionId }));
    setToast({ id, previous, text: `${option.label}. The agents will take it from here.` });
  };

  const undo = (id, previous) => {
    setResolved((r) => {
      const next = { ...r };
      if (previous) next[id] = previous;
      else delete next[id];
      return next;
    });
    setToast(null);
  };

  const reset = () => {
    setResolved({});
    setToast(null);
  };

  const decisionMatch = route.match(/^\/decision\/(\w+)/);

  return (
    <div className="app">
      <a href="#main" className="skip">Skip to content</a>
      <Header pendingCount={pendingCount} />
      <div id="main">
        {decisionMatch ? (
          <DecisionPage id={decisionMatch[1]} resolved={resolved} onDecide={decide} onUndo={(id) => undo(id, null)} />
        ) : (
          <ShipRoom resolved={resolved} onDecide={decide} onReset={reset} />
        )}
      </div>
      <BottomNav />
      {toast && (
        <div className="toast" role="status">
          <span>{toast.text}</span>
          <button type="button" className="toast-undo" onClick={() => undo(toast.id, toast.previous)}>Undo</button>
        </div>
      )}
    </div>
  );
}

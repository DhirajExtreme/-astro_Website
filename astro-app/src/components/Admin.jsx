import { useState, useEffect } from 'react';
import './Admin.css';

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [price, setPrice] = useState(500);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    if (authed) {
      setUsers(JSON.parse(localStorage.getItem('astroUsers') || '[]'));
      setPayments(JSON.parse(localStorage.getItem('astroPayments') || '[]'));
      const p = localStorage.getItem('chatPrice');
      const d = localStorage.getItem('chatDuration');
      if (p) setPrice(Number(p));
      if (d) setDuration(Number(d));
    }
  }, [authed]);

  const login = (e) => {
    e.preventDefault();
    if (pw === 'admin123') { setAuthed(true); setErr(''); }
    else setErr('Invalid password. Please try again.');
  };

  const saveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('chatPrice', price);
    localStorage.setItem('chatDuration', duration);
    alert('Settings saved!');
  };

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === 'pending').length;

  if (!authed) {
    return (
      <div className="admin-login">
        <h2 className="admin-login__title">Admin Access</h2>
        <form className="admin-login__form card" onSubmit={login}>
          <div className="form-group">
            <label htmlFor="admin-pw">Password</label>
            <input id="admin-pw" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter password" autoComplete="current-password" />
          </div>
          {err && <p className="admin-login__err">{err}</p>}
          <button type="submit" className="btn-gold btn-gold-filled" style={{ width:'100%', marginTop:'0.5rem' }}>Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dash">
      <div className="container">
        <div className="admin-dash__header">
          <h2 className="section-title" style={{ textAlign:'left', marginBottom:0 }}>Admin Dashboard</h2>
          <button className="btn-gold btn-gold-outline" onClick={() => { setAuthed(false); setPw(''); }}>Logout</button>
        </div>

        {/* Stats */}
        <div className="admin-dash__stats">
          {[
            { label:'Free Predictions', val: users.length },
            { label:'Sessions Booked',  val: payments.length },
            { label:'Total Revenue',    val: `₹${totalRevenue}` },
            { label:'Pending Sessions', val: pending },
          ].map(s => (
            <div key={s.label} className="admin-stat card">
              <div className="admin-stat__val">{s.val}</div>
              <div className="admin-stat__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="admin-dash__grid">
          {/* Recent sessions */}
          <div className="card">
            <h3 className="admin-card__title">Recent Sessions</h3>
            {payments.length === 0
              ? <p className="admin-empty">No sessions yet.</p>
              : payments.slice(-5).reverse().map((p, i) => (
                <div key={i} className="admin-row">
                  <div>
                    <strong>#{p.paymentId?.slice(-6)}</strong>
                    <p>{p.slot || '—'}</p>
                  </div>
                  <span className="admin-badge admin-badge--green">₹{p.amount} · Completed</span>
                </div>
              ))
            }
          </div>

          {/* Recent users */}
          <div className="card">
            <h3 className="admin-card__title">Recent Users</h3>
            {users.length === 0
              ? <p className="admin-empty">No users yet.</p>
              : users.slice(-5).reverse().map((u, i) => (
                <div key={i} className="admin-row">
                  <div>
                    <strong>{u.name}</strong>
                    <p>{u.sign} · {u.gender} · {u.place}</p>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Settings */}
          <div className="card">
            <h3 className="admin-card__title">Settings</h3>
            <form onSubmit={saveSettings}>
              <div className="form-group">
                <label htmlFor="admin-price">Session Price (₹)</label>
                <input id="admin-price" type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="admin-dur">Duration (minutes)</label>
                <input id="admin-dur" type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
              <button type="submit" className="btn-gold btn-gold-filled" style={{ width:'100%' }}>Save Settings</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

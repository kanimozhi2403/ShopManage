import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success(`Welcome back!`);
      navigate(res.role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-shop">Shop</span>Manage
        </div>
        <p className="login-sub">Business Management System — Sign in to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="login-input-wrap">
            <label className="login-label">Email Address</label>
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@shop.com"
              required
            />
          </div>
          <div className="login-input-wrap">
            <label className="login-label">Password</label>
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <a href="/forgot-password" style={{ fontSize: 11, color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>Forgot Password?</a>
            </div>
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

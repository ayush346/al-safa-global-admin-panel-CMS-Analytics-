import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditMode } from '../context/EditModeContext';
import './Admin.css';

function Admin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setEditMode } = useEditMode();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prototype: any password works
    setEditMode(true);
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Access</h1>
      <p className="admin-subtitle">Enter the admin password to continue</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="form-input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="admin-actions">
          <button type="submit" className="btn btn-primary">Continue</button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <label className="helper-text">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              style={{ marginRight: 8 }}
            />
            Show password
          </label>
        </div>
      </form>
    </div>
  );
}

export default Admin;



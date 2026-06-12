/**
 * Reusable Form Components — Input, Select, Textarea, Checkbox, FileUpload
 */
import { useState } from 'react';
import { FiEye, FiEyeOff, FiUpload, FiX } from 'react-icons/fi';

// ── Text Input ──────────────────────────────
export function Input({ label, name, type = 'text', value, onChange, placeholder, error, required, icon: Icon, disabled }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div style={{ marginBottom: '14px' }}>
      {label && (
        <label htmlFor={name} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
          {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: `10px ${isPassword ? '40px' : '14px'} 10px ${Icon ? '38px' : '14px'}`,
            borderRadius: '10px',
            border: `1.5px solid ${error ? 'var(--error)' : 'var(--border-color)'}`,
            background: disabled ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            fontFamily: 'inherit',
            opacity: disabled ? 0.6 : 1,
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
          onBlur={e => { e.target.style.borderColor = error ? 'var(--error)' : 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px' }}>
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}

// ── Select ──────────────────────────────────
export function Select({ label, name, value, onChange, options, placeholder, error, required, disabled }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      {label && (
        <label htmlFor={name} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
          {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: '10px',
          border: `1.5px solid ${error ? 'var(--error)' : 'var(--border-color)'}`,
          background: disabled ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
          color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
          fontSize: '14px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
      {error && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}

// ── Textarea ────────────────────────────────
export function Textarea({ label, name, value, onChange, placeholder, rows = 4, error, required, disabled, maxLength }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      {label && (
        <label htmlFor={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
          <span>{label} {required && <span style={{ color: 'var(--error)' }}>*</span>}</span>
          {maxLength && <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>{(value || '').length}/{maxLength}</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: '10px',
          border: `1.5px solid ${error ? 'var(--error)' : 'var(--border-color)'}`,
          background: disabled ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
          color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
          fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5,
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--error)' : 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
      />
      {error && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}

// ── Checkbox / Toggle ───────────────────────
export function Checkbox({ label, checked, onChange, description }) {
  return (
    <label style={{ display: 'flex', gap: '10px', cursor: 'pointer', marginBottom: '10px' }}>
      <div style={{ position: 'relative', width: '18px', height: '18px', flexShrink: 0, marginTop: '2px' }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
        <div style={{
          width: '18px', height: '18px', borderRadius: '5px',
          border: `2px solid ${checked ? 'var(--primary)' : 'var(--border-color-strong)'}`,
          background: checked ? 'var(--primary)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          {checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {description && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{description}</div>}
      </div>
    </label>
  );
}

// ── File Upload ─────────────────────────────
export function FileUpload({ label, accept, onChange, file, onRemove, error, required }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) onChange(e.dataTransfer.files[0]);
  };

  return (
    <div style={{ marginBottom: '14px' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
          {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
      )}
      {file ? (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
            📎 {file.name} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
          <button type="button" onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '4px' }}><FiX size={16} /></button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`file-${label}`).click()}
          style={{
            padding: '32px 24px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
            border: `2px dashed ${dragOver ? 'var(--primary)' : error ? 'var(--error)' : 'var(--border-color)'}`,
            background: dragOver ? 'rgba(99,102,241,0.05)' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <FiUpload size={24} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Click to upload</span> or drag and drop
          </p>
          {accept && <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{accept}</p>}
          <input id={`file-${label}`} type="file" accept={accept} onChange={e => onChange(e.target.files[0])} style={{ display: 'none' }} />
        </div>
      )}
      {error && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}

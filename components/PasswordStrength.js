import { useMemo } from 'react';

const RULES = [
  { key: 'len', label: '8+ characters' },
  { key: 'upper', label: 'Uppercase letter' },
  { key: 'lower', label: 'Lowercase letter' },
  { key: 'digit', label: 'Number (0–9)' },
  { key: 'special', label: 'Special character' }
];

export default function PasswordStrength({ password }) {
  const rules = useMemo(() => ({
    len: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  }), [password]);

  const score = Object.values(rules).filter(Boolean).length;

  const barClasses = [0, 1, 2, 3].map((index) => {
    if (score === 5) return 'pw-bar strong';
    if (score >= 4 && index <= 2) return 'pw-bar medium';
    if (score >= 3 && index <= 1) return 'pw-bar medium';
    if (score >= 2 && index === 0) return 'pw-bar weak';
    if (score > 0 && index === 0) return 'pw-bar weak';
    return 'pw-bar';
  });

  return (
    <div className="pw-strength">
      <div className="pw-strength-bar">
        {barClasses.map((className, index) => (
          <div key={index} className={className} />
        ))}
      </div>
      <div className="pw-rules">
        {RULES.map((rule) => (
          <div key={rule.key} className={`pw-rule ${rules[rule.key] ? 'ok' : ''}`}>
            <div className="dot" />
            {rule.label}
          </div>
        ))}
      </div>
    </div>
  );
}

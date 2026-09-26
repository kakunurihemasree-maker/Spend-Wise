import React from 'react';
import { useFinance } from '../context/FinanceContext.jsx';
import logoIcon from '../assets/spendwise-icon.png';
import logoFullDark from '../assets/spendwise-logo-dark.png';
import logoFullLight from '../assets/spendwise-logo.png';

export default function BrandLogo({ 
  size = 'medium', 
  showTagline = true, 
  variant = 'hybrid', // 'hybrid' (crisp icon + sharp vector typography) | 'image' (pure image) | 'icon-only'
  className = '' 
}) {
  const { theme } = useFinance();
  const isDark = theme === 'dark';

  const iconSizes = {
    small: 32,
    medium: 44,
    large: 58,
    xlarge: 74
  };

  const currentIconSize = iconSizes[size] || iconSizes.medium;

  if (variant === 'icon-only') {
    return (
      <div className={`spendwise-brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
        <img 
          src={logoIcon} 
          alt="SpendWise Logo" 
          width={currentIconSize} 
          height={currentIconSize} 
          style={{ objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.25))' }}
        />
      </div>
    );
  }

  if (variant === 'image') {
    const imgHeights = {
      small: 32,
      medium: 44,
      large: 56,
      xlarge: 70
    };
    return (
      <div className={`spendwise-brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
        <img 
          src={isDark ? logoFullDark : logoFullLight} 
          alt="SpendWise — Track • Plan • Grow" 
          style={{ 
            height: imgHeights[size] || 44, 
            width: 'auto', 
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 10px rgba(16, 185, 129, 0.2))'
          }}
        />
      </div>
    );
  }

  // Hybrid: Crisp authentic logo mark (purple wallet with ₹ coin & leaves) paired with matching typography
  const textSizes = {
    small: { title: '1.25rem', tagline: '0.65rem' },
    medium: { title: '1.6rem', tagline: '0.72rem' },
    large: { title: '2.1rem', tagline: '0.82rem' },
    xlarge: { title: '2.6rem', tagline: '0.95rem' }
  };

  const currentText = textSizes[size] || textSizes.medium;

  return (
    <div 
      className={`spendwise-brand-logo ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: size === 'small' ? '0.65rem' : '0.8rem',
        userSelect: 'none'
      }}
    >
      <div 
        className="brand-logo-icon-wrap"
        style={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0 
        }}
      >
        <img 
          src={logoIcon} 
          alt="SpendWise Logo" 
          width={currentIconSize} 
          height={currentIconSize}
          style={{ 
            objectFit: 'contain', 
            filter: 'drop-shadow(0 4px 14px rgba(16, 185, 129, 0.3))',
            transition: 'transform 0.25s ease'
          }}
        />
      </div>

      <div className="brand-text-container" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <div 
          className="brand-name" 
          style={{
            fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: currentText.title,
            letterSpacing: '-0.025em',
            display: 'flex',
            alignItems: 'baseline'
          }}
        >
          <span style={{ color: isDark ? '#FFFFFF' : '#0F172A', transition: 'color 0.2s' }}>Spend</span>
          <span style={{ color: '#10B981', marginLeft: '1px' }}>Wise</span>
        </div>

        {showTagline && (
          <div 
            className="brand-tagline" 
            style={{
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              fontSize: currentText.tagline,
              fontWeight: 600,
              color: '#38BDF8',
              letterSpacing: '0.06em',
              marginTop: size === 'small' ? '3px' : '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Track</span>
            <span style={{ fontSize: '0.6em', opacity: 0.8 }}>•</span>
            <span>Plan</span>
            <span style={{ fontSize: '0.6em', opacity: 0.8 }}>•</span>
            <span>Grow</span>
          </div>
        )}
      </div>
    </div>
  );
}

// SVG Icons for Missions & Rewards

export function IconTrophy({ size = 20, color = "#2f6fed" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9c0-1.657 1.343-3 3-3h6c1.657 0 3 1.343 3 3v3c0 .552.448 1 1 1h1c1.105 0 2 .895 2 2v1c0 .552-.448 1-1 1H2c-.552 0-1-.448-1-1v-1c0-1.105.895-2 2-2h1c.552 0 1-.448 1-1V9z" fill={color} opacity="0.3"/>
      <path d="M6 3h12v2H6V3z" fill={color}/>
      <path d="M9 3v3m6-3v3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 19h14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCalendar({ size = 20, color = "#2f6fed" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="17" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M3 9h18" stroke={color} strokeWidth="1.5"/>
      <path d="M7 1v6M17 1v6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconGift({ size = 20, color = "#22c55e" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top bow loops */}
      <circle cx="8" cy="5" r="3" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="16" cy="5" r="3" stroke={color} strokeWidth="2" fill="none"/>
      {/* Top ribbon/bow center */}
      <rect x="10" y="6" width="4" height="3" rx="0.5" fill={color}/>
      {/* Main box */}
      <rect x="2" y="9" width="20" height="13" rx="1" stroke={color} strokeWidth="2" fill="none"/>
      {/* Vertical divider */}
      <path d="M12 9v13" stroke={color} strokeWidth="2"/>
      {/* Horizontal divider */}
      <path d="M2 15.5h20" stroke={color} strokeWidth="2"/>
    </svg>
  );
}

export function IconCheckmark({ size = 20, color = "#22c55e" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6l-12 12-4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconClock({ size = 20, color = "#f59e0b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5"/>
      <path d="M12 7v5l3 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconMission({ size = 20, color = "#2f6fed" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 4h18v14c0 1.105-.895 2-2 2H5c-1.105 0-2-.895-2-2V4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 2v4M17 2v4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 8h18" stroke={color} strokeWidth="1.5"/>
      <circle cx="8" cy="15" r="1.5" fill={color}/>
      <circle cx="14" cy="15" r="1.5" fill={color}/>
    </svg>
  );
}

export function IconVoucher({ size = 20, color = "#8b5cf6" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M8 5v14M16 5v14" stroke={color} strokeWidth="1.5" strokeDasharray="2,2"/>
      <path d="M5 9h3M5 15h3M16 9h3M16 15h3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconXP({ size = 20, color = "#9ad65c" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" stroke={color} strokeWidth="1.8" fill="none"/>
      <text x="12" y="15" textAnchor="middle" fontSize="9" fontWeight="bold" fill={color}>XP</text>
    </svg>
  );
}

export function IconTarget({ size = 20, color = "#9ad65c" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circle */}
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none"/>
      {/* Middle circle */}
      <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" fill="none"/>
      {/* Inner circle (bullseye) */}
      <circle cx="12" cy="12" r="3" fill={color} opacity="0.3"/>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill="none"/>
      {/* Arrow */}
      <path d="M18 6l-6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M18 6l-2 0" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M18 6l0 2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export default function MenuIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="6" width="18" height="2.4" rx="1.2" fill="currentColor" />
      <rect x="3" y="11" width="18" height="2.4" rx="1.2" fill="currentColor" />
      <rect x="3" y="16" width="12" height="2.4" rx="1.2" fill="currentColor" />
    </svg>
  );
}
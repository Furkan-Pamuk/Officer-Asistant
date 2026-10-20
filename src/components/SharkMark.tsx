export default function SharkMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#081120" />
      <path d="M21 48 C24 32 31 21 48 13 C44 26 42 36 42 48 Z" fill="#8B98A5" />
      <rect x="12" y="44" width="40" height="3" rx="1.5" fill="#2AA198" />
      <rect x="18" y="50" width="28" height="3" rx="1.5" fill="#2AA198" opacity="0.45" />
    </svg>
  );
}

const PALETTE = [
  'bg-red-100 text-red-700 border-red-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-sky-100 text-sky-700 border-sky-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-pink-100 text-pink-700 border-pink-200',
];

function hashColor(name) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return PALETTE[sum % PALETTE.length];
}

export default function TagBadge({ name }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${hashColor(name)}`}
    >
      {name}
    </span>
  );
}
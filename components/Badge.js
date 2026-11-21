export default function Badge({ s }) {
  const c = s === 'Lunas' ? 'bg-green-100 text-green-700' : s === 'Menunggu' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return <span className={`rounded px-2 py-0.5 text-xs ${c}`}>{s}</span>;
}

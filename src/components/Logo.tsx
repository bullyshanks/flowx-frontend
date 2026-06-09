import Link from 'next/link';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export default function Logo({ size = 'md', href = '/' }: Props) {
  const sizes = {
    sm: { icon: 'w-8 h-8', name: 'text-base' },
    md: { icon: 'w-[52px] h-[52px]', name: 'text-xl' },
    lg: { icon: 'w-20 h-20', name: 'text-3xl' },
  };
  const s = sizes[size];

  return (
    <Link href={href} className="flex items-center gap-3 no-underline">
      <div className={`${s.icon} bg-white rounded-[10px] p-1 flex items-center justify-center overflow-hidden`}>
        {/* Replace with actual logo image when ready */}
        <span className="font-syne font-extrabold text-electric text-xl">F</span>
      </div>
      <div className="flex flex-col">
        <span className={`font-syne font-extrabold ${s.name} text-white leading-none`}>
          Flow<span className="x-green">X</span>
        </span>
        <span className="text-[10px] text-cyan2 uppercase tracking-[2px]">Water Delivery</span>
      </div>
    </Link>
  );
}

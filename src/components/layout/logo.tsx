import Link from "next/link";
export function Logo() { return <Link href="/" className="display flex items-center gap-2 text-2xl font-semibold text-ink"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-lg text-white -rotate-3">T</span>Tiki Taka<span className="h-2 w-2 rounded-full bg-sun" /></Link>; }

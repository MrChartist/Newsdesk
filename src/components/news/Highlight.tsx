import { Fragment } from 'react';

/** Wraps matches of the query terms in <mark>. */
export default function Highlight({ text, query }: { text: string; query?: string }) {
  const terms = (query ?? '').trim().split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`\\b(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'ig');
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1
          ? <mark key={i} className="rounded-[4px] bg-ios-yellow/35 px-0.5 text-inherit">{part}</mark>
          : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  );
}

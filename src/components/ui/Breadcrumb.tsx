import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-[#7b818c]">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i}>
            {i > 0 && <span> · </span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-[#9aa0ab] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "text-[#9aa0ab]" : undefined}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

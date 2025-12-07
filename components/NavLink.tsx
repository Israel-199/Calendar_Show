import { forwardRef, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string; // Not really used in Next.js, but kept for compatibility
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ href, className, activeClassName, pendingClassName, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
      <Link href={href} passHref legacyBehavior>
        <a
          ref={ref}
          className={cn(className, isActive && activeClassName)}
          {...props}
        />
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };

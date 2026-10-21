import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full transition duration-150 ease-out select-none " +
  "disabled:pointer-events-none disabled:opacity-50 disabled:comic-shadow-none";

// Comic buttons: chunky outline and a solid offset shadow; they lift on hover
// and squish down (shadow gone) when pressed.
const press = "hover:-translate-y-0.5 hover:comic-shadow active:translate-y-0.5 active:comic-shadow-none";

const variants: Record<Variant, string> = {
  primary: `border-2 border-accent bg-accent font-bold text-white comic-shadow-sm hover:bg-accent-hover ${press}`,
  secondary: `border-2 border-accent bg-white font-bold text-accent comic-shadow-sm ${press}`,
  ghost: "font-medium text-ink-muted hover:bg-sakura-soft hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export function buttonStyles(variant: Variant = "primary", size: Size = "md", className = ""): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

interface StyleProps {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: StyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={buttonStyles(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: StyleProps & ComponentProps<typeof Link>) {
  return <Link className={buttonStyles(variant, size, className)} {...props} />;
}

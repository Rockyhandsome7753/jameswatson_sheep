import "./Avatar.css";

type Size = "xs" | "sm" | "md" | "lg";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: Size;
  /** Renders a ring around the avatar (e.g. online / assigned). */
  ring?: boolean;
  className?: string;
  title?: string;
}

/** Deterministic initials from a display name. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Stable hue derived from the name so the same person keeps their color. */
function hue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % 360;
  }
  return h;
}

export function Avatar({
  name,
  src,
  size = "md",
  ring = false,
  className = "",
  title,
}: AvatarProps) {
  const classes = ["avatar", `avatar--${size}`, ring && "avatar--ring", className]
    .filter(Boolean)
    .join(" ");

  if (src) {
    return (
      <span className={classes} title={title ?? name}>
        <img className="avatar__img" src={src} alt={name} loading="lazy" />
      </span>
    );
  }

  const h = hue(name);
  return (
    <span
      className={classes}
      title={title ?? name}
      style={{
        backgroundColor: `hsl(${h} 62% 92%)`,
        color: `hsl(${h} 68% 30%)`,
      }}
      aria-label={name}
      role="img"
    >
      <span className="avatar__initials" aria-hidden="true">
        {initials(name)}
      </span>
    </span>
  );
}

export interface AvatarGroupProps {
  people: { name: string; src?: string }[];
  size?: Size;
  /** Maximum avatars shown before a "+N" chip. */
  max?: number;
}

export function AvatarGroup({ people, size = "sm", max = 3 }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;

  return (
    <div className="avatar-group">
      {shown.map((p, i) => (
        <Avatar key={`${p.name}-${i}`} name={p.name} src={p.src} size={size} />
      ))}
      {overflow > 0 && (
        <span className={`avatar avatar--${size} avatar--overflow`}>
          +{overflow}
        </span>
      )}
    </div>
  );
}

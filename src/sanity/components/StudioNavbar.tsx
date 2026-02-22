import type { NavbarProps } from 'sanity'

export function StudioNavbar(props: NavbarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingLeft: '1rem',
          paddingRight: '0.5rem',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontWeight: 600,
            fontSize: '0.9rem',
            letterSpacing: '0.12em',
            color: '#fff',
          }}
        >
          CB MEDIA
        </span>
        <span
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.08em',
            color: 'rgba(255, 255, 255, 0.45)',
            textTransform: 'uppercase',
          }}
        >
          Studio
        </span>
      </div>
      {props.renderDefault(props)}
    </div>
  )
}

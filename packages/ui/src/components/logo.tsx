import { ComponentProps } from "solid-js"

/**
 * Fraqtal mark: same pixel-frame language as the old glyph (weak floor + base shell),
 * but chamfered bottom-right, slightly off-grid inner panel, and a strong “fragment” chip.
 */
const Block = () => (
  <g data-slot="logo-fraqtal-mark">
    <g data-slot="logo-logo-mark-o" fill="var(--icon-base)">
      <rect x="0" y="6" width="6" height="30" />
      <rect x="0" y="6" width="24" height="6" />
      <rect x="18" y="6" width="6" height="26" />
      <rect x="0" y="30" width="20" height="6" />
      <path d="M20 30h4v2l-4 4z" />
    </g>
    <rect
      data-slot="logo-logo-mark-shadow"
      x="7"
      y="19"
      width="10"
      height="10"
      fill="var(--icon-weak-base)"
    />
    <rect data-slot="logo-fraqtal-chip" x="8" y="13" width="4" height="4" fill="var(--icon-strong-base)" />
  </g>
)

export const Mark = (props: { class?: string }) => {
  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 24 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Block />
    </svg>
  )
}

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 24 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Block />
    </svg>
  )
}

export const Logo = (props: { class?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 172 42"
      fill="none"
      data-component="logo-full"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g>
        <Block />
      </g>
      <text
        class="logo-wordmark"
        x="30"
        y="27"
        fill="var(--icon-strong-base)"
        font-size="17"
      >
        fraqtal code
      </text>
    </svg>
  )
}

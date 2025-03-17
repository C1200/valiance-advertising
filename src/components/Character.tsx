import { PaletteSlot, usePalette } from "./Screen";

export interface CharacterStyle {
  foreground: PaletteSlot;
  background: PaletteSlot;
  character: string;
}

export default function Character(
  props: CharacterStyle & { current?: boolean; onClick?: () => void }
) {
  const palette = usePalette();

  return (
    <span
      className="character"
      aria-selected={props.current ?? false}
      style={{
        color: palette[props.foreground],
        backgroundColor: palette[props.background],
      }}
      onClick={() => {
        props.onClick?.();
      }}
      children={props.character}
    />
  );
}

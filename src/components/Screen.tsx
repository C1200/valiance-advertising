import { createContext, ReactNode, useContext } from "react";

export type PaletteSlot =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f";

export type Palette = {
  [x in PaletteSlot]: string;
};

const ctx = createContext<Palette>({} as Palette);

export function usePalette() {
  return useContext(ctx);
}

export default function Screen(props: {
  width: number;
  height: number;
  palette: Palette;
  children?: ReactNode;
}) {
  return (
    <ctx.Provider value={props.palette}>
      <div
        className="screen"
        style={{
          gridTemplateColumns: `repeat(${props.width}, max-content)`,
          gridTemplateRows: `repeat(${props.height}, max-content)`,
        }}
        children={props.children}
      />
    </ctx.Provider>
  );
}

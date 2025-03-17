import { useCallback, useEffect, useState } from "react";
import Screen, { Palette, PaletteSlot } from "./components/Screen";
import Character, { CharacterStyle } from "./components/Character";

const screenWidth = 18;
const screenHeight = 19;

const defaultPalette: Palette = {
  "0": "#F0F0F0",
  "1": "#F2B233",
  "2": "#E57FD8",
  "3": "#99B2F2",
  "4": "#DEDE6C",
  "5": "#7FCC19",
  "6": "#F2B2CC",
  "7": "#4C4C4C",
  "8": "#999999",
  "9": "#4C99B2",
  a: "#B266E5",
  b: "#3366CC",
  c: "#7F664C",
  d: "#57A64E",
  e: "#CC4C4C",
  f: "#111111",
};

function downloadFile(bytes: number[], filename: string) {
  const buf = new Uint8Array(bytes.length).map((_, i) => bytes[i]);
  const file = new File([buf], filename);
  const url = URL.createObjectURL(file);
  open(url);
}

function exportImage(
  palette: Palette,
  characters: CharacterStyle[],
  filename: string
) {
  const ESC = 0x00;
  const ESCF = 0x66;
  const ESCB = 0x62;
  const ESCP = 0x70;
  const LF = 0x0a;

  const bytes: number[] = [];
  let lastForeground: PaletteSlot | undefined;
  let lastBackground: PaletteSlot | undefined;

  for (const [slot, color] of Object.entries(palette) as [
    PaletteSlot,
    string
  ][]) {
    if (defaultPalette[slot] === color) continue;

    const i = parseInt(color.substring(1), 16);
    const r = (i >> 16) & 0xff;
    const g = (i >> 8) & 0xff;
    const b = i & 0xff;

    bytes.push(ESC, ESCP, slot.charCodeAt(0), r, g, b);
  }

  for (let y = 0; y < screenHeight; y++) {
    for (let x = 0; x < screenWidth; x++) {
      const i = x + screenWidth * y;
      const char = characters[i];

      if (lastForeground !== char.foreground) {
        lastForeground = char.foreground;
        bytes.push(ESC, ESCF, lastForeground.charCodeAt(0));
      }
  
      if (lastBackground !== char.background) {
        lastBackground = char.background;
        bytes.push(ESC, ESCB, lastBackground.charCodeAt(0));
      }
  
      bytes.push(char.character.charCodeAt(0));
    }

    bytes.push(LF);
  }

  downloadFile(bytes, `${filename}-${screenWidth}x${screenHeight}.vcc`);
}

export default function App() {
  const [palette, setPalette] = useState<Palette>(defaultPalette);
  const [characters, setCharacters] = useState<CharacterStyle[]>([]);
  const [currentChar, setCurrentChar] = useState<number | null>(null);
  const [imageName, setImageName] = useState<string>("");

  const onKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      const maxPos = screenWidth * screenHeight;

      setCurrentChar((currentChar) => {
        if (currentChar === null || document.activeElement !== document.body)
          return null;

        if (
          (ev.ctrlKey || ev.altKey) &&
          Object.keys(palette).includes(ev.key.toLowerCase())
        ) {
          ev.preventDefault();

          setCharacters((characters) => {
            const copy = structuredClone(characters);
            const property = ev.altKey ? "background" : "foreground";
            copy[currentChar][property] = ev.key.toLowerCase() as PaletteSlot;
            return copy;
          });

          return (currentChar + 1) % maxPos;
        } else if (ev.key === "ArrowLeft") {
          ev.preventDefault();

          if (currentChar === 0) return maxPos - 1;
          return currentChar - 1;
        } else if (ev.key === "ArrowRight") {
          ev.preventDefault();
          return (currentChar + 1) % maxPos;
        } else if (ev.key.length === 1 && !ev.ctrlKey && !ev.altKey) {
          ev.preventDefault();

          setCharacters((characters) => {
            const copy = structuredClone(characters);
            copy[currentChar].character = ev.key;
            return copy;
          });

          return (currentChar + 1) % maxPos;
        }

        return currentChar;
      });
    },
    [palette]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  useEffect(() => {
    const target = screenWidth * screenHeight;

    if (characters.length !== target) {
      setCurrentChar(null);
      setCharacters(
        Array(target)
          .fill(null)
          .map(
            () =>
              ({
                foreground: "0",
                background: "f",
                character: " ",
              } satisfies CharacterStyle)
          )
      );
    }
  }, [characters]);

  return (
    <>
      <h2>Editor</h2>
      <Screen width={screenWidth} height={screenHeight} palette={palette}>
        {characters.map((char, idx) => (
          <Character
            key={idx}
            current={currentChar === idx}
            onClick={() => {
              setCurrentChar(idx);
            }}
            {...char}
          />
        ))}
      </Screen>

      <h2>Palette</h2>
      <div className="palette">
        {Object.entries(palette).map(([slot, color]) => (
          <div className="palette-input">
            <label htmlFor={`slot-${slot}`}>{slot}</label>
            <input
              type="color"
              id={`slot-${slot}`}
              value={color}
              onChange={(ev) => {
                const { value } = ev.currentTarget;
                setPalette((prev) => ({
                  ...prev,
                  [slot]: value,
                }));
              }}
            />
          </div>
        ))}
      </div>

      <h2>Export</h2>
      <input
        type="text"
        placeholder="Image name"
        value={imageName}
        onInput={(ev) => {
          setImageName(ev.currentTarget.value);
        }}
      />
      <button
        type="button"
        onClick={() => {
          exportImage(palette, characters, imageName.trim() || "image");
        }}
      >
        Export
      </button>
    </>
  );
}

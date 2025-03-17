# Valiance Advertising

## VCC File Format

The VCC File Format is based on ANSI escape sequences. The null character (0x00)
will start an escape sequence. Any other character encountered outside an escape
sequence should be rendered normally with the previously specified formatting.

Following the null character is a command byte, after which an amount of
arguments specific to each command will appear. Below is a reference of all of
the commands:

- Foreground (text) color
  - **Command byte:** f (0x66)
  - **Arguments:** [1 byte] palette slot
- Background color
  - **Command byte:** b (0x62)
  - **Arguments:** [1 byte] palette slot
- Set palette slot color
  - **Command byte:** p (0x70)
  - **Arguments:** [1 byte] palette slot, [1 byte] red, [1 byte] blue, [1 byte]
    green
  - **Notes:** should apply globally, even to already written text

Because of the limited color palette in CC, palette slots are used. These are
represented using the ASCII characters (not hex numbers) 0-9 and a-f
(lowercase).  It should be assumed that by default the palette is set to the one
outlined in [this documentation](https://tweaked.cc/module/colors.html).

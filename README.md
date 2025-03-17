# Valiance Advertising

## Usage

- Editor: https://valiance-advertising.vercel.app/
- CC: run `wget https://valiance-advertising.vercel.app/cc/startup.lua`

## Image Indexing

Images are indexed using a JSON file. Here's an example:
```json
{
  "default": {
    "files": [
      "https://valiance-advertising.vercel.app/cc/valiance-ads",
      "https://valiance-advertising.vercel.app/cc/valiance-proud",
      "https://valiance-advertising.vercel.app/cc/valiance-service-update"
    ]
  },
  "lavender-valley": {
    "files": [
      "https://valiance-advertising.vercel.app/cc/lavender-valley"
    ]
  }
}
```

On the top level, locations can be defined. After changing the location property
in your startup.lua file, the monitor will only display advertisements from the
location specified, as well as the ones that appear in the "default" location.

Under each location, there is an array called files. This specifies where to
find each image. When an image is fetched, a suffix is added which looks like
this: `-18x19.vcc`, where the 18 and 19 are replaced by the width and height of
the monitor. This allows for dynamically sized advertisements. The board fails
to obtain an image, the file should be skipped.

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

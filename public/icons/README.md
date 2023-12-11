# Generating Icons

This stack provides icons in multiple formats (svg, png) and multiple sizes
(16x16, 32x32, and 180x180). In order to auto generate those icons I exported my
icon in a svg format and used the following command to generate the png icons
from it:

```bash
  for x in 16 32 180 ; do /Applications/Inkscape.app/Contents/MacOS/inkscape --export-type=png -o favicon-${x}x${x}.png -w ${x} logo.svg; done
```

Note that you have to have `Inkscape` installed on your computer, also if you
have the `inkscape` binary on `$PATH` you don't have to use the awkward path as
I did ;)

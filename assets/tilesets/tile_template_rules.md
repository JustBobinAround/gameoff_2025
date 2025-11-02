# Tile Template Rules

- Each tile is 64x64 pixels
- A standard full tile set should be composed of 16 tiles which will total to 256x256 pixels
- A blending/pixel randomizer tool should be used over the entire tileset to help obfuscate tile separation
- The black sections of the template are what should be "filled in"
- Each "connecting edge center" of a tile will be at the 32 pixel mark
- Each connecting edge should overfill by **exactly** 2 solid pixels past the 32 pixel mark.
- Tiles with "depth" (e.g. walls) should replace their 2 solid pixels past the 32 pixel mark with a shadow.
  - Shadows should be a dark grey color leaning more towards mostly black.
  - The shadows opacity should be around 65%
  - Bottom horizontal and diagonal borders should get 3 pixels thick shadow
  - Vertical borders should recieve 1 pixel. This technically doesn't make sense from a rendering perspective, but it makes the image pop.

### Start with template
![template_tile_example](./tile_template.png)
### Fill with pattern
![template_tile_example](./floor_textures/dirt.png)
### At the connection between two tiles, make sure each tile over extends by 2 pixels
![template_tile_example](./template_tile_example.png)
### Depth example
![wall_example](./dungeon_walls/stone_and_iron.png)

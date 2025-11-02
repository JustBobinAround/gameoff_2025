# GAMEOFF 2025

## Dev Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run
scripts via `npm` (if you want to use the development server).

## Available Repo Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |

## Important notes about importmap

- You **MUST** use the `phaser.esm` build of Phaser. This is the only build that
exports ES Modules that importmap supports.

- Phaser v3.60.0 was the first version to export an ESM bundle. You cannot use
earlier versions with this template.

- The 'name' you give in the importmap (in your `index.html`) should match
exactly that used in the `import` declarations within your game code.

- You can store the Phaser ESM build locally if you'd rather not use the CDN.
Simply put the `phaser.esm.js` in your local folder structure and reference that
inside your HTML like this:

```js
{
    "imports": {
        "phaser": "./my-local-folder/phaser.esm.js"
    }
}
```

## Project Structure

- `assets/` - Contains the static assets used by the game. Please see [ASSET_CONTRIBUTING_RULES.md](./assets/ASSET_CONTRIBUTING_RULES.md).
- `src/` - Contains the game source code.
    - General code exports with multiple function and class exports should have camel_case file names.
    e.g. `some_src_file.js`. Most files should be at the root `/src` level, but use best judgement.
    - Code export for a singular class without any other exports should have a file name matching
    the class name which should be CamelCase with a starting capital e.g. `SomeClass.js`
- `src/scenes/` - The Phaser Scenes are in this folder.
    - Scenes should follow CamelCase with first letter being captialized e.g. `SomeScene.js`
- `src/main.js` - The main entry point. This contains the game configuration and starts the game.
- `index.html` - This should pretty much never need editing.
- `style.css` - This should pretty much never need editing.

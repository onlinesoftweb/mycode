# Quick Reference Guide - Ants RTS Project

A handy cheat sheet for working with the Ants RTS codebase.

---

## 📁 File Locations

| What | Where |
|------|-------|
| Game Plugin | `plugins/ants-rts-game/ants-rts-game.php` |
| Game JavaScript | `plugins/ants-rts-game/assets/ants.js` |
| Game CSS | `plugins/ants-rts-game/assets/ants.css` |
| Map Editor | `plugins/ants-rts-map-editor/ants-rts-map-editor.php` |

---

## 🎮 Game Configuration

### Grid Settings (Lines 14-16)
```php
define('ANTS_COLS', 94);    // Number of columns
define('ANTS_ROWS', 94);    // Number of rows
define('ANTS_TILE', 64);    // Tile size in pixels
```

**Total tiles**: 94 × 94 = 8,836  
**World size**: 6,016px × 6,016px

---

## 🗄️ Database Options

| Option Name | What It Stores |
|-------------|----------------|
| `ants_rts_maps` | All saved maps |
| `ants_rts_current` | Currently active map slug |
| `ants_rts_sprites` | Ant and building images |
| `ants_rts_videos` | Intro/win/lose videos |
| `ants_rts_sounds` | Sound effect URLs |

### Access in PHP
```php
// Get data
$maps = get_option('ants_rts_maps');

// Save data
update_option('ants_rts_maps', $data, false);
```

---

## 🐜 Sprite Types

### Ant Roles
- `fighter` - Combat ant
- `food` - Collects food
- `gold` - Collects gold
- `builder` - Constructs buildings
- `fire` - Fire ant (special)
- `bomber` - Bomber ant (special)
- `queen` - Queen ant
- `nest` - Base/nest tile

### Buildings
- `barracks` - Train units
- `upgrade` - Upgrade center
- `hospital` - Heal units

### Trap Decorations
- `fireTile` - Fire trap graphic
- `bombTile` - Bomb trap graphic

---

## 🗺️ Tile Properties

### Walkability (gridWalk array)
- `W` = **Walk** - Normal movement
- `S` = **Slow** - Reduced speed
- `B` = **Block** - Impassable

### Tags (gridTags array)
- `NONE` = Regular tile
- `BASE` = Starting location
- `FOOD` = Food resource spawn
- `GOLD` = Gold resource spawn
- `BONUS` = Bonus item location

---

## 🔌 WordPress Integration

### Register Plugin
```php
/*
Plugin Name: My Plugin
Description: What it does
Version: 1.0
*/
```

### Create Shortcode
```php
add_shortcode('my_shortcode', function() {
    return '<div>Hello World!</div>';
});
```

### Load CSS/JS
```php
// Register files
wp_register_style('my-css', $url, [], '1.0');
wp_register_script('my-js', $url, [], '1.0', true);

// Load files
wp_enqueue_style('my-css');
wp_enqueue_script('my-js');
```

### Pass Data to JavaScript
```php
wp_localize_script('my-js', 'MY_DATA', [
    'setting1' => 'value1',
    'setting2' => 'value2'
]);
```
Access in JavaScript: `MY_DATA.setting1`

### WordPress Hooks
```php
// Run during WordPress initialization
add_action('init', 'my_function');

// Load scripts
add_action('wp_enqueue_scripts', 'my_function');

// Admin menu
add_action('admin_menu', 'my_function');
```

---

## 🎨 Common CSS Classes

### Game Container
```css
.ants-root { }          /* Main game container */
#ants-view { }          /* Game canvas */
#ants-hud { }           /* UI overlay canvas */
```

### Navigation
```css
.ants-pad { }           /* Navigation button grid */
.ants-edge { }          /* Edge pan areas */
```

### Map Editor
```css
.cell { }               /* Individual tile */
.sel { }                /* Selected tile */
.walk-W { }             /* Walkable tile style */
.walk-S { }             /* Slow tile style */
.walk-B { }             /* Blocked tile style */
```

---

## 🔧 Common Tasks

### Change Grid Size
1. Edit lines 14-15 in `ants-rts-game.php`:
   ```php
   define('ANTS_COLS', 50);  // Change from 94
   define('ANTS_ROWS', 50);  // Change from 94
   ```
2. Edit same lines (lines 11-12) in `ants-rts-map-editor.php`

### Change Tile Size
1. Edit lines 16 in `ants-rts-game.php` and lines 13 in `ants-rts-map-editor.php`:
   ```php
   define('ANTS_TILE', 32);  // Change from 64
   ```

### Add New Sprite Type
1. Add to `ants_get_sprites()` function (around line 50):
   ```php
   'myNewAnt' => '',
   ```
2. Add to editor UI (around line 550):
   ```php
   ['myNewAnt', 'My New Ant'],
   ```
3. Add to save function (around line 268):
   ```php
   'myNewAnt' => sanitize_text_field($_POST['ants_sprite_myNewAnt']??''),
   ```

### Add New Tile Tag
1. Update validation in `ants_normalize_payload()` (line 57):
   ```php
   $g = in_array($g, ['NONE','BASE','FOOD','GOLD','BONUS','MYTYPE'], true) ? $g : 'NONE';
   ```
2. Add button in editor UI (line 374+):
   ```html
   <button type="button" class="tag-btn" id="btnMyType">My Type</button>
   ```
3. Add JavaScript handler (line 491+):
   ```javascript
   document.getElementById('btnMyType').onclick = () => { 
     const t = targetsForAction(); 
     if(!t.length) return; 
     t.forEach(i => { tags[i] = 'MYTYPE'; paint(i); }); 
   };
   ```

---

## 🐛 Debug Tips

### View PHP Errors
Enable WordPress debug mode in `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```
Check logs in: `wp-content/debug.log`

### View JavaScript Errors
1. Press **F12** to open browser console
2. Go to **Console** tab
3. Look for red error messages

### Check Data Storage
```php
// View what's stored
var_dump(get_option('ants_rts_maps'));
```

### Test JavaScript Variables
In browser console:
```javascript
console.log(ANTS_BOOT);      // Map data
console.log(ANT_SPRITES);    // Sprite URLs
console.log(ANT_VIDEOS);     // Video URLs
console.log(ANT_SOUNDS);     // Sound URLs
```

---

## 📝 Code Snippets

### Loop Through Tiles (PHP)
```php
$total = ants_total();  // 8,836
for ($i = 0; $i < $total; $i++) {
    $tile = $tiles[$i];
    $walk = $walk[$i];
    $tag = $tags[$i];
    // Do something...
}
```

### Loop Through Tiles (JavaScript)
```javascript
const TOTAL = COLS * ROWS;
for (let i = 0; i < TOTAL; i++) {
    const tile = tiles[i];
    const walk = walk[i];
    const tag = tags[i];
    // Do something...
}
```

### Get Tile at Position
```javascript
// Convert row/col to index
function getIndex(row, col) {
    return row * COLS + col;
}

// Convert index to row/col
function getRowCol(index) {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    return { row, col };
}
```

### Check Adjacent Tiles
```javascript
function getNeighbors(index) {
    const { row, col } = getRowCol(index);
    const neighbors = [];
    
    if (row > 0) neighbors.push(getIndex(row - 1, col));           // Up
    if (row < ROWS - 1) neighbors.push(getIndex(row + 1, col));    // Down
    if (col > 0) neighbors.push(getIndex(row, col - 1));           // Left
    if (col < COLS - 1) neighbors.push(getIndex(row, col + 1));    // Right
    
    return neighbors;
}
```

---

## 🎯 Keyboard Shortcuts

### Browser Console
- **F12** - Open/close developer tools
- **Ctrl+Shift+C** - Inspect element
- **Ctrl+Shift+J** - Open console directly

### Code Editor (VS Code)
- **Ctrl+/** - Toggle comment
- **Ctrl+F** - Find in file
- **Ctrl+H** - Find and replace
- **Ctrl+D** - Select next occurrence
- **Alt+Up/Down** - Move line up/down
- **Shift+Alt+Down** - Duplicate line

---

## 🔍 Where to Find Things

### Game Rendering Logic
`plugins/ants-rts-game/assets/ants.js`

### Map Editor Interface
`plugins/ants-rts-map-editor/ants-rts-map-editor.php` (lines 334-548)

### Sprite Management
`plugins/ants-rts-map-editor/ants-rts-map-editor.php` (lines 550-620)

### Video/Sound Management
`plugins/ants-rts-map-editor/ants-rts-map-editor.php` (lines 622-721)

### CSS Styling
`plugins/ants-rts-game/assets/ants.css`

### Database Functions
- Get: Lines 23-32 in both plugin files
- Set: Lines 30-32 in `ants-rts-map-editor.php`

---

## 💡 Quick Fixes

### Game Not Showing
```php
// Check plugins are active
// Check shortcode is correct: [ants_game]
// View browser console for errors (F12)
```

### Map Not Saving
```php
// Verify you clicked "Save Map"
// Check WordPress can write to database
// Check for PHP errors in debug.log
```

### Images Not Loading
```html
<!-- Check image URL is accessible -->
<!-- Verify in browser network tab (F12) -->
<!-- Make sure path is correct -->
```

### Changes Not Appearing
```bash
# Clear browser cache (Ctrl+Shift+R)
# Clear WordPress cache
# Check file is saved
# Verify correct file was edited
```

---

## 📊 Data Structure

### Map Data Format
```javascript
{
    gridCols: 94,
    gridRows: 94,
    gridTiles: [ /* 8836 image URLs */ ],
    gridWalk: [ /* 8836 values: W, S, or B */ ],
    gridTags: [ /* 8836 values: NONE, BASE, FOOD, GOLD, BONUS */ ],
    settings: {
        tileSize: 64,
        normalSpeed: 1.0,
        slowMultiplier: 0.5,
        bonusAuto: false,
        bonusCount: 0
    }
}
```

### Sprites Data Format
```javascript
{
    fighter: 'url',
    food: 'url',
    gold: 'url',
    builder: 'url',
    fire: 'url',
    bomber: 'url',
    queen: 'url',
    nest: 'url',
    barracks: 'url',
    upgrade: 'url',
    hospital: 'url',
    fireTile: 'url',
    bombTile: 'url'
}
```

---

## 🚀 Performance Tips

### Optimize Large Grids
- Use typed arrays for large datasets
- Batch canvas operations
- Only redraw changed areas
- Use requestAnimationFrame for smooth updates

### Reduce Database Queries
- Cache options data
- Use transients for temporary data
- Batch updates when possible

---

## 📚 Related Docs

- **README.md** - Project overview
- **GETTING_STARTED.md** - Setup instructions
- **LEARNING_RESOURCES.md** - Tutorials and courses

---

## ✨ Tips

- **Comment your code** - Future you will thank you
- **Test changes** - Always verify in browser
- **Use version control** - Commit frequently
- **Start small** - Make one change at a time
- **Read error messages** - They usually tell you what's wrong
- **Google is your friend** - Search for solutions

---

**Keep this handy while coding! 🎮**

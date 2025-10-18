# Code Examples - Learn by Doing

Practical code examples to help you understand and modify the Ants RTS project.

---

## 🎨 CSS Examples

### Example 1: Change Game Background Color

**File**: `plugins/ants-rts-game/assets/ants.css`

**Find this** (approximate line):
```css
.ants-root {
    background: #1a1f2e;
}
```

**Change to**:
```css
.ants-root {
    background: #2c3e50;  /* Darker blue-gray */
}
```

**Or try**:
```css
.ants-root {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  /* Purple gradient */
}
```

---

### Example 2: Style Navigation Buttons

**File**: `plugins/ants-rts-game/assets/ants.css`

**Add this**:
```css
.ants-pad button {
    background: #3498db;      /* Blue background */
    color: white;             /* White text */
    border: 2px solid #2980b9;/* Darker blue border */
    border-radius: 8px;       /* Rounded corners */
    padding: 10px;            /* Inner spacing */
    font-size: 18px;          /* Larger text */
    cursor: pointer;          /* Pointer cursor on hover */
    transition: all 0.3s;     /* Smooth transitions */
}

.ants-pad button:hover {
    background: #2980b9;      /* Darker on hover */
    transform: scale(1.1);    /* Slightly bigger on hover */
}
```

---

### Example 3: Add a Custom Font

**File**: `plugins/ants-rts-game/assets/ants.css`

**At the top, add**:
```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.ants-root {
    font-family: 'Press Start 2P', cursive;  /* Retro game font */
}
```

---

## 🐘 PHP Examples

### Example 4: Add a Custom Message to Game Page

**File**: `plugins/ants-rts-game/ants-rts-game.php`

**Find** (around line 152):
```php
ob_start(); ?>
  <div class="ants-root" id="ants-root" data-ants>
```

**Change to**:
```php
ob_start(); ?>
  <div style="text-align:center; padding:20px; background:#f0f0f0; border-radius:10px; margin-bottom:20px;">
    <h2>🐜 Welcome to Ants RTS!</h2>
    <p>Control your ant colony and gather resources to victory!</p>
  </div>
  <div class="ants-root" id="ants-root" data-ants>
```

---

### Example 5: Display Current Map Name

**File**: `plugins/ants-rts-game/ants-rts-game.php`

**Add before the game HTML** (around line 152):
```php
ob_start(); 
$currentMap = ants_get_current();
$maps = ants_get_maps();
$mapName = isset($maps[$currentMap]) ? $maps[$currentMap]['name'] : 'Default Map';
?>
  <div style="padding:10px; background:#2c3e50; color:white; text-align:center;">
    <strong>Current Map:</strong> <?php echo esc_html($mapName); ?>
  </div>
  <div class="ants-root" id="ants-root" data-ants>
```

---

### Example 6: Add a Custom Tile Count Function

**File**: `plugins/ants-rts-game/ants-rts-game.php`

**Add this function** (after the helper functions, around line 38):
```php
// Count how many tiles are filled with images
function ants_count_filled_tiles() {
    $maps = ants_get_maps();
    $current = ants_get_current();
    
    if ($current && isset($maps[$current])) {
        $tiles = $maps[$current]['data']['gridTiles'];
        $filled = 0;
        foreach ($tiles as $tile) {
            if (!empty($tile)) {
                $filled++;
            }
        }
        return $filled;
    }
    return 0;
}

// Use it:
// echo ants_count_filled_tiles() . ' tiles filled';
```

---

## 💛 JavaScript Examples

### Example 7: Log Map Data to Console

**File**: `plugins/ants-rts-game/assets/ants.js`

**Add at the beginning of the file**:
```javascript
// Debug: Log map data when game loads
console.log('=== ANTS GAME DEBUG ===');
console.log('Map Data:', ANTS_BOOT);
console.log('Total Tiles:', ANTS_BOOT.gridCols * ANTS_BOOT.gridRows);
console.log('Sprites:', ANT_SPRITES);
console.log('Videos:', ANT_VIDEOS);
console.log('Sounds:', ANT_SOUNDS);
```

**How to view**: Press F12 → Console tab

---

### Example 8: Count Tile Types

**Add this JavaScript** anywhere in your game logic:
```javascript
function countTileTypes() {
    const counts = { W: 0, S: 0, B: 0 };
    
    for (let i = 0; i < ANTS_BOOT.gridWalk.length; i++) {
        const type = ANTS_BOOT.gridWalk[i];
        counts[type]++;
    }
    
    console.log('Walkable tiles:', counts.W);
    console.log('Slow tiles:', counts.S);
    console.log('Blocked tiles:', counts.B);
    
    return counts;
}

// Call it
countTileTypes();
```

---

### Example 9: Highlight Specific Tag Types

**Add this to make all FOOD tags glow**:
```javascript
function highlightResourceTiles() {
    const tags = ANTS_BOOT.gridTags;
    
    for (let i = 0; i < tags.length; i++) {
        if (tags[i] === 'FOOD') {
            console.log('Food resource at tile:', i);
            // You can highlight this tile in the game
        }
    }
}
```

---

## 🗺️ Map Editor Examples

### Example 10: Add a "Fill Pattern" Button

**File**: `plugins/ants-rts-map-editor/ants-rts-map-editor.php`

**Find** (around line 361):
```html
<button type="button" class="button" id="btnFillEmpty">Fill Empty with Selected</button>
```

**Add after**:
```html
<button type="button" class="button" id="btnCheckerboard">Create Checkerboard</button>
```

**Then add JavaScript** (around line 510):
```javascript
document.getElementById('btnCheckerboard').onclick = () => {
    pickOneFromMedia(url => {
        let filled = 0;
        for (let i = 0; i < TOTAL; i++) {
            // Checkerboard pattern: alternate tiles
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            if ((row + col) % 2 === 0) {
                tiles[i] = url;
                paint(i);
                filled++;
            }
        }
        alert('Created checkerboard with ' + filled + ' tiles.');
    });
};
```

---

### Example 11: Add a "Clear Tags" Button

**File**: `plugins/ants-rts-map-editor/ants-rts-map-editor.php`

**Add button** (around line 378):
```html
<button type="button" class="tag-btn" id="btnClearTags">Clear All Tags</button>
```

**Add JavaScript** (around line 491):
```javascript
document.getElementById('btnClearTags').onclick = () => {
    if (!confirm('Clear all tags? This will set all tiles to NONE.')) return;
    for (let i = 0; i < TOTAL; i++) {
        tags[i] = 'NONE';
        paint(i);
    }
    alert('All tags cleared!');
};
```

---

### Example 12: Keyboard Shortcuts for Map Editor

**Add this JavaScript** (around line 546):
```javascript
// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'W' for Walk
    if (e.key === 'w' || e.key === 'W') {
        const t = targetsForAction();
        if (t.length) t.forEach(i => { walk[i] = 'W'; paint(i); });
    }
    
    // Press 'S' for Slow
    if (e.key === 's' || e.key === 'S') {
        const t = targetsForAction();
        if (t.length) t.forEach(i => { walk[i] = 'S'; paint(i); });
    }
    
    // Press 'B' for Block
    if (e.key === 'b' || e.key === 'B') {
        const t = targetsForAction();
        if (t.length) t.forEach(i => { walk[i] = 'B'; paint(i); });
    }
    
    // Press 'Delete' to clear selected
    if (e.key === 'Delete') {
        const t = [...sel];
        if (t.length) {
            setMany(t, i => { tiles[i] = ''; walk[i] = 'W'; tags[i] = 'NONE'; });
            sel.clear();
        }
    }
});
```

---

## 🎮 Game Logic Examples

### Example 13: Display Tile Info on Click

**Add this to capture clicks on the game canvas**:
```javascript
const canvas = document.getElementById('ants-view');

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert pixel coordinates to tile coordinates
    const col = Math.floor(x / ANTS_BOOT.settings.tileSize);
    const row = Math.floor(y / ANTS_BOOT.settings.tileSize);
    const index = row * ANTS_BOOT.gridCols + col;
    
    console.log('Clicked tile:', index);
    console.log('Position:', { row, col });
    console.log('Walk type:', ANTS_BOOT.gridWalk[index]);
    console.log('Tag:', ANTS_BOOT.gridTags[index]);
});
```

---

### Example 14: Find All Resource Tiles

**Use this to locate all FOOD, GOLD, etc.**:
```javascript
function findResourceTiles() {
    const resources = {
        FOOD: [],
        GOLD: [],
        BONUS: []
    };
    
    for (let i = 0; i < ANTS_BOOT.gridTags.length; i++) {
        const tag = ANTS_BOOT.gridTags[i];
        if (resources[tag]) {
            resources[tag].push(i);
        }
    }
    
    console.log('Food tiles:', resources.FOOD.length);
    console.log('Gold tiles:', resources.GOLD.length);
    console.log('Bonus tiles:', resources.BONUS.length);
    
    return resources;
}

// Use it
const resources = findResourceTiles();
```

---

### Example 15: Calculate Distance Between Tiles

**Useful for game AI or pathfinding**:
```javascript
function getTilePosition(index) {
    const row = Math.floor(index / ANTS_BOOT.gridCols);
    const col = index % ANTS_BOOT.gridCols;
    return { row, col };
}

function getDistance(index1, index2) {
    const pos1 = getTilePosition(index1);
    const pos2 = getTilePosition(index2);
    
    // Manhattan distance (grid-based)
    const dx = Math.abs(pos2.col - pos1.col);
    const dy = Math.abs(pos2.row - pos1.row);
    return dx + dy;
}

// Example use
const distance = getDistance(0, 100);
console.log('Distance:', distance, 'tiles');
```

---

## 🔧 WordPress Integration Examples

### Example 16: Add Admin Notice

**File**: `plugins/ants-rts-map-editor/ants-rts-map-editor.php`

**Add this function** (around line 190):
```php
function ants_custom_admin_notice() {
    if (!current_user_can('manage_options')) return;
    
    $screen = get_current_screen();
    if ($screen->id === 'toplevel_page_ants-map-editor') {
        echo '<div class="notice notice-info"><p>';
        echo '💡 <strong>Tip:</strong> Use Shift+Click to select multiple tiles!';
        echo '</p></div>';
    }
}
add_action('admin_notices', 'ants_custom_admin_notice');
```

---

### Example 17: Add a Settings Option

**Create a simple toggle setting**:
```php
// Register setting
function ants_register_settings() {
    register_setting('ants_settings', 'ants_debug_mode');
}
add_action('admin_init', 'ants_register_settings');

// Use it
if (get_option('ants_debug_mode')) {
    error_log('Ants RTS: Debug mode is ON');
}
```

---

### Example 18: Create a Custom Shortcode Parameter

**Make shortcode accept map name**: `[ants_game map="my-map"]`

**File**: `plugins/ants-rts-game/ants-rts-game.php`

**Replace shortcode** (around line 116):
```php
add_shortcode('ants_game', function($atts) {
    // Parse attributes
    $atts = shortcode_atts([
        'map' => ''  // Default: empty (use current map)
    ], $atts);
    
    wp_enqueue_style('ants-rts-css');
    wp_enqueue_script('ants-rts-js');
    
    // Load specific map if provided
    if (!empty($atts['map'])) {
        $maps = ants_get_maps();
        if (isset($maps[$atts['map']])) {
            $bootData = $maps[$atts['map']]['data'];
            // Process and localize...
        }
    }
    
    // Rest of the code...
});
```

---

## 🎨 Advanced CSS Examples

### Example 19: Animated Tile Hover Effect

**File**: `plugins/ants-rts-map-editor/ants-rts-map-editor.php`

**Add to CSS** (around line 410):
```css
.cell {
    transition: transform 0.2s, box-shadow 0.2s;
}

.cell:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
```

---

### Example 20: Custom Tag Colors

**Make tags more colorful**:
```css
.cell[data-tag="FOOD"]::before {
    background: linear-gradient(135deg, #b8ffb1 0%, #7eff6a 100%);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
```

---

## 🐛 Debugging Examples

### Example 21: Add Debug Panel

**Add this HTML to your game page**:
```html
<div id="debug-panel" style="position:fixed; top:10px; right:10px; background:rgba(0,0,0,0.8); color:white; padding:10px; border-radius:5px; font-family:monospace; font-size:12px;">
    <div>FPS: <span id="fps">0</span></div>
    <div>Tiles: <span id="tile-count">0</span></div>
    <div>Mouse: <span id="mouse-pos">-</span></div>
</div>

<script>
let lastTime = Date.now();
let frameCount = 0;

function updateDebug() {
    // FPS counter
    frameCount++;
    const now = Date.now();
    if (now - lastTime >= 1000) {
        document.getElementById('fps').textContent = frameCount;
        frameCount = 0;
        lastTime = now;
    }
    
    // Tile count
    const filled = ANTS_BOOT.gridTiles.filter(t => t !== '').length;
    document.getElementById('tile-count').textContent = filled + '/' + (ANTS_BOOT.gridCols * ANTS_BOOT.gridRows);
    
    requestAnimationFrame(updateDebug);
}

updateDebug();

// Track mouse position
document.addEventListener('mousemove', (e) => {
    document.getElementById('mouse-pos').textContent = e.clientX + ',' + e.clientY;
});
</script>
```

---

## 🎓 Learning Exercises

### Exercise 1: Change Grid to 50×50
**Difficulty**: Easy

1. Edit `ants-rts-game.php` lines 14-15
2. Edit `ants-rts-map-editor.php` lines 11-12
3. Test the changes

### Exercise 2: Add "WATER" Tile Type
**Difficulty**: Medium

1. Add to tag validation (example 6)
2. Add button in editor UI
3. Add JavaScript handler
4. Add CSS styling for water tag

### Exercise 3: Create Auto-Save Feature
**Difficulty**: Hard

1. Add JavaScript timer (every 5 minutes)
2. Automatically save map data
3. Show "Last saved: X minutes ago" message

### Exercise 4: Build Mini-Map Display
**Difficulty**: Expert

1. Create small canvas element
2. Draw simplified version of entire map
3. Update in real-time
4. Add click-to-navigate feature

---

## 💡 Pro Tips

1. **Always backup before modifying**: Copy the file first!
2. **Test incrementally**: Make one change, test, then continue
3. **Use console.log()**: Debug by printing values
4. **Read error messages**: They tell you exactly what's wrong
5. **Comment your code**: Explain what you changed and why

---

## 🚀 Next Steps

1. Try each example one at a time
2. Modify them to fit your needs
3. Combine examples to create new features
4. Share what you've created!

**Remember**: Every expert was once a beginner. Keep experimenting! 🎮

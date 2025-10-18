# mycode - Ants RTS Game: A Learning Guide

Welcome! This repository contains an **Ants RTS (Real-Time Strategy) Game** built as WordPress plugins. This guide will help you learn coding by exploring how this project works.

## 📚 What You'll Learn

- **PHP Programming**: Server-side code for WordPress
- **JavaScript**: Interactive game logic and UI
- **HTML/CSS**: Styling and layout
- **WordPress Plugin Development**: How to extend WordPress
- **Game Development Basics**: Canvas rendering, game loops, and state management

---

## 🏗️ Project Structure

```
mycode/
├── README.md (this file)
└── plugins/
    ├── ants-rts-game/          # Frontend game plugin
    │   ├── ants-rts-game.php   # Main plugin file
    │   └── assets/
    │       ├── ants.js         # Game JavaScript
    │       └── ants.css        # Game styles
    └── ants-rts-map-editor/    # Backend map editor plugin
        └── ants-rts-map-editor.php  # Admin interface
```

---

## 🎮 What This Project Does

This is a **browser-based RTS game** where players control ants! The project consists of two WordPress plugins:

1. **Game Plugin** (`ants-rts-game`): The playable game on the frontend
2. **Map Editor Plugin** (`ants-rts-map-editor`): Admin tool to create game maps

---

## 🔧 Key Concepts Explained

### 1. WordPress Plugins
WordPress plugins are PHP files that extend WordPress functionality. They start with a comment header:

```php
/*
Plugin Name: Ants RTS — Game (Front-end)
Description: Front-end canvas RTS for Ants
Version: 2.8.1
*/
```

### 2. Shortcodes
Shortcodes let you insert dynamic content. This game uses `[ants_game]`:
```php
add_shortcode('ants_game', function(){
    // Returns HTML that displays the game
});
```

### 3. WordPress Hooks
Hooks let you add functionality at specific points:
- `add_action('init', 'function_name')` - Runs during WordPress initialization
- `add_action('wp_enqueue_scripts', 'function_name')` - Loads CSS/JS files

### 4. Canvas-Based Game
The game uses HTML Canvas for rendering:
```html
<canvas id="ants-view"></canvas>
```
JavaScript draws the game world, characters, and UI on this canvas.

### 5. Data Storage
The game stores data using WordPress Options API:
- Maps: `get_option('ants_rts_maps')`
- Sprites: `get_option('ants_rts_sprites')`
- Videos: `get_option('ants_rts_videos')`
- Sounds: `get_option('ants_rts_sounds')`

---

## 🚀 Getting Started

### Prerequisites
- Local WordPress installation (XAMPP, MAMP, or Local by Flywheel)
- Basic understanding of HTML, CSS, and JavaScript
- Text editor (VS Code, Sublime Text, etc.)

### Installation Steps

1. **Install WordPress locally** (if you haven't already)

2. **Copy plugins to WordPress**:
   ```bash
   # Copy the plugins folder to your WordPress installation
   cp -r plugins/* /path/to/wordpress/wp-content/plugins/
   ```

3. **Activate plugins**:
   - Log in to WordPress admin
   - Go to Plugins → Installed Plugins
   - Activate both "Ants RTS - Game" and "Ants RTS - Map Editor"

4. **Create a game page**:
   - Go to Pages → Add New
   - Add the shortcode: `[ants_game]`
   - Publish the page
   - View the page to see the game!

5. **Create maps**:
   - Go to WordPress admin → Ants Editor
   - Click tiles to add images
   - Use buttons to set walkable/blocked areas
   - Save your map

---

## 📖 Learning Path

### Beginner Level
1. **Explore the README** (you're here!)
2. **View the HTML structure** in `ants-rts-game.php` (lines 126-148)
3. **Look at CSS styles** in `assets/ants.css`
4. **Study the shortcode function** (lines 116-149 in `ants-rts-game.php`)

### Intermediate Level
1. **Understand data flow**: PHP → JavaScript via `wp_localize_script()`
2. **Study the grid system**: 94×94 tiles at 64px each
3. **Learn about game state**: tiles, walk data, tags (BASE, FOOD, GOLD, BONUS)
4. **Explore the map editor UI**: Interactive grid creation (lines 390-548)

### Advanced Level
1. **Study game logic** in `assets/ants.js`
2. **Understand Canvas rendering**
3. **Learn about game optimization**: Sprite handling, event loops
4. **Explore WordPress integration**: Hooks, options API, admin pages

---

## 💡 Code Concepts Breakdown

### PHP Functions Used

| Function | Purpose | Example |
|----------|---------|---------|
| `get_option()` | Retrieve stored data | `get_option('ants_rts_maps')` |
| `update_option()` | Save data | `update_option('ants_rts_maps', $data)` |
| `wp_enqueue_script()` | Load JavaScript | `wp_enqueue_script('ants-rts-js')` |
| `wp_localize_script()` | Pass PHP data to JS | `wp_localize_script('ants-rts-js', 'ANTS_BOOT', $data)` |
| `add_shortcode()` | Create shortcode | `add_shortcode('ants_game', function(){})` |

### JavaScript Concepts

- **DOM Manipulation**: Creating and styling elements
- **Event Listeners**: Responding to clicks, keypresses
- **Canvas API**: Drawing graphics
- **JSON**: Storing and transferring game data
- **Arrays**: Managing grid tiles (94×94 = 8,836 tiles!)

### CSS Techniques

- **Grid Layout**: `display: grid` for tile arrangement
- **Flexbox**: `display: flex` for UI components
- **Custom Properties**: CSS variables for theming
- **Animations**: Visual effects and transitions

---

## 🎯 Practice Exercises

1. **Easy**: Change the game's background color in the CSS
2. **Medium**: Add a new button to the navigation pad
3. **Hard**: Modify the grid size from 94×94 to 50×50
4. **Expert**: Add a new tile type (e.g., "WATER")

---

## 🐛 Common Issues & Solutions

### Game doesn't appear
- Make sure plugins are activated
- Check that shortcode `[ants_game]` is on the page
- View browser console for JavaScript errors

### Map editor not saving
- Verify WordPress has write permissions
- Check PHP error logs
- Ensure you're logged in as admin

### Images not loading
- Verify image URLs are accessible
- Check browser network tab for 404 errors
- Ensure Media Library files exist

---

## 🔗 Resources for Learning

### PHP & WordPress
- [WordPress Plugin Developer Handbook](https://developer.wordpress.org/plugins/)
- [PHP Manual](https://www.php.net/manual/)
- [WordPress Codex](https://codex.wordpress.org/)

### JavaScript & Canvas
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [Canvas API Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)

### General Web Development
- [HTML Basics](https://developer.mozilla.org/en-US/docs/Learn/HTML)
- [CSS Basics](https://developer.mozilla.org/en-US/docs/Learn/CSS)

---

## 🤝 Contributing

This is a learning project! Feel free to:
- Experiment with the code
- Add new features
- Improve documentation
- Share what you've learned

---

## 📝 Next Steps

1. **Set up your environment**: Install WordPress locally
2. **Install the plugins**: Copy files to WordPress
3. **Explore the code**: Start with simple files first
4. **Make small changes**: Test and learn from experiments
5. **Build something new**: Use this as a foundation for your own game!

---

## ❓ Need Help?

- Read the inline code comments
- Check WordPress developer documentation
- Search for specific functions online
- Break down problems into smaller pieces
- Test changes one at a time

---

**Remember**: Everyone starts as a beginner. The best way to learn is by doing! Start small, experiment, and don't be afraid to make mistakes. Good luck on your coding journey! 🚀
# Getting Started with Ants RTS - A Beginner's Guide

Welcome to your coding journey! This guide will help you set up and explore the Ants RTS game project step-by-step.

## 🎯 What You Need

Before starting, make sure you have:
- A computer (Windows, Mac, or Linux)
- Internet connection
- Basic ability to download and install software

**Don't worry if you're completely new to coding!** We'll guide you through everything.

---

## 📦 Step 1: Install WordPress Locally

To run this game, you need WordPress installed on your computer. Here are the easiest ways:

### Option A: Local by Flywheel (Recommended for Beginners)
1. Download **Local** from: https://localwp.com/
2. Install and open Local
3. Click "Create a new site"
4. Name it "ants-game" (or anything you like)
5. Choose "Preferred" environment
6. Create a username and password (write these down!)
7. Click "Add Site" and wait for it to finish

### Option B: XAMPP
1. Download XAMPP from: https://www.apachefriends.org/
2. Install XAMPP
3. Start Apache and MySQL from the XAMPP control panel
4. Download WordPress from: https://wordpress.org/download/
5. Extract WordPress to `C:\xampp\htdocs\wordpress` (Windows) or `/Applications/XAMPP/htdocs/wordpress` (Mac)
6. Visit http://localhost/wordpress and follow the WordPress installation wizard

---

## 📂 Step 2: Install the Ants RTS Plugins

### Find Your WordPress Plugins Folder

**If using Local by Flywheel:**
- Right-click on your site in Local
- Click "Go to site folder"
- Navigate to: `app/public/wp-content/plugins/`

**If using XAMPP:**
- Navigate to: `C:\xampp\htdocs\wordpress\wp-content\plugins\` (Windows)
- Or: `/Applications/XAMPP/htdocs/wordpress/wp-content/plugins/` (Mac)

### Copy the Plugin Files

1. Download or clone this repository
2. Copy the entire `plugins` folder contents:
   - Copy `ants-rts-game` folder to your WordPress plugins folder
   - Copy `ants-rts-map-editor` folder to your WordPress plugins folder

Your plugins folder should now look like:
```
plugins/
├── ants-rts-game/
├── ants-rts-map-editor/
└── (other WordPress plugins...)
```

---

## ⚡ Step 3: Activate the Plugins

1. Open your WordPress admin panel:
   - **Local by Flywheel**: Click "WP Admin" in Local, or go to http://ants-game.local/wp-admin
   - **XAMPP**: Go to http://localhost/wordpress/wp-admin

2. Log in with the username and password you created

3. In the left sidebar, click **Plugins** → **Installed Plugins**

4. You should see:
   - "Ants RTS — Game (Front-end)"
   - "Ants RTS — Map Editor (Admin)"

5. Click **Activate** under each plugin

✅ Success! The plugins are now active.

---

## 🎮 Step 4: Create a Game Page

Now let's create a page where the game will appear:

1. In WordPress admin, click **Pages** → **Add New**

2. Title your page: "Ants Game" (or any name you like)

3. In the content area, type:
   ```
   [ants_game]
   ```
   This is called a "shortcode" - it tells WordPress to insert the game here.

4. Click **Publish** (top right)

5. Click **View Page** to see your game!

🎉 **You should now see the game on your page!**

---

## 🗺️ Step 5: Create Your First Map

The game needs a map to play on. Let's create one!

1. In WordPress admin sidebar, look for **Ants Editor** (it has a grid icon)

2. Click on it to open the map editor

3. You'll see:
   - A large grid (94×94 tiles)
   - Buttons for "Walk", "Slow", "Block"
   - Buttons for "Base", "Food", "Gold", "Bonus"

### Understanding the Map Editor

- **Click a tile** to assign an image (opens WordPress Media Library)
- **Shift+Click** to select multiple tiles
- **Walk/Slow/Block** buttons control if ants can walk there:
  - **Walk (W)**: Ants can walk normally
  - **Slow (S)**: Ants walk slowly
  - **Block (B)**: Ants cannot walk here
- **Tags** mark special tiles:
  - **Base**: Starting location
  - **Food**: Food resource
  - **Gold**: Gold resource
  - **Bonus**: Bonus items

### Creating a Simple Map

1. Click a few tiles in the grid
2. In the Media Library popup, upload or select an image (grass, stone, etc.)
3. Click "Use this image"
4. The tile now shows your image!
5. Click the **Walk** button (this makes the tile walkable)
6. Click **💾 Save Map** at the top
7. In "New Map Name", type "My First Map"
8. Click **💾 Save Map** again

✅ Your map is saved!

---

## 🎨 Step 6: Add Ant Sprites (Optional)

Scroll down in the Ants Editor to the "Ant Sprites" section:

1. Click **Media…** next to any ant role (Fighter, Builder, etc.)
2. Upload or select an image
3. The preview updates automatically
4. Click **💾 Save Sprites** when done

**Tip**: You can leave sprites blank - the game will show colored circles instead!

---

## 🔊 Step 7: Add Sounds and Videos (Optional)

Further down the editor page:

### Videos Section
- Upload intro, win, and lose videos
- These play at the start and end of games

### Sound Effects Section
- Upload MP3 files for game events
- Click, recruit, heal, victory sounds, etc.

---

## 🚀 Step 8: Play Your Game!

1. Go back to the game page you created (Step 4)
2. Refresh the page
3. You should see your map with the tiles you created!

### How to Play (Basic Controls)

- **Click and drag** to pan around the map
- **Use arrow buttons** (navigation pad) to move the view
- The game canvas shows your map tiles

---

## 🧪 Step 9: Experiment and Learn!

Now that everything is working, try these experiments:

### Beginner Experiments
1. **Change tile images**: Try different textures
2. **Create patterns**: Make a path or border
3. **Add more tiles**: Fill more of the grid
4. **Try different walkability**: See how Walk/Slow/Block affects the map

### Intermediate Experiments
1. **Open the PHP files**: Look at the comments we added
2. **Modify the CSS**: Change colors in `plugins/ants-rts-game/assets/ants.css`
3. **Explore the JavaScript**: Check out `plugins/ants-rts-game/assets/ants.js`

### Learning Tip
**Start small!** Change one thing at a time, then test it. This helps you understand what each piece of code does.

---

## 🔍 Understanding the Code (Next Steps)

Once you're comfortable with the basics, dive deeper:

### File Structure
```
plugins/
├── ants-rts-game/
│   ├── ants-rts-game.php    ← PHP code (WordPress integration)
│   └── assets/
│       ├── ants.js          ← JavaScript (game logic)
│       └── ants.css         ← CSS (styling)
└── ants-rts-map-editor/
    └── ants-rts-map-editor.php  ← PHP code (map editor)
```

### What Each File Does

**ants-rts-game.php**
- Registers the WordPress plugin
- Creates the `[ants_game]` shortcode
- Loads CSS and JavaScript files
- Passes map data to the game

**ants.js** (in assets folder)
- Contains the game logic
- Handles canvas rendering
- Manages user input
- Controls game state

**ants.css** (in assets folder)
- Styles the game interface
- Layouts buttons and controls
- Defines colors and animations

**ants-rts-map-editor.php**
- Creates the admin page
- Provides the map editing interface
- Saves/loads maps from database
- Manages sprites, videos, and sounds

---

## 🐛 Troubleshooting

### Game doesn't appear on the page
- ✓ Check that both plugins are activated
- ✓ Make sure you typed `[ants_game]` correctly (with square brackets)
- ✓ Try a different WordPress theme
- ✓ Check browser console for errors (press F12)

### Can't see the map editor
- ✓ Make sure you're logged in as an administrator
- ✓ Check that "Ants RTS - Map Editor" plugin is activated
- ✓ Look for "Ants Editor" in the WordPress admin sidebar

### Tiles don't save
- ✓ Make sure you clicked "💾 Save Map"
- ✓ Check that WordPress can write to the database
- ✓ Try creating a simpler map with fewer tiles

### Images don't show
- ✓ Check that images uploaded successfully to Media Library
- ✓ Verify image URLs are correct
- ✓ Make sure images are web-friendly formats (JPG, PNG, GIF)

---

## 📚 Learning Resources

### For Complete Beginners
- [Codecademy: Learn PHP](https://www.codecademy.com/learn/learn-php)
- [freeCodeCamp: JavaScript](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/)
- [W3Schools: HTML & CSS](https://www.w3schools.com/)

### WordPress Specific
- [WordPress.org: Plugin Basics](https://developer.wordpress.org/plugins/plugin-basics/)
- [WordPress Codex](https://codex.wordpress.org/)

### Game Development
- [MDN: Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)

---

## 💡 Tips for Success

1. **Take it slow**: Don't try to understand everything at once
2. **Experiment**: Change things and see what happens
3. **Read the comments**: We added lots of comments to explain the code
4. **Google is your friend**: Search for terms you don't understand
5. **Break things**: It's okay! You can always reinstall the plugins
6. **Ask questions**: Search for help on Stack Overflow and WordPress forums
7. **Have fun**: Learning to code should be enjoyable!

---

## 🎯 Your Learning Journey

Here's a suggested path:

**Week 1**: Get everything installed and working
**Week 2**: Create several different maps, experiment with tiles
**Week 3**: Read through the PHP files with comments
**Week 4**: Try modifying CSS colors and styles
**Week 5**: Explore the JavaScript game logic
**Week 6**: Make your first code modification!

Remember: Everyone learns at their own pace. There's no rush!

---

## 🤔 What's Next?

After you're comfortable with this project, you could:

- Create a completely custom map design
- Add new tile types or ant roles
- Modify game mechanics
- Build your own WordPress plugin
- Create a different game using this as a template

---

## ✨ You've Got This!

Coding is a skill anyone can learn with practice and patience. This project is your playground - explore, experiment, and most importantly, have fun!

If something isn't clear, re-read the sections, check the code comments, or search online for help. You're now on your way to becoming a developer! 🚀

**Happy coding!**

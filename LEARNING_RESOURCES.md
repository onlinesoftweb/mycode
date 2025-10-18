# Learning Resources - From Beginner to Advanced

This document provides curated learning resources to help you understand the technologies used in the Ants RTS project.

---

## 🌟 Complete Beginner? Start Here!

### Understanding the Basics

If you're completely new to programming, start with these fundamentals:

#### What is Programming?
- **[Code.org](https://code.org/)** - Visual programming tutorials
- **[Hour of Code](https://hourofcode.com/)** - 1-hour introduction to coding
- **[Scratch](https://scratch.mit.edu/)** - Visual programming for beginners

#### How Websites Work
- **[How the Internet Works (Khan Academy)](https://www.khanacademy.org/computing/computers-and-internet/xcae6f4a7ff015e7d:the-internet)** - Free course
- **[MDN: How the Web Works](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works)** - Technical overview

---

## 📘 HTML & CSS (Structure and Style)

HTML creates the structure, CSS makes it look good.

### Free Courses
- **[freeCodeCamp: Responsive Web Design](https://www.freecodecamp.org/learn/2022/responsive-web-design/)** - Complete beginner course (300 hours)
- **[W3Schools HTML](https://www.w3schools.com/html/)** - Interactive tutorials
- **[W3Schools CSS](https://www.w3schools.com/css/)** - Interactive tutorials

### Interactive Learning
- **[CSS Diner](https://flukeout.github.io/)** - Game to learn CSS selectors
- **[Flexbox Froggy](https://flexboxfroggy.com/)** - Learn CSS Flexbox through games
- **[Grid Garden](https://cssgridgarden.com/)** - Learn CSS Grid through games

### Reference
- **[MDN HTML Reference](https://developer.mozilla.org/en-US/docs/Web/HTML)** - Complete HTML documentation
- **[MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS)** - Complete CSS documentation

### In This Project
- Look at: `plugins/ants-rts-game/ants-rts-game.php` (lines 126-148) for HTML structure
- Look at: `plugins/ants-rts-game/assets/ants.css` for game styling

---

## 💛 JavaScript (Interactivity)

JavaScript makes web pages interactive and is used for the game logic.

### Free Courses
- **[freeCodeCamp: JavaScript Algorithms](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/)** - Comprehensive course
- **[JavaScript.info](https://javascript.info/)** - Modern JavaScript tutorial
- **[Eloquent JavaScript](https://eloquentjavascript.net/)** - Free book

### Interactive Learning
- **[Codecademy: JavaScript](https://www.codecademy.com/learn/introduction-to-javascript)** - Interactive course
- **[JavaScript30](https://javascript30.com/)** - 30 projects in 30 days

### Game Development Specific
- **[MDN: Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)** - Essential for this project!
- **[HTML5 Game Development](https://developer.mozilla.org/en-US/docs/Games)** - Complete guide

### Reference
- **[MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)** - Complete documentation
- **[DevDocs.io](https://devdocs.io/)** - Fast, searchable documentation

### In This Project
- Look at: `plugins/ants-rts-game/assets/ants.js` for game logic
- Look at: `plugins/ants-rts-map-editor/ants-rts-map-editor.php` (lines 427-547) for map editor JavaScript

---

## 🐘 PHP (Server-Side)

PHP runs on the server and powers WordPress.

### Free Courses
- **[PHP.net Official Tutorial](https://www.php.net/manual/en/tutorial.php)** - Official introduction
- **[W3Schools PHP](https://www.w3schools.com/php/)** - Interactive tutorials
- **[Learn PHP the Right Way](https://www.youtube.com/watch?v=sVbEyFZKgqk&list=PLr3d3QYzkw2xabQRUpcZ_IBk9W50M9pe-)** - Video course

### Reference
- **[PHP Manual](https://www.php.net/manual/en/)** - Official documentation
- **[PHP The Right Way](https://phptherightway.com/)** - Best practices

### In This Project
- Look at: Both `.php` files in the `plugins` folders
- These handle WordPress integration and data storage

---

## 🔷 WordPress Development

WordPress is a Content Management System (CMS) built with PHP.

### Getting Started
- **[WordPress Plugin Developer Handbook](https://developer.wordpress.org/plugins/)** - Official guide
- **[WordPress Theme Developer Handbook](https://developer.wordpress.org/themes/)** - Official guide
- **[WordPress Codex](https://codex.wordpress.org/)** - Documentation wiki

### Video Tutorials
- **[WordPress Developer Resources (WP YouTube)](https://www.youtube.com/watch?v=ZjbqFLkVNkU)** - Official tutorials
- **[Learn WordPress Development](https://www.youtube.com/watch?v=cXR6s_S95qE)** - Full course

### Key Concepts for This Project
1. **Plugins**: Extend WordPress functionality
2. **Hooks**: Actions and Filters that let you modify behavior
3. **Shortcodes**: Insert dynamic content into posts/pages
4. **Options API**: Store/retrieve data from the database

### Essential Functions Used in This Project
- `add_shortcode()` - Register the `[ants_game]` shortcode
- `get_option()` / `update_option()` - Database storage
- `wp_enqueue_script()` / `wp_enqueue_style()` - Load CSS/JS files
- `wp_localize_script()` - Pass PHP data to JavaScript
- `add_action()` - Hook into WordPress events

### In This Project
- See how plugins are structured: `plugins/ants-rts-game/ants-rts-game.php`
- See admin page creation: `plugins/ants-rts-map-editor/ants-rts-map-editor.php`

---

## 🎮 Game Development Concepts

### Canvas API (2D Graphics)
- **[MDN Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)** - Essential!
- **[HTML5 Canvas Deep Dive](https://joshondesign.com/p/books/canvasdeepdive/toc.html)** - Free book
- **[Canvas Cheat Sheet](https://simon.html5.org/dump/html5-canvas-cheat-sheet.html)** - Quick reference

### Game Programming Patterns
- **[Game Programming Patterns](https://gameprogrammingpatterns.com/)** - Free book
- **[Red Blob Games](https://www.redblobgames.com/)** - Interactive tutorials

### RTS Game Concepts
- **Grids & Tile Systems**: How the 94×94 grid works
- **Pathfinding**: How ants move around obstacles
- **Resource Management**: Food, gold, bonus collection
- **Unit AI**: How enemy ants behave

### In This Project
- Game loop and rendering: `assets/ants.js`
- Grid system: 94 columns × 94 rows = 8,836 tiles
- Tile properties: walkable (W), slow (S), blocked (B)

---

## 🛠️ Development Tools

### Code Editors (Choose One)
- **[Visual Studio Code](https://code.visualstudio.com/)** - Most popular, free
- **[Sublime Text](https://www.sublimetext.com/)** - Fast and lightweight
- **[Atom](https://atom.io/)** - Hackable editor

### VS Code Extensions for This Project
- **PHP Intelephense** - PHP code intelligence
- **JavaScript (ES6) code snippets** - JS shortcuts
- **WordPress Snippets** - WordPress code snippets
- **Live Server** - Preview HTML changes instantly
- **Prettier** - Auto-format code

### Browser Developer Tools
- **[Chrome DevTools](https://developer.chrome.com/docs/devtools/)** - Debug JavaScript, inspect HTML/CSS
- **[Firefox Developer Tools](https://firefox-source-docs.mozilla.org/devtools-user/)** - Alternative to Chrome
- **Console**: View errors and log messages (Press F12)
- **Network Tab**: See what files are loading
- **Elements Tab**: Inspect and modify HTML/CSS live

### Local WordPress Development
- **[Local by Flywheel](https://localwp.com/)** - Easiest for beginners
- **[XAMPP](https://www.apachefriends.org/)** - Classic LAMP stack
- **[Docker](https://www.docker.com/)** - Advanced, containerized environments

---

## 📚 Recommended Learning Path

### Month 1: Foundations
1. **Week 1**: HTML basics - structure and tags
2. **Week 2**: CSS basics - styling and layouts
3. **Week 3**: JavaScript basics - variables, functions, loops
4. **Week 4**: JavaScript DOM - manipulating HTML with JS

### Month 2: WordPress Basics
1. **Week 1**: Install WordPress locally, explore dashboard
2. **Week 2**: Understanding themes and plugins
3. **Week 3**: PHP basics - syntax, variables, functions
4. **Week 4**: WordPress hooks - actions and filters

### Month 3: This Project
1. **Week 1**: Install and explore Ants RTS
2. **Week 2**: Study the PHP files with comments
3. **Week 3**: Study the JavaScript game logic
4. **Week 4**: Make your first modification!

### Month 4: Advanced Topics
1. **Week 1**: Canvas API and drawing graphics
2. **Week 2**: Game state management
3. **Week 3**: Optimization and performance
4. **Week 4**: Build your own feature!

---

## 🎯 Project-Specific Learning

### Understanding This Codebase

#### Start Here (Easiest)
1. **README.md** - Project overview and concepts
2. **GETTING_STARTED.md** - Installation and setup
3. **HTML structure** - `ants-rts-game.php` lines 126-148

#### Next Steps (Beginner)
1. **CSS styling** - `assets/ants.css`
2. **PHP comments** - Read inline comments in `.php` files
3. **WordPress shortcode** - How `[ants_game]` works

#### Intermediate
1. **Map editor UI** - `ants-rts-map-editor.php` (grid creation)
2. **Data flow** - How PHP passes data to JavaScript
3. **Media library integration** - Image uploads

#### Advanced
1. **Game logic** - `assets/ants.js` (Canvas rendering)
2. **State management** - Tiles, units, resources
3. **Optimization** - Handling 8,836 tiles efficiently

### Exercises by Difficulty

#### Beginner Exercises
- ✏️ Change background colors in CSS
- ✏️ Modify button text
- ✏️ Add a new navigation button
- ✏️ Change the grid size display text

#### Intermediate Exercises
- ⚙️ Add a new tile tag type (e.g., "WATER")
- ⚙️ Modify the grid from 94×94 to 50×50
- ⚙️ Add a new sprite type
- ⚙️ Change tile size from 64px to 32px

#### Advanced Exercises
- 🔬 Implement a mini-map display
- 🔬 Add zoom in/out functionality
- 🔬 Create an undo/redo system for the map editor
- 🔬 Add a tile search/filter feature

---

## 💭 Key Concepts Explained

### What is a Plugin?
A plugin is code that extends WordPress functionality without modifying core files.

### What is a Shortcode?
A shortcode is a tag like `[ants_game]` that WordPress replaces with dynamic content.

### What is the Canvas?
Canvas is an HTML element where you can draw graphics using JavaScript.

### What is a Grid System?
A grid divides the game world into cells (tiles) for positioning and collision detection.

### What is the Options API?
WordPress's way to store key-value data in the database (like game settings).

---

## 🔗 Community Resources

### Ask Questions
- **[Stack Overflow](https://stackoverflow.com/)** - Programming Q&A
- **[WordPress Stack Exchange](https://wordpress.stackexchange.com/)** - WordPress-specific Q&A
- **[Reddit: r/learnprogramming](https://www.reddit.com/r/learnprogramming/)** - Beginner-friendly
- **[Reddit: r/webdev](https://www.reddit.com/r/webdev/)** - Web development

### Stay Updated
- **[CSS-Tricks](https://css-tricks.com/)** - Web development articles
- **[Smashing Magazine](https://www.smashingmagazine.com/)** - Design and development
- **[Dev.to](https://dev.to/)** - Developer community

### Video Channels
- **[Traversy Media](https://www.youtube.com/c/TraversyMedia)** - Web development tutorials
- **[The Net Ninja](https://www.youtube.com/c/TheNetNinja)** - Programming tutorials
- **[Kevin Powell](https://www.youtube.com/kepowob)** - CSS specialist
- **[Web Dev Simplified](https://www.youtube.com/c/WebDevSimplified)** - Clear explanations

---

## 📖 Free Books

### JavaScript
- [Eloquent JavaScript](https://eloquentjavascript.net/)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)
- [JavaScript for Cats](http://jsforcats.com/)

### PHP
- [PHP: The Right Way](https://phptherightway.com/)
- [PHP Pandas](https://daylerees.com/php-pandas/)

### Web Development
- [The Odin Project](https://www.theodinproject.com/) - Full curriculum
- [Interneting is Hard](https://www.internetingishard.com/) - HTML & CSS

### Game Development
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [HTML5 Canvas Deep Dive](https://joshondesign.com/p/books/canvasdeepdive/toc.html)

---

## 🎓 Paid Courses (Optional)

If you want structured learning and prefer video courses:

### General Web Development
- **Udemy**: The Web Developer Bootcamp (Colt Steele)
- **Pluralsight**: JavaScript path
- **LinkedIn Learning**: JavaScript Essential Training

### WordPress Specific
- **Udemy**: Complete WordPress Development Themes and Plugins
- **WPCasts**: WordPress plugin development

### Game Development
- **Udemy**: HTML5 Game Development
- **Coursera**: Game Design and Development Specialization

---

## ⏱️ Daily Learning Tips

### 15 Minutes a Day
- Read one section from JavaScript.info
- Complete one exercise on W3Schools
- Watch one short tutorial video

### 30 Minutes a Day
- Work through one freeCodeCamp module
- Read code comments in this project
- Try one small code modification

### 1 Hour a Day
- Complete a full tutorial
- Build a small feature
- Debug and test your changes

### Consistency > Duration
It's better to code for 15 minutes every day than 2 hours once a week!

---

## 🎯 Learning Strategies

### 1. Read-Understand-Modify
1. Read code with comments
2. Understand what it does
3. Make a small change
4. Test it!

### 2. Break It Down
Don't understand a function? Break it into smaller parts and understand each piece.

### 3. Copy-Paste-Modify
Find working code, copy it, then modify it to learn how it works.

### 4. Build Projects
The best way to learn is by building. Start small!

### 5. Debug Your Code
When something breaks, use browser console (F12) to find errors.

### 6. Google Everything
Not sure about something? Google "JavaScript how to..." or "PHP what is..."

### 7. Keep Notes
Write down what you learn. It helps retention!

---

## 🌟 Motivation

**"The expert in anything was once a beginner."** - Helen Hayes

- Every developer started exactly where you are now
- Making mistakes is part of learning
- Small progress every day adds up
- The journey is as important as the destination
- Enjoy the process!

---

## 🎉 Next Steps

1. ✅ Choose one resource from above
2. ✅ Spend 15-30 minutes on it today
3. ✅ Come back to this list whenever you're stuck
4. ✅ Keep building and learning!

**You've got this! Happy learning! 🚀**

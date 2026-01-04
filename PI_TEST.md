# Quick Test on Raspberry Pi

## Steps to Run on Pi

1. **Open terminal on Raspberry Pi** (or SSH into it)

2. **Check if Node.js is installed:**
```bash
node --version
```

If version is less than 18 or not installed, run:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Clone the repository:**
```bash
cd ~
git clone https://github.com/jsnyder4/jarvis.git
cd jarvis
```

4. **Install dependencies:**
```bash
npm install
```
This will take a few minutes on the Pi. Be patient!

5. **Run the app:**
```bash
npm start
```

## What You Should See

- App launches in fullscreen mode
- No window frame/borders
- Colorful gradient cards with emojis
- Title: "Jarvis Dashboard"
- 4 sections: Time & Weather, Calendar, Sports, Lists

## How to Exit

- Press `Ctrl+Q` 
- Or press `Alt+F4`
- Or use `Ctrl+C` in the terminal

## If Something Goes Wrong

**Error: "Cannot find module 'electron'"**
- Run: `npm install` again

**App doesn't go fullscreen:**
- Check main.js has `fullscreen: true`
- Make sure you're running on the Pi's display, not via SSH

**Black screen or crash:**
- Check terminal for errors
- Try: `DISPLAY=:0 npm start`

## Report Back

Let me know:
- ✅ Does it launch?
- ✅ Is it fullscreen?
- ✅ Do you see the colorful UI?
- ✅ Can you exit cleanly?
- ❌ Any errors or issues?

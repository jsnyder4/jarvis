# Raspberry Pi Setup Instructions

## First Time Setup on Raspberry Pi

### 1. Install Node.js (if not already installed)
```bash
# Check if Node.js is installed
node --version

# If not installed or version < 18, install latest:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone the Repository
```bash
cd ~
git clone https://github.com/jsnyder4/jarvis.git
cd jarvis
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Test the App
```bash
npm start
```

The app should launch in fullscreen. Press `Ctrl+Q` or `Alt+F4` to close it.

---

## Updating the App (After Changes)

### Option 1: Using the Deploy Script
```bash
cd ~/jarvis
./deploy.sh
npm start
```

### Option 2: Manual Update
```bash
cd ~/jarvis
git pull origin main
npm install
npm start
```

---

## Auto-Start on Boot (Optional)

### Using systemd service

1. Create service file:
```bash
sudo nano /etc/systemd/system/jarvis.service
```

2. Add this content:
```ini
[Unit]
Description=Jarvis Dashboard
After=graphical.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/jarvis
Environment=DISPLAY=:0
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=graphical.target
```

3. Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable jarvis.service
sudo systemctl start jarvis.service
```

4. Check status:
```bash
sudo systemctl status jarvis.service
```

---

## Troubleshooting

### App won't start
- Check Node.js version: `node --version` (should be 18+)
- Check for errors: `npm start` and read the output
- Try reinstalling: `rm -rf node_modules && npm install`

### Can't pull from GitHub
- Make sure you have access to the repo
- Use HTTPS clone URL for simplicity
- Or set up SSH keys on the Pi

### Display issues
- Make sure `DISPLAY=:0` is set
- Try running: `export DISPLAY=:0` before `npm start`
- Check if X server is running: `ps aux | grep X`

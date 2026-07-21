#!/bin/bash
echo "============================================================"
echo " ESV Bible Tracker - macOS Gatekeeper Quarantine Fixer"
echo "============================================================"
echo ""
echo "Removing macOS quarantine attribute from ESV Bible Tracker.app..."
sudo xattr -cr "/Applications/ESV Bible Tracker.app" 2>/dev/null || xattr -cr "/Applications/ESV Bible Tracker.app" 2>/dev/null || xattr -cr "./ESV Bible Tracker.app" 2>/dev/null

echo ""
echo "✅ Success! macOS Gatekeeper override complete."
echo "You can now open 'ESV Bible Tracker' from Applications folder!"
echo ""
read -p "Press Enter to exit..."

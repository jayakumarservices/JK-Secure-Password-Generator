@echo off
echo Creating distribution package for JK Secure Password Generator...
powershell Compress-Archive -Path manifest.json, popup.html, popup.js, background.js, jk_logo.png, README.md -DestinationPath JK_Secure_Password_Generator.zip -Force
echo Distribution package created successfully!
echo.
echo Installation Instructions:
echo 1. Download and extract JK_Secure_Password_Generator.zip
echo 2. Open Google Chrome
echo 3. Go to chrome://extensions/
echo 4. Enable "Developer mode" in the top-right corner
echo 5. Click "Load unpacked"
echo 6. Select the extracted folder
echo.
pause 
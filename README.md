# JK Secure Password Generator Chrome Extension

A Chrome extension that generates strong passwords and manages one-time login credentials securely.

## Features

- Generate strong passwords with customizable options:
  - Adjustable password length (8-32 characters)
  - Include/exclude uppercase letters
  - Include/exclude lowercase letters
  - Include/exclude numbers
  - Include/exclude symbols
- Generate one-time login credentials for websites
- Copy passwords to clipboard with one click
- Secure local storage of credentials
- Clean and intuitive user interface

## Installation

### Method 1: Developer Mode Installation

1. Download the latest release from the [Releases](https://github.com/yourusername/JK-Secure-Password-Generator/releases) page
2. Extract the ZIP file to a folder on your computer
3. Open Google Chrome
4. Go to `chrome://extensions/`
5. Enable "Developer mode" in the top-right corner
6. Click "Load unpacked"
7. Select the folder where you extracted the ZIP file

### Method 2: Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon. Stay tuned for updates!

## Usage

### Regular Password Generation

1. Click the extension icon in your Chrome toolbar
2. Set your desired password length (8-32 characters)
3. Select which character types to include
4. Click "Generate Password"
5. Click "Copy" to copy the password to your clipboard

### One-Time Login

1. Enter the website URL
2. Enter your username
3. Click "Generate One-Time Login"
4. Use the generated password to log in
5. The password will expire after 5 minutes or after first use

## Security Features

- All password generation happens locally in your browser
- No data is sent to external servers
- One-time passwords expire after 5 minutes or first use
- Credentials are stored securely in Chrome's local storage
- No tracking or analytics

## Development

### Technologies Used

- HTML5
- CSS3
- JavaScript
- Chrome Extension APIs

### Building from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/JK-Secure-Password-Generator.git
   ```
2. Open the project folder
3. Load the extension in Chrome using Developer mode (see Installation instructions)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Your Name - [GitHub Profile](https://github.com/yourusername)

## Acknowledgments

- Chrome Extension APIs
- Modern web development tools and libraries 
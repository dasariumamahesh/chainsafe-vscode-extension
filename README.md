# Chainsafe - Optional Chaining for VS Code 🔗

A VS Code extension that automatically adds optional chaining (`?.`) to your TypeScript and JavaScript files.

## Features ✨

- 🚀 Add optional chaining via Command Palette or on file save
- 🎯 Smart detection of potentially nullable expressions
- 🔄 Preview changes in diff view
- ⚡ Format on save support
- 🔍 Built-in protection for JavaScript globals

## Quick Links 🔗

- [GitHub Repository](https://github.com/dasariumamahesh/chainsafe-vscode-extension)
- [Issue Tracker](https://github.com/dasariumamahesh/chainsafe-vscode-extension/issues)
- [Changelog](https://github.com/dasariumamahesh/chainsafe-vscode-extension/blob/main/CHANGELOG.md)

## Installation 📦

1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P`
3. Type `ext install vscode-chainsafe`
4. Press Enter

Or install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=dasariumamahesh.chainsafe)

## Usage 🎮

### Command Palette

Press `Ctrl+Shift+P` / `Cmd+Shift+P` and type "Add Optional Chaining" to apply optional chaining to your current file.

### Format on Save

Enable automatic formatting on save in your settings:

```json
{
    "chainsafe.formatOnSave": true
}
```

## Examples 📝

### Before:
```javascript
const user = getUser();
const name = user.profile.name;
const city = user.profile.address.city;
```

### After:
```javascript
const user = getUser();
const name = user?.profile?.name;
const city = user?.profile?.address?.city;
```

## Configuration ⚙️

Configure in your VS Code settings.json:

```json
{
    // Enable/disable format on save
    "chainsafe.formatOnSave": false,

    // Show diff view before applying changes
    "chainsafe.showDiff": true,

    // Additional globals to skip
    "chainsafe.addToDefaultSkipList": ["axios", "lodash"],

    // Remove items from built-in skip list
    "chainsafe.removeFromDefaultSkipList": ["Promise", "Array"],

    // Only skip these specific identifiers
    "chainsafe.skipOnly": ["window", "document"],

    // Skip nothing (apply to everything)
    "chainsafe.skipNone": false
}
```

### Priority Order

1. `skipNone`: If true, applies to everything
2. `skipOnly`: If specified, only these items are skipped
3. `addToDefaultSkipList` & `removeFromDefaultSkipList`: Fine-grained control

## Built-in Protected Globals 🛡️

These globals are protected by default (won't receive optional chaining):

- Array
- Object
- String
- Number
- Boolean
- Date
- Math
- JSON
- RegExp
- Error
- Map
- Set
- Promise
- Function
- console
- Buffer

## Requirements 📋

- VS Code version 1.94.0 or higher
- Node.js installed for npx support
- [Chainsafe CLI](https://www.npmjs.com/package/chainsafe) (`npm install -g chainsafe`)

## Extension Settings 🔧

This extension contributes the following settings:

* `chainsafe.formatOnSave`: Enable/disable automatic formatting on save
* `chainsafe.showDiff`: Show changes before applying
* `chainsafe.addToDefaultSkipList`: Additional globals to skip
* `chainsafe.removeFromDefaultSkipList`: Remove from built-in skip list
* `chainsafe.skipOnly`: Only skip these specific identifiers
* `chainsafe.skipNone`: Apply to everything

## Known Issues 🐛

- Multiple chained operations might require multiple passes
- Large files may take longer to process

## Release Notes 📝

### 0.0.2
- Added support for handling computed properties
- Improved detection and transformation of bracket notation access
- Enhanced safety checks for computed property expressions
- Better handling of dynamic property names

### 0.0.1
- Initial release
- Basic optional chaining support
- Format on save
- Command palette integration
- Diff view support

## Contributing 🤝

Contributions are welcome! Here's how you can help:

1. Fork the [repository](https://github.com/dasariumamahesh/chainsafe-vscode-extension)
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Bug Reports 🐞

If you find a bug, please create an issue on our [GitHub Issue Tracker](https://github.com/dasariumamahesh/chainsafe-vscode-extension/issues) with:

- A description of the problem
- Steps to reproduce
- Expected behavior
- Your environment details (VS Code version, OS, etc.)

## Support 💡

If you like this extension, please:
- ⭐ Star the [GitHub repository](https://github.com/dasariumamahesh/chainsafe-vscode-extension)
- 📝 Rate it on [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=dasariumamahesh.vscode-chainsafe)
- 🐛 Report issues on [GitHub](https://github.com/dasariumamahesh/chainsafe-vscode-extension/issues)
- 🎉 Share it with others

## License 📄

[MIT](./LICENSE) © [Dasari Uma Mahesh]

## Author ✨

**Dasari Uma Mahesh**
- [GitHub](https://github.com/dasariumamahesh)
- [LinkedIn](https://www.linkedin.com/in/umamaheshdasari)

---

Made with ❤️ by [Dasari Uma Mahesh]
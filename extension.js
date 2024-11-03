const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const diff = require('diff');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Chainsafe extension is now active!');

    let disposable = vscode.commands.registerCommand('chainsafe.addOptionalChaining', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found');
            return;
        }

        // For manual command, always ask for confirmation
        await processFile(editor.document, { isManualCommand: true });
    });

    // Register the format on save handler
    context.subscriptions.push(
        vscode.workspace.onWillSaveTextDocument(async (event) => {
            const config = vscode.workspace.getConfiguration('chainsafe');
            if (config.get('formatOnSave')) {
                console.log('Format on save triggered');
                if (isValidDocument(event.document)) {
                    event.waitUntil(processFile(event.document, { isManualCommand: false }));
                }
            }
        })
    );

    context.subscriptions.push(disposable);
}

/**
 * Creates a properly formatted command string
 * @param {string} filePath 
 * @param {string[]} args 
 * @returns {string}
 */
function createCommand(filePath, args) {
    // Properly quote the file path
    const quotedPath = `"${filePath.replace(/"/g, '\\"')}"`;

    // Process each argument to handle spaces correctly
    const processedArgs = args.map(arg => {
        if (arg.includes(' ')) {
            return `"${arg}"`;
        }
        return arg;
    });

    return `npx chainsafe ${quotedPath} ${processedArgs.join(' ')}`;
}

/**
 * @param {vscode.TextDocument} document
 * @param {{ isManualCommand: boolean }} options
 */
async function processFile(document, { isManualCommand }) {
    console.log('Processing file:', document.fileName);

    if (!isValidDocument(document)) {
        console.log('Invalid document type');
        return;
    }

    const config = vscode.workspace.getConfiguration('chainsafe');
    console.log('Current configuration:', JSON.stringify(config, null, 2));

    const addToDefaultSkipList = config.get('addToDefaultSkipList') || [];
    const removeFromDefaultSkipList = config.get('removeFromDefaultSkipList') || [];
    const skipOnly = config.get('skipOnly') || [];
    const skipNone = config.get('skipNone') || false;
    const showDiff = config.get('showDiff');
    const applyOnly = config.get('applyOnly') || [];

    try {
        const originalContent = document.getText();

        // Build command arguments with proper ordering
        let args = [];

        // Handle skipNone first - it should be independent of other conditions
        if (skipNone) {
            args.push('--skip-none');
        }

        // Handle applyOnly next
        if (applyOnly.length > 0) {
            args.push('--apply-only', ...applyOnly);
        } else if (skipOnly.length > 0) {
            // Handle skipOnly if applyOnly is not present
            args.push('--skip-only', ...skipOnly);
        } else {
            // Handle other skip configurations if neither applyOnly nor skipOnly is present
            if (removeFromDefaultSkipList.length > 0) {
                args.push('--no-skip', ...removeFromDefaultSkipList);
            }
            if (addToDefaultSkipList.length > 0) {
                args.push('--skip', ...addToDefaultSkipList);
            }
        }

        console.log('Built arguments:', args);

        // Create and execute the command
        const command = createCommand(document.fileName, args);
        console.log('Executing command:', command);

        const result = await runChainsafe(command);

        if (result.success) {
            if (originalContent === result.content) {
                console.log('No changes needed');
                return;
            }

            if (showDiff && isManualCommand) {
                const shouldProceed = await showGitStyleDiff(document, originalContent, result.content, true);
                if (!shouldProceed) {
                    return;
                }
            }

            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                document.uri,
                new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.getText().length)
                ),
                result.content
            );
            return edit;
        } else {
            vscode.window.showErrorMessage(`Chainsafe error: ${result.error}`);
        }
    } catch (error) {
        console.error('Process file error:', error);
        vscode.window.showErrorMessage(`Failed to process file: ${error.message}`);
    }
}


/**
 * Shows Git-style diff
 * @param {vscode.TextDocument} document 
 * @param {string} originalContent 
 * @param {string} modifiedContent 
 * @param {boolean} askForConfirmation
 * @returns {Promise<boolean>}
 */
async function showGitStyleDiff(document, originalContent, modifiedContent, askForConfirmation) {
    const fileName = path.basename(document.fileName);
    const uri = vscode.Uri.parse(`untitled:${fileName}.diff`);

    try {
        // Create diff content
        const diffContent = createGitDiff(originalContent, modifiedContent, fileName);
        if (!diffContent) {
            return true; // No changes to apply
        }

        // Create new document with diff content
        const edit = new vscode.WorkspaceEdit();
        edit.createFile(uri, { overwrite: true });
        await vscode.workspace.applyEdit(edit);

        const doc = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Beside,
            preview: true
        });

        // Insert diff content
        await editor.edit(editBuilder => {
            const fullRange = new vscode.Range(
                new vscode.Position(0, 0),
                new vscode.Position(doc.lineCount, 0)
            );
            editBuilder.replace(fullRange, diffContent);
        });

        // Set language for syntax highlighting
        await vscode.languages.setTextDocumentLanguage(doc, 'diff');

        // Show simple confirmation message instead of asking for approval
        vscode.window.showInformationMessage('File updated');
        return true;

    } catch (error) {
        vscode.window.showErrorMessage(`Error showing diff: ${error.message}`);
        return false;
    }
}

/**
 * Creates a Git-style diff output
 * @param {string} originalContent 
 * @param {string} modifiedContent 
 * @param {string} fileName
 * @returns {string|null}
 */
function createGitDiff(originalContent, modifiedContent, fileName) {
    const changes = diff.createPatch(fileName, originalContent, modifiedContent);
    if (!changes || changes.split('\n').length <= 4) {
        return null;
    }

    const lines = changes.split('\n').slice(4); // Skip header
    let output = [
        `diff --git a/${fileName} b/${fileName}`,
        `--- a/${fileName}`,
        `+++ b/${fileName}`,
        ''
    ];

    lines.forEach(line => {
        if (line.startsWith('@@') || line.startsWith('+') ||
            line.startsWith('-') || line.startsWith(' ')) {
            output.push(line);
        }
    });

    return output.join('\n');
}

/**
 * Apply changes to document
 * @param {vscode.TextDocument} document 
 * @param {string} newContent 
 */
async function applyChanges(document, newContent) {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
        document.uri,
        new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        ),
        newContent
    );
    await vscode.workspace.applyEdit(edit);
}

/**
 * @param {vscode.TextDocument} document
 * @returns {boolean}
 */
function isValidDocument(document) {
    return document.languageId === 'typescript' ||
        document.languageId === 'javascript' ||
        document.fileName.endsWith('.ts') ||
        document.fileName.endsWith('.js') ||
        document.fileName.endsWith('.tsx') ||
        document.fileName.endsWith('.jsx');
}

/**
 * @param {string} command
 * @returns {Promise<{ success: boolean, content?: string, error?: string }>}
 */
function runChainsafe(command) {
    return new Promise((resolve) => {
        exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            console.log('Command output:', stdout);
            console.log('Command errors:', stderr);

            if (error) {
                console.error('Execution error:', error);
                resolve({
                    success: false,
                    error: stderr || error.message
                });
                return;
            }

            try {
                // Get the file path from the command
                const filePath = command.match(/"([^"]+)"/)[1];
                const content = fs.readFileSync(filePath, 'utf8');
                resolve({
                    success: true,
                    content
                });
            } catch (readError) {
                console.error('File read error:', readError);
                resolve({
                    success: false,
                    error: `Failed to read processed file: ${readError.message}`
                });
            }
        });
    });
}



function deactivate() { }

module.exports = {
    activate,
    deactivate
};
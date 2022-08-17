import * as vscode from 'vscode';

var fs = require('fs');
var chokidar = require('chokidar');

var config = require('./config');
var cmd = require('./commands');

var watcher: any;

export function activate(context: vscode.ExtensionContext) {
	if (!fs.existsSync(config.tmpDir)) {
		fs.mkdirSync(config.tmpDir);
	}

	watcher = chokidar.watch(config.tmpDir, { ignored: /^\./, persistent: false });
	watcher.on('change', cmd.onFileChangeSync);

	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-papis.openReference', cmd.openRef)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-papis.openDirReference', cmd.openDirRef)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-papis.editReference', cmd.editRef)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-papis.editNotesReference', cmd.editNotesRef)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-papis.browseReference', cmd.browseRef)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-papis.insertCitation', cmd.insertCite)
	);

}

export function deactivate() {
	watcher.close();
}

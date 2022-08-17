import * as vscode from 'vscode';

var fs = require('fs');

var utils = require('./utils');
var config = require('./config');

export function openRef() {
	let currentRef = utils.getCurrentRef();
	if (currentRef.refStr !== "") {
		let terminal = utils.openTerminalIfClosed();
		terminal.sendText(utils.getPapisCmd("open " + currentRef.refStr));
	}
}

export function openDirRef() {
	let currentRef = utils.getCurrentRef();
	if (currentRef.refStr !== "") {
		let terminal = utils.openTerminalIfClosed();
		terminal.sendText(utils.getPapisCmd("open -d " + currentRef.refStr));
	}
}

export function editRef() {
	let currentRef = utils.getCurrentRef();
	if (currentRef.refStr !== "") {
		let terminal = utils.openTerminalIfClosed();
		terminal.sendText(utils.getPapisCmd("list -i " + currentRef.refStr + " > " + config.tmpPathPickedEdit), true);
	}
}

export function editNotesRef() {
	let currentRef = utils.getCurrentRef();
	if (currentRef.refStr !== "") {
		let terminal = utils.openTerminalIfClosed();
		terminal.sendText(utils.getPapisCmd("list -n " + currentRef.refStr + " > " + config.tmpPathPickedEdit), true);
	}
}

export function browseRef() {
	let currentRef = utils.getCurrentRef();
	if (currentRef.refStr !== "") {
		let terminal = utils.openTerminalIfClosed();
		terminal.sendText(utils.getPapisCmd("browse " + currentRef.refStr));
	}
}

export function insertCite() {
	let terminal = utils.openTerminalIfClosed();
	terminal.sendText(utils.getPapisCmd("export -f json > " + config.tmpPathPickedCitation), true);
	terminal.show();
}

export function onFileChangeSync(path: string) {
	switch (path) {
		case config.tmpPathPickedCitation:
			var obj = JSON.parse(fs.readFileSync(path, 'utf8'));
			utils.insertCitationAtCursor(obj[0]["ref"]);
			fs.unlinkSync(path);
			break;

		case config.tmpPathPickedEdit:
			var data = fs.readFileSync(path, 'utf8');
			var dataStr = data.toString().slice(0, -1);
			vscode.workspace.openTextDocument(dataStr).then((doc: vscode.TextDocument) => {
				vscode.window.showTextDocument(doc);
			});
			fs.unlinkSync(path);
			break;

		default:
			break;
	}
}

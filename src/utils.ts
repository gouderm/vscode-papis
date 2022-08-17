import * as vscode from 'vscode';
import { platform } from 'node:process';

var utils = require('./utils');

let papisTerminal: vscode.Terminal;

export function openTerminalIfClosed() {
	if (papisTerminal !== undefined) {
		papisTerminal.dispose();
	}
	papisTerminal = vscode.window.createTerminal("Papis Terminal");
	return papisTerminal;
}

export function cursorInCitation(line: string, pos: number) {
	let ret = {
		refStart: -1,
		refStr: "",
	};

	if (line.length === 0) {
		return ret;
	}

	if (line[pos] === "}" || line[pos] === ",") {
		pos -= 1;
	}

	let beforeCursor = line.slice(0, pos + 1);
	let afterCursor = line.slice(pos);

	let lastSlashIdx = beforeCursor.lastIndexOf("\\");

	if (lastSlashIdx === -1) {
		return ret;
	}

	if (line.slice(lastSlashIdx, lastSlashIdx + 6) !== "\\cite{") {
		return ret;
	}

	let nextOpeningBracketIdx = lastSlashIdx + 6;
	let nextClosingBracketIdx = afterCursor.indexOf("}");

	if (nextClosingBracketIdx === -1) {
		return ret;
	}
	nextClosingBracketIdx += beforeCursor.length;

	if (nextOpeningBracketIdx > pos) {
		ret.refStart = nextOpeningBracketIdx;
	} else {
		// find position of first letter before cursor
		let idx = (afterCursor.match("[a-zA-Z0-9]") || []).index || 0;
		if (idx > 0) {
			beforeCursor = beforeCursor.slice(idx);
		}

		let idx2 = (beforeCursor.split("").reverse().join("").match("[^a-zA-Z0-9]") || []).index;
		if (idx2 !== undefined) {
			ret.refStart = pos + idx - idx2 + 1;
		}
	}

	let idx = (line.slice(ret.refStart, nextClosingBracketIdx).match("[^a-zA-Z0-9]") || []).index;
	if (idx !== undefined) {
		ret.refStr = line.slice(ret.refStart, ret.refStart + idx);
	}

	return ret;
}

export function insertCitationAtCursor(ref: string) {

	const editor = vscode.window.activeTextEditor;
	if (editor === undefined) {
		return;
	}

	let curPos = editor.selection.active;
	const document = editor.document;

	// Get the word within the selection
	const { text } = editor.document.lineAt(curPos.line);
	let currentRef = cursorInCitation(text, curPos.character);

	if (currentRef.refStart === -1) {
		const newCite = "\\cite{" + ref + "}";
		editor.edit(editBuilder => {
			editBuilder.insert(curPos, newCite);
		});
	} else {
		const newCite = ", " + ref;
		let pos = new vscode.Position(curPos.line, currentRef.refStart + currentRef.refStr.length);
		editor.edit(editBuilder => {
			editBuilder.insert(pos, newCite);
		});
	}
}

export function getCurrentRef() {
	const editor = vscode.window.activeTextEditor;
	if (editor === undefined) {
		return;
	}
	
	let curPos = editor.selection.active;
	const { text } = editor.document.lineAt(curPos.line);
	return utils.cursorInCitation(text, curPos.character);
}

export function getPapisCmd(options: string) {
	const configuration = vscode.workspace.getConfiguration('helloworld');

	let cmd: string | undefined;
	switch (platform) {
		case "darwin":
			cmd = configuration.get("papisExecutablePath.darwin");
			break;

		case "linux":
			cmd = configuration.get("papisExecutablePath.linux");
			break;

		default:
			console.error("This platform is not supported yet.");
	}
	if (cmd === undefined) {
		return "";
	}

	let library = configuration.get("defaultLibrary");
	if (library) {
		cmd += " -l " + library;
	}

	cmd += " " + options;
	return cmd;
}

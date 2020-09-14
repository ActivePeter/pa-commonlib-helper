// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TextDecoder } from 'util';
var mcuChosen = "";
function createModuleForMCU(uristr: string, tag: boolean) {
	const uri = vscode.Uri.file(uristr);
	vscode.workspace.fs.readDirectory(uri).then(
		(someArray) => {
			for (var i = 0; i < someArray.length; i++) {

				if (someArray[i][1] == 1) {
					// console.log("asasda杀杀杀dadasd",uri)
					const indexOfstr = someArray[i][0].indexOf("MODULE.cpp");
					if (indexOfstr >= 0) {
						const fileName1 = someArray[i][0].substring(0, indexOfstr) + mcuChosen + ".cpp";
						// console.log(mcuChosen);
						// console.log(fileName1);
						const urifrom = vscode.Uri.file(uristr + "/" + someArray[i][0]);
						const uriTo = vscode.Uri.file(uristr + "/" + fileName1);
						// console.log(urifrom,uriTo);
						// vscode.workspace.fs.delete(uriTo)
						if (tag) {
							vscode.workspace.fs.copy(urifrom, uriTo).then(
								_ => {
									vscode.workspace.openTextDocument(uriTo).then((document) => {
										let text = document.getText();
										text = text.replace("#ifdef MODULE", "#ifdef " + mcuChosen)

										// Tex
										const wsedit = new vscode.WorkspaceEdit();
										const start = new vscode.Position(0, 0);
										const end = new vscode.Position(document.lineCount + 1, 0);
										wsedit.replace(uriTo, new vscode.Range(start, end), text);
										vscode.workspace.applyEdit(wsedit);
									});
								}
							)

						} else {
							vscode.workspace.fs.delete(uriTo)
						}


					}
				}
			}
		}
	)

}

function lsDirectory(uristr: string, tag: boolean, first: boolean) {
	const uri = vscode.Uri.file(uristr);
	vscode.workspace.fs.readDirectory(uri).then(
		(someArray) => {
			for (var i = 0; i < someArray.length; i++) {
				if (someArray[i][1] == 2) {

					if (someArray[i][0].indexOf("mcuDrvs") >= 0) {
						// console.log(someArray[i]); // 1, "string", false
						createModuleForMCU(uristr + "/" + someArray[i][0], tag);
					} else {
						lsDirectory(uristr + "/" + someArray[i][0], tag, false)
					}
				}
			}
			if (first) {
				if (tag) {
					vscode.window.showInformationMessage('模板创建完毕');
				} else {
					vscode.window.showInformationMessage('模板清除完毕');
				}
			}
		}
	)
}

function lookForConfig(uristr: string, inLib: boolean, open: boolean) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	const uri = vscode.Uri.file(uristr);
	return vscode.workspace.fs.readDirectory(uri).then(
		(someArray) => {
			var hasConfig = false;
			for (var i = 0; i < someArray.length; i++) {

				if (someArray[i][1] == 1 && someArray[i][0] == "pa_CommonLib_Helper.json") {
					hasConfig = true;
					const uriConfig = vscode.Uri.file(uristr + "/" + someArray[i][0]);
					vscode.workspace.openTextDocument(uriConfig).then((document) => {
						let text = document.getText();
						var mcuc1 = null;
						try {
							mcuc1 = JSON.parse(text).mcu
						} catch (e) {

						}
						if (mcuc1) {
							console.log("before asddddddddasdasdasdddddddddddddd", mcuChosen, mcuc1)
							mcuChosen = mcuc1;
							console.log("asddddddddasdasdasdddddddddddddd", mcuChosen, mcuc1)
						} else {
							const wsedit = new vscode.WorkspaceEdit();
							const jsonuri = vscode.Uri.file(uristr + "/" + "pa_CommonLib_Helper.json");
							wsedit.replace(jsonuri, new vscode.Range(new vscode.Position(0, 0), new vscode.Position(2, 0)), '{"mcu":"unset"}')
							mcuChosen = "unset"
							console.log("tttttttttttttttttttttttttttttttt", mcuChosen)
							vscode.workspace.applyEdit(wsedit);
						}
						if (open) {
							vscode.window.showTextDocument(uriConfig);
						}else{
							lsDirectory(uristr, true, true);
						}
					});
					return;
				}
			}
			console.log("no json")
			const wsedit = new vscode.WorkspaceEdit();
			const jsonuri = vscode.Uri.file(uristr + "/" + "pa_CommonLib_Helper.json");
			wsedit.createFile(jsonuri);
			wsedit.replace(jsonuri, new vscode.Range(new vscode.Position(0, 0), new vscode.Position(2, 0)), '{"mcu":"unset"}')
			mcuChosen = "unset"
			console.log("jkashdjhsakjdhsajhdk", mcuChosen)
			vscode.workspace.applyEdit(wsedit).then(() => {

				if (open) {
					vscode.window.showTextDocument(jsonuri);
				}else{
					vscode.window.showTextDocument(jsonuri);
					vscode.window.showInformationMessage('请先设置MCU宏定义');
				}

			})

		}
	)
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('pa-commonlib-helper.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		if (vscode.workspace.workspaceFolders) {


			// Display a message box to the user
			// vscode.window.showInformationMessage('开始创建模板');
			// const wsedit = new vscode.WorkspaceEdit();
			const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
			console.log("hjasihdsas", wsPath)
			// const filePath2 = vscode.Uri.file(wsPath + '/hello/hi');
			// vscode.workspace.fs.createDirectory(vscode.Uri.parse(wsPath+"\\hellomoto"));
			// vscode.window.showInformationMessage(filePath.toString());
			lookForConfig(wsPath, false, false);

			
		}
		// wsedit.createFile(filePath, { ignoreIfExists: true });
		// wsedit.createFile
		// vscode.workspace.applyEdit(wsedit);
		// vscode.window.showInformationMessage('Created a new file: hello/world.md');
		// vscode.workspace.fs.copy(filePath,filePath2)

	});
	context.subscriptions.push(disposable);
	// let disposable2 = vscode.commands.registerCommand('pa-commonlib-helper.deletepacl', () => {
	// 	// // The code you place here will be executed every time your command is executed

	// 	// // Display a message box to the user
	// 	// if (vscode.workspace.workspaceFolders) {
	// 	// 	lookForConfig(vscode.workspace.workspaceFolders[0].uri.fsPath, false, false);
	// 	// 	// const wsedit = new vscode.WorkspaceEdit();
	// 	// 	const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
	// 	// 	lsDirectory(wsPath, false, true);
	// 	// }
	// });
	let asdad = vscode.commands.registerCommand('pa-commonlib-helper.editlala', () => {
		console.log("sadsadsdasdasdasdsads");
		if (vscode.workspace.workspaceFolders) {
			lookForConfig(vscode.workspace.workspaceFolders[0].uri.fsPath, false, true);
		}
	});
	context.subscriptions.push(asdad);

	// context.subscriptions.push(disposable2);

}

// this method is called when your extension is deactivated
export function deactivate() { }

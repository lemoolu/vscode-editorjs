import * as vscode from 'vscode';
import { getNonce } from './util';

/**
 * Provider for cat scratch editors.
 * 
 * Cat scratch editors are used for `.cscratch` files, which are just json files.
 * To get started, run this extension and open an empty `.cscratch` file in VS Code.
 * 
 * This provider demonstrates:
 * 
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class EditorProvider implements vscode.CustomTextEditorProvider {

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new EditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(EditorProvider.viewType, provider);
    return providerRegistration;
  }

  private static readonly viewType = 'editorjs';

  constructor(
    private readonly context: vscode.ExtensionContext
  ) { }

  /**
   * Called when our custom editor is opened.
   * 
   * 
   */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: 'init',
        text: this.getDocumentAsJson(),
      });
    }

    // Hook up event handlers so that we can synchronize the webview with the text document.
    //
    // The text document acts as our model, so we have to sync change in the document to our
    // editor and sync changes in the editor back to the document.
    // 
    // Remember that a single text document can also be shared between multiple custom
    // editors (this happens for example when you split a custom editor)

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString()) {
        // updateWebview();
      }
    });

    // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage(e => {
      switch (e.type) {
        case 'change':
          this.onChange(document, e);
      }
    });

    // updateWebview();
    webviewPanel.webview.postMessage({
      type: 'init',
      json: this.getDocumentAsJson(document),
    });
  }

  private onChange(document: vscode.TextDocument, e: any) {
    // const json = this.getDocumentAsJson(document);
    this.updateTextDocument(document, e.data);
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const editorjs = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'public', 'editorjs.umd.js'));
    const scriptUri3 = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'index.js'));

    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'public', 'css/reset.css'));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'public', 'css/vscode.css'));

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
        CSP disabled
				-->

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet" />
        <link href="${styleVSCodeUri}" rel="stylesheet" />

        <title></title>
			</head>
			<body>
        <div class="editorjsbg">
          <div id="editorjs"></div>
        </div>
        <script nonce="${nonce}" src="${editorjs}"></script>
        <script nonce="${nonce}" src="${scriptUri3}"></script>
			</body>
			</html>`;
  }
  /**
   * Try to get a current document as json text.
   */
  private getDocumentAsJson(document: vscode.TextDocument): any {
    const text = document.getText();
    if (text.trim().length === 0) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Could not get document as json. Content is not valid json');
    }
  }

  /**
   * Write out the json to a given document.
   */
  private updateTextDocument(document: vscode.TextDocument, json: any) {
    const edit = new vscode.WorkspaceEdit();

    // Just replace the entire document every time for this example extension.
    // A more complete extension should compute minimal edits instead.
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      JSON.stringify(json, null, 2)
    );

    return vscode.workspace.applyEdit(edit);
  }
}
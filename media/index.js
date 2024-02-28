// @ts-ignore
const vscode = acquireVsCodeApi();

const editor = new EditorJS({
  holder: 'editorjs',
  placeholder: 'Let`s write an awesome story!',
  onChange: () => {
    editor.save().then((outputData) => {
      console.log('Article data: ', JSON.stringify(outputData))
      vscode.setState({ text: JSON.stringify(outputData) });
      vscode.postMessage({
        type: 'change',
        data: outputData,
      });
    }).catch((error) => {
      console.log('Saving failed: ', error);
    });
  }
});
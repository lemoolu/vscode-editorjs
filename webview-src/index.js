import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Table from '@editorjs/table';
import SimpleImage from '@editorjs/simple-image';
import NestedList from '@editorjs/nested-list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import CodeTool from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
import LinkTool from '@editorjs/link';
import Embed from '@editorjs/embed';

const vscode = acquireVsCodeApi();

function init(data) {
  const editor = new EditorJS({
    holder: 'editorjs',
    placeholder: 'Let`s write an awesome story!',
    onChange: (api, event) => {
      // console.log('onChange', api, event)
      editor.save().then((outputData) => {
        // vscode.setState({ text: JSON.stringify(outputData) });
        vscode.postMessage({
          type: 'change',
          data: outputData,
        });
      }).catch((error) => {
        console.log('Saving failed: ', error);
      });
    },
    tools: {
      header: {
        class: Header,
        // inlineToolbar: ['marker', 'link'],
        inlineToolbar: true,
        config: {
          placeholder: 'Enter a header',
          levels: [1, 2, 3, 4, 5],
          defaultLevel: 3
        }
      },
      image: {
        class: SimpleImage
      },
      list: {
        class: NestedList,
        inlineToolbar: true,
        config: {
          defaultStyle: 'ordered'
        },
      },
      checklist: {
        class: Checklist,
        inlineToolbar: true,
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
        config: {
          quotePlaceholder: 'Enter a quote',
          captionPlaceholder: 'Quote\'s author',
        },
        shortcut: 'CMD+SHIFT+O'
      },
      marker: {
        class: Marker,
        shortcut: 'CMD+SHIFT+M',
      },
      code: {
        class: CodeTool,
        shortcut: 'CMD+SHIFT+C'
      },
      delimiter: Delimiter,
      inlineCode: {
        class: InlineCode,
        shortcut: 'CMD+SHIFT+C'
      },
      linkTool: LinkTool,
      embed: Embed,
      table: {
        class: Table,
        inlineToolbar: true,
        shortcut: 'CMD+ALT+T',
        config: {
          rows: 2,
          cols: 3,
          withHeadings: true,
        },
      },
    },
    data: data || {}
  });
}

window.addEventListener('message', event => {
  const data = event.data; // The json data that the extension sent
  switch (data.type) {
    case 'init':
      init(data.json);
      break;
  }
});
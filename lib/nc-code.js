'use babel';

//import NC_Code_View from './nc-code-view';
import { CompositeDisposable } from 'atom';

export default {
    subscriptions: null,

    activate(state) {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'nc-code:remove_numbers': () => this.remove_numbers()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'nc-code:renumber': () => this.renumber()
        }));
    },

    deactivate() {
        this.subscriptions.dispose();
    },

    serialize() {
    },

    remove_numbers() {
        if (editor = atom.workspace.getActiveTextEditor()) {
            //selection = editor.getSelectedText()
            //grammar = editor.getGrammar()
            textbuffer = editor.getBuffer()
            //console.error(textbuffer.getPath())
            line_number = new RegExp('^\\d+\\s{1,2}', 'gm')
            textbuffer.replace(line_number, '')
        }
    },

    renumber() {
        this.remove_numbers()
        if (editor = atom.workspace.getActiveTextEditor()) {
            //selection = editor.getSelectedText()
            //grammar = editor.getGrammar()
            textbuffer = editor.getBuffer()
            //console.error(textbuffer.getPath())
            non_numbered_line = new RegExp('^[\\w;].*?', 'gm')
            textbuffer.scan(non_numbered_line, this.renumber_iterator)
        }
    },

    renumber_iterator(scan_result) {
        line_number = scan_result.range.start.row
        new_text = line_number + ' ' + scan_result.matchText
        scan_result.replace(new_text)
    }
};

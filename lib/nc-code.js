'use babel';

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
            'nc-code:renumber_klartext': () => this.renumber_klartext()
        }));

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'nc-code:renumber_g_code': () => this.renumber_g_code()
        }));
    },

    deactivate() {
        this.subscriptions.dispose();
    },

    serialize() {
    },

    remove_numbers() {
        if (editor = atom.workspace.getActiveTextEditor()) {
            textbuffer = editor.getBuffer()
            if(editor.getGrammar().scopeName !== "text.nc-code.klartext") {
                line_number = new RegExp('^\\/\\d+\\s{1,2}', 'gm')
                textbuffer.scan(line_number, this.remove_numbers_iterator)
            } else if (editor.getGrammar().scopeName !== "text.nc-code.g-code") {
                line_number = new RegExp('^\\/?N\\d+ ', 'gm')
                textbuffer.scan(line_number, this.remove_numbers_iterator)
            }
        }
    },

    remove_numbers_iterator(scan_result) {
        //This construct is necesarry because non-capturing groups dont
        //work with replace as expected
        console.info(scan_result.match)
        if (scan_result.matchText.indexOf('/') !== -1){
            new_text = '/'
        } else {
            new_text = ''
        }
        scan_result.replace(new_text)
    },

    renumber() {
        this.remove_numbers()
        if (editor = atom.workspace.getActiveTextEditor()) {
            textbuffer = editor.getBuffer()
            if (editor.getGrammar().scopeName !== "text.nc-code.klartext") {
                non_numbered_line = new RegExp('^[\\w;].*?', 'gm')
                textbuffer.scan(non_numbered_line, this.renumber_klartext_iterator)
            } else if (editor.getGrammar().scopeName !== "text.nc-code.g-code") {
                non_numbered_line = new RegExp('^[\\w;].*?', 'gm')
                textbuffer.scan(non_numbered_line, this.renumber_g_code_iterator)
            }
        }
    },

    renumber_klartext_iterator(scan_result) {
        line_number = scan_result.range.start.row
        if (scan_result.matchText.indexOf('/') !== -1){
            new_text = '/' + line_number + ' ' + scan_result.matchText
        } else {
            new_text = line_number + ' ' + scan_result.matchText
        }
        scan_result.replace(new_text)
    },

    renumber_g_code_iterator(scan_result) {
        line_number = scan_result.range.start.row * 5
        if (scan_result.matchText.indexOf('/') !== -1){
            new_text = '/N' + line_number + ' ' + scan_result.matchText
        } else {
            new_text = 'N' +line_number + ' ' + scan_result.matchText
        }
        scan_result.replace(new_text)
    }

};

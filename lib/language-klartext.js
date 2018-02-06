
const {CompositeDisposable} = require('atom');
const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;

let current_line_numer = 0;

function scan_buffer(regexp, callback) {
  const search_regex = new RegExp(regexp, 'gm');
  editor.getBuffer().scan(search_regex, callback);
}

function remove_line_numbers() {
  console.debug("Remove Line Numbers");
  const editor = atom.workspace.getActiveTextEditor();
  const grammer = editor.getGrammar().scopeName;
  if(grammer === "source.klartext") {
    console.debug("Grammar OK - Klartext");
    scan_buffer('^\\/?\\d+\\s{1,2}', remove_line_numbers_iterator);
  } else if (grammer === "source.g-code") {
    console.debug("Grammar OK - G-Code");
    scan_buffer('^N\\s*\\d+\\s+', remove_line_numbers_iterator);
  } else {
    console.warn(`Unsupported grammar: '${grammer}', expected 'source.klartext' or 'source.g-code'`);
  }
}

function remove_line_numbers_iterator(scan_result) {
  let new_text;
  if (scan_result.matchText.indexOf('/') !== -1) {
    new_text = '/ ';
  } else {
    new_text = '';
  }
  scan_result.replace(new_text);
}

function add_line_numbers(remove_numbers = true) {
  console.debug("Add Line Numbers");
  if (remove_numbers === true){
    remove_line_numbers();
  }
  current_line_numer = 0;
  const editor = atom.workspace.getActiveTextEditor();
  const grammer = editor.getGrammar().scopeName;
  if (grammer === "source.klartext") {
    console.debug("Grammar OK - Klartext");
    scan_buffer('^[\\w;].*?', add_line_numbers_iterator);
  } else {
    console.warn(`Unsupported grammar: '${grammer}', expected 'source.klartext'`);
    dialog.showMessageBox({ message: "Function not availible for this file format", buttons: ["OK"] });
  }
}

function add_line_numbers_iterator(scan_result) {
  let new_text;
  if (scan_result.matchText.indexOf('/') !== -1){
    new_text = '/' + current_line_numer + ' ' + scan_result.matchText;
  } else {
    new_text = current_line_numer + ' ' + scan_result.matchText;
  }
  current_line_numer = current_line_numer + 1;
  scan_result.replace(new_text);
}

function correct_number_format(){
  console.debug("Correct number format");
  const editor = atom.workspace.getActiveTextEditor();
  const grammer = editor.getGrammar().scopeName;
  if(grammer == "source.klartext") {
    console.debug("Grammar OK - Klartext");
    scan_buffer('([\\+-]\\d+,\\d+)', correct_number_format_iterator);
  } else {
    console.warn(`Unsupported grammar: '${grammer}', expected 'source.klartext'`);
    dialog.showMessageBox({ message: "Function not availible for this file format", buttons: ["OK"] });
  }
}

function correct_number_format_iterator(scan_result){
  const new_text = scan_result.matchText.replace(',', '.');
  scan_result.replace(new_text);
}

module.exports = {
  subscriptions: null,
  config: {
    NumberingIncrementGCode: {
      title: 'Numbering Increment for G-Code',
      description: 'Line numbers are incrementet by this number',
      type: 'integer',
      default: 10,
      minimum: 1,
      maximum: 100,
    }
  },

  activate() {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:remove_line_numbers': () => remove_line_numbers()}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:add_line_numbers': () => add_line_numbers(remove_numbers = false)}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:renumber_lines': () => add_line_numbers(remove_numbers = true)}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:correct_number_format': () => correct_number_format()}));
  },

  deactivate() {
    this.subscriptions.dispose();
  }
}

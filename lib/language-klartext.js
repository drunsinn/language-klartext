
const {CompositeDisposable} = require('atom');
const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;

let current_line_numer = 0;
let current_grammar = "";

function scan_buffer(regexp, edit_ref, callback, flags='gm') {
  const search_regex = new RegExp(regexp, flags);
  edit_ref.getBuffer().scan(search_regex, callback);
}

function remove_line_numbers() {
  console.debug("Remove Line Numbers");
  const editor = atom.workspace.getActiveTextEditor();
  current_grammar = editor.getGrammar().scopeName;
  if(current_grammar === "source.klartext") {
    console.debug("Grammar OK - Klartext");
    scan_buffer('^\\/?\\d+\\s{1,2}', editor, remove_line_numbers_iterator);
  } else if (current_grammar.startsWith("source.g-code")) {
    console.debug("Grammar OK - G-Code");
    scan_buffer('^N\\s*\\d+\\s+', editor, remove_line_numbers_iterator);
  } else {
    console.warn(`Unsupported grammar: '${grammer}', expected 'source.klartext' or 'source.g-code'`);
    dialog.showMessageBox({ message: "Function not availible for this file format", buttons: ["OK"] });
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
  const editor = atom.workspace.getActiveTextEditor();
  // console.debug(`number of lines: '${editor.getLineCount()}'`)
  current_grammar = editor.getGrammar().scopeName;
  if (current_grammar === "source.klartext") {
    console.debug("Grammar OK - Klartext");
    current_line_numer = 0;
    scan_buffer('^[\\w;\\*].*?', editor, add_line_numbers_iterator);
  } else if (current_grammar === "source.g-code" || current_grammar === "source.g-code.siemens") {
    console.debug("Grammar OK - G-Code");
    current_line_numer = 10;
    scan_buffer('^.*?', editor, add_line_numbers_iterator);
  } else {
    console.warn(`Unsupported grammar: '${current_grammar}', expected 'source.klartext'`);
    dialog.showMessageBox({ message: "Function not availible for this file format", buttons: ["OK"] });
  }
}

function add_line_numbers_iterator(scan_result) {
  let new_text;
  let line_prefix = ""
  if (current_grammar.startsWith("source.g-code")){
    line_prefix = "N";
  }
  if (scan_result.matchText.indexOf('/') !== -1){
    new_text = '/' + line_prefix + current_line_numer + ' ' + scan_result.matchText;
  } else {
    new_text = line_prefix + current_line_numer + ' ' + scan_result.matchText;
  }
  if (current_grammar.startsWith("source.g-code")){
    current_line_numer = current_line_numer + atom.config.get('language-klartext.NumberingIncrementGCode');
  } else {
    current_line_numer = current_line_numer + 1;
  }
  scan_result.replace(new_text);
}

function correct_number_format(){
  console.debug("Correct number format");
  const editor = atom.workspace.getActiveTextEditor();
  current_grammar = editor.getGrammar().scopeName;
  if(current_grammar == "source.klartext") {
    console.debug("Grammar OK - Klartext");
    scan_buffer('([\\+-]\\d+,\\d+)', editor, correct_number_format_iterator);
  } else {
    console.warn(`Unsupported grammar: '${current_grammar}', expected 'source.klartext'`);
    dialog.showMessageBox({ message: "Function not availible for this file format", buttons: ["OK"] });
  }
}

function correct_number_format_iterator(scan_result){
  const new_text = scan_result.matchText.replace(',', '.');
  scan_result.replace(new_text);
}

function keywords_to_upper(){
  console.debug(`Change all keywords to upper case`);
  const editor = atom.workspace.getActiveTextEditor();

  regex = '(' + atom.config.get('language-klartext.KeyWordList').replace(new RegExp(', ', 'g'), '|') + ')';
  scan_buffer(regex, editor, to_upper_iterator, 'gi');
}

function to_upper_iterator(scan_result){
  const new_text = scan_result.matchText.toUpperCase();
  console.debug(scan_result, new_text);
  scan_result.replace(new_text);
}

module.exports = {
  subscriptions: null,

  config: {
    NumberingIncrementGCode: {
      title: 'Numbering Increment for G-Code',
      description: 'Adjust increment for line numbers in nc code. Integer between 1 an 100',
      type: 'integer',
      default: 10,
      minimum: 1,
      maximum: 100,
    },
    KeyWordList: {
      title: 'List of Keywords converted to upper case',
      description: 'Comma seperated list of keywords that should be converted to upper case',
      type: 'string',
      default: 'BEGIN PGM, TOOL, CYCL, CALL, LBL, DEF, POS, END PGM',
    }
  },

  activate() {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:remove_line_numbers': () => remove_line_numbers()}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:add_line_numbers': () => add_line_numbers(remove_numbers = false)}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:renumber_lines': () => add_line_numbers(remove_numbers = true)}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:correct_number_format': () => correct_number_format()}));
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:keywords_to_upper': () => keywords_to_upper()}));
  },

  deactivate() {
    this.subscriptions.dispose();
  }
}

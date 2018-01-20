
const {CompositeDisposable} = require('atom')

module.exports = {
  subscriptions: null,
  current_line_numer: 0,

  activate () {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:remove_line_numbers': () => this.remove_line_numbers()}))
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:add_line_numbers': () => this.add_line_numbers(remove_numbers = false)}))
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:renumber_lines': () => this.add_line_numbers(remove_numbers = true)}))
    this.subscriptions.add(atom.commands.add('atom-workspace', {'language-klartext:correct_number_format': () => this.correct_number_format()}))
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  remove_line_numbers(){
    console.debug("Remove Line Numbers")
    const editor = atom.workspace.getActiveTextEditor()
    if(editor.getGrammar().scopeName == "source.klartext") {
      console.debug("Grammar OK - Klartext")
      textbuffer = editor.getBuffer()
      search_regex = new RegExp('^\\/?\\d+\\s{1,2}', 'gm')
      textbuffer.scan(search_regex, this.remove_line_numbers_iterator)
    } else if (editor.getGrammar().scopeName == "source.g-code") {
      console.debug("Grammar OK - G-Code")
      textbuffer = editor.getBuffer()
      search_regex = new RegExp('^N\\s*\\d+\\s+', 'gm')
      textbuffer.scan(search_regex, this.remove_line_numbers_iterator)
    } else {
      console.debug("Inkorrekt Grammar")
    }
  },

  remove_line_numbers_iterator(scan_result){
    if (scan_result.matchText.indexOf('/') !== -1){
        new_text = '/ '
    } else {
        new_text = ''
    }
    scan_result.replace(new_text)
  },

  add_line_numbers(remove_numbers = true) {
    console.debug("Add Line Numbers")
    if (remove_numbers == true){
      this.remove_line_numbers()
    }
    current_line_numer = 0
    const editor = atom.workspace.getActiveTextEditor()
    if(editor.getGrammar().scopeName == "source.klartext") {
      search_regex = new RegExp('^[\\w;].*?', 'gm')
      textbuffer.scan(search_regex, this.add_line_numbers_iterator)
    } else {
      console.debug("Inkorrekt Grammar")
    }
  },

  add_line_numbers_iterator(scan_result){
    if (scan_result.matchText.indexOf('/') !== -1){
        new_text = '/' + current_line_numer + ' ' + scan_result.matchText
    } else {
        new_text = current_line_numer + ' ' + scan_result.matchText
    }
    current_line_numer = current_line_numer + 1
    scan_result.replace(new_text)
  },

  correct_number_format(){
    console.debug("Correct number format")
    const editor = atom.workspace.getActiveTextEditor()
    if(editor.getGrammar().scopeName == "source.klartext") {
      console.debug("Grammar OK")
      textbuffer = editor.getBuffer()
      search_regex = new RegExp('([\\+-]\\d+,\\d+)', 'gm')
      textbuffer.scan(search_regex, this.correct_number_format_iterator)
    } else {
      console.debug("Inkorrekt Grammar")
    }
  },

  correct_number_format_iterator(scan_result){
    new_text = scan_result.matchText.replace(',', '.')
    scan_result.replace(new_text)
  },
}

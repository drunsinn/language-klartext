## 0.6.0 - mostly house keeping
* refactoring and code cleanup of javascript functions
* more g-code parameters and code folding for units
* more file types for g-code: Siemens mpf and spf, CNCpilot ncs

## 0.5.4 - fixing stuff
* fixed link for bug reporting
* fixed missing charackters in cycle names
* fixed parameter type for cycle definition
* added move back command

## 0.5.2 - start of rewrite
* complete rewrite of grammar
*  - changed syntax highlighting to more meaningfull styles
*  - simplyfied grammar parsing regex
* fixed errors in library function for line numbers
* added basic grammar for PNT-files (table with point definition for patterns)

## 0.4.1 - snippets and code functions
* Added simple snippets for G-Code and Klartext
* Added function to remove line numbers

## 0.2.0 - Start of g-code support
* Added syntax highlighting for the following commands:
*  - G-Code:
*    - G-Function
*    - M-Function
*    - cartesian coordinates
*    - comments
*    - program head and foot
*  - Klartext:
*    - special functions: TCPM and PLANE (need more examples)
*    - Block form for cylindrical and rotation bodys
* Bugs fixed:
*  - Klartext: AUTO and MAX did not work for new style cycle definitions
*  - Klartext: TOOL CALL didn't work with named tools

## 0.1.0 - First Release
* Added highlighting for the following commands:
*  - program head and foot
*  - comments
*  - line numbers
*  - linear movement sentence
*  - cartesian and polar coordinate
*  - Q-parameters
*  - Block form (cuboid only)
*  - outline comments
*  - tool call
*  - label definition and call
*  - program call
*  - cycle definition and call
*  - basic keywords for FN-functions

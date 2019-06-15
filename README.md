# workfl.ws

A web editor for [workfl](https://github.com/Dullage/workfl) (a lightweight markup language for simple workflow diagrams).

Link: <https://workfl.ws>

The editor uses [workfl](https://github.com/Dullage/workfl) to convert the text input to [mermaid](https://mermaidjs.github.io/) syntax which is then rendered into a diagram SVG using the mermaid api.

## To Do

* PNG export.
* Add diagrams to help modal.
* Scrollbar styling (for long input). This is done on the help modal using [simplebar](https://github.com/Grsmto/simplebar) but this is incompatible with textarea.
* workfl allows for node and connection descriptions. Mermaid supports tooltips so may be used to display these connection descriptions?
* Syntax highlighting.

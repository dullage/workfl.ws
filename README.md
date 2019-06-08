![Release](https://img.shields.io/badge/release-alpha-%23028CC3.svg)

# workfl.ws

A web editor for [workfl](https://github.com/Dullage/workfl) (a lightweight markup language for simple workflow diagrams).

Link: <https://workfl.ws>

The editor uses [workfl](https://github.com/Dullage/workfl) to convert the text input to [mermaid](https://mermaidjs.github.io/) syntax which is then rendered into a diagram SVG using the mermaid api.

## To Do

* Add diagrams to help modal.
* Allow diagram direction to be set.
* Onboarding.
* Scrollbar styling (for long input). This is done on the help modal using [simplebar](https://github.com/Grsmto/simplebar) but this is incompatible with textarea.
* Handle large workflows (scrolling / panning?).
* Saving. Can the markup be stored in the URL similar to [itty.bitty.site](http://link.dullage.com/21a98)?
* workfl allows for node and connection descriptions. A mermaid callback may be able show these descriptions in a popup.
* Syntax highlighting.

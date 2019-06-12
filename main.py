from flask import Flask, render_template, request

import workfl

app = Flask(__name__)


@app.route("/")
def index():
    show_help = request.args.get("help")
    return render_template("index.html", show_help=show_help)


@app.route("/render", methods=["POST"])
def render():
    markup = request.form["input"]
    direction = request.form.get("direction", "TB")

    mermaid = workfl.ws(markup).to_mermaid(direction=direction)
    return mermaid

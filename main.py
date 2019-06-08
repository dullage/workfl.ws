from flask import Flask, render_template, request
import workfl

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/render", methods=["POST"])
def render():
    markup = request.form["input"]
    mermaid = workfl.ws(markup).to_mermaid()
    return mermaid

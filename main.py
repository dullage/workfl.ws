import json
from base64 import urlsafe_b64decode, urlsafe_b64encode
from zlib import compress, decompress

from flask import Flask, render_template, request, url_for

import workfl

app = Flask(__name__)

DEFAULT_WORKFL = "Welcome\n  to\nworkfl.ws"


@app.route("/", defaults={"workflow": None})
@app.route("/<string:workflow>")
def index(workflow):
    if workflow is None:
        _workfl = DEFAULT_WORKFL
    else:
        try:
            _workfl = decompress(urlsafe_b64decode(workflow)).decode()
        except Exception:
            _workfl = DEFAULT_WORKFL

    mermaid = workfl.ws(_workfl).to_mermaid()

    return render_template("index.html", workfl=_workfl, mermaid=mermaid)


@app.route("/render", methods=["POST"])
def render():
    _workfl = request.form["workfl"]
    direction = request.form.get("direction", "TB")

    mermaid = workfl.ws(_workfl).to_mermaid(direction=direction)

    test = workfl.ws(_workfl)
    print(test.nodes)
    test.to_mermaid()
    print(test.nodes)

    return mermaid


@app.route("/share", methods=["POST"])
def get_link():
    _workfl = request.form.get("workfl")
    _workfl_zip = urlsafe_b64encode(compress(_workfl.encode()))

    response = json.dumps(
        {
            "url": url_for(
                "index",
                _external=True,
                workflow=_workfl_zip,
                fullscreen="true",
            ),
            "len": len(_workfl_zip),
        }
    )

    return response

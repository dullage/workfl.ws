mermaid.mermaidAPI.initialize({
    startOnLoad: false
});

var oldInputVal = "";
var typingTimer;
var doneTypingInterval = 1000;

$(document).ready(function () {
    $("#input").on("change keyup paste", inputChangeCheck);
    $("#help-button").click(toggleHelpModal)
    $("#help-modal").click(toggleHelpModal)
})

function inputChangeCheck() {
    var currentInputVal = $(this).val();
    if (currentInputVal == oldInputVal) {
        return; //check to prevent multiple simultaneous triggers
    }
    else {
        onInputChange()
    }
    oldInputVal = currentInputVal;
}

function onInputChange() {
    $("#flow-svg").hide()
    $("#loading-spinner").show()

    clearTimeout(typingTimer);
    typingTimer = setTimeout(renderFlow, doneTypingInterval);
}

function renderFlow() {
    $("#loading-spinner").hide()

    var $input = $("#input")
    var $flow = $("#flow-svg")

    // Request the Mermaid ML.
    $.post("/render", { input: $input.val() }, function(result) {
        var mermaidMl = result

        // Generate a unique id
        var needsUniqueId = "render" + (Math.floor(Math.random() * 10000)).toString()

        // Function to insert the returned SVG
        var insertSvg = function (svg) {
            $flow.html(svg)
        }

        // Render the Mermaid ML
        mermaid.mermaidAPI.render(needsUniqueId, mermaidMl, insertSvg);
        $("#flow-svg").show()
    })
}

function toggleHelpModal() {
    $("#help-modal").toggle()
}

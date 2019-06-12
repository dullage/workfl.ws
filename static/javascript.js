// Globals
var workflWs = { direction: "TB" }

function toggleHelpModal() {
    var $helpModal = $("#help-modal");
    $helpModal.toggle();
};

$(document).ready(function () {
    var $input = $("#input");
    var $helpButton = $("#help-button");
    var $helpModal = $("#help-modal");
    var $directionButton = $("#direction-button");

    $input.on("change keyup paste", inputChangeCheck);
    $helpButton.click(toggleHelpModal);
    $helpModal.click(toggleHelpModal);
    $directionButton.click(toggleDirection);
    $(window).resize(windowResize);

    mermaid.mermaidAPI.initialize({
        startOnLoad: false
    });

    renderMermaid();  // Render the default workflow
});

var inputChangeCheck = (function () {
    var oldInputVal = "";

    return function () {
        var currentInputVal = $(this).val();

        if (currentInputVal == oldInputVal) {
            return;  // Check to prevent multiple simultaneous triggers
        }
        else {
            onInputChange();
        };

        oldInputVal = currentInputVal;
    }
})();

function windowResize() {
    clearTimeout(workflWs.resizeTimer);
    workflWs.resizeTimer = setTimeout(fitSvg, 1000);
};

function onInputChange() {
    var $svg = $("svg");
    var $loadingSpinner = $("#loading-spinner");

    $svg.remove();
    $loadingSpinner.show();

    clearTimeout(workflWs.typingTimer);
    workflWs.typingTimer = setTimeout(requestMermaid, 1000);
};

function requestMermaid() {
    var $input = $("#input");
    var $mermaid = $("#mermaid");

    $.post("/render", { input: $input.val(), direction: workflWs.direction }, function (result) {
        $mermaid.text(result);
        renderMermaid();
    });
};

function renderMermaid() {
    var $mermaid = $("#mermaid");
    var $loadingSpinner = $("#loading-spinner");
    var $rightPanel = $("#right-panel");
    var uniqueId = "render" + (Math.floor(Math.random() * 10000)).toString();
    var mermaidMl = $mermaid.text();

    // Function to insert and display the returned SVG
    var insertSvg = function (svg) {
        $loadingSpinner.hide();
        $rightPanel.append(svg);
    };

    // Render the Mermaid ML
    mermaid.mermaidAPI.render(uniqueId, mermaidMl, insertSvg);

    // Fit the SVG to the container
    fitSvg();
};

function fitSvg() {
    var svgWidth, svgHeight, rightPanelWidth, rightPanelHeight;
    var $rightPanel = $("#right-panel");
    var $svg = $("svg");

    // Get the full size of the SVG before hiding it.
    svgWidth = $svg.width();
    svgHeight = $svg.height();

    $svg.hide();

    // Get the natural size of the right panel after the SVG is hidden.
    rightPanelWidth = $rightPanel.width();
    rightPanelHeight = $rightPanel.height();

    // Size the SVG according to the available space.
    $svg.width(rightPanelWidth);
    $svg.height(rightPanelHeight);
    $svg.css({ "max-width": "none" });

    // Show the SVG and enable panning and zooming.
    $svg.show();
    panZoom = svgPanZoom($svg[0]);

    // If the SVG is smaller than the panel, zoom out.
    if ((svgWidth < rightPanelWidth) & (svgHeight < rightPanelHeight)) {
        widthDecimal = 1 / (rightPanelWidth / svgWidth);
        heightDecimal = 1 / (rightPanelHeight / svgHeight);

        if (widthDecimal > heightDecimal) {
            panZoom.setMinZoom(widthDecimal);
            panZoom.zoom(widthDecimal);
        }
        else {
            panZoom.setMinZoom(heightDecimal);
            panZoom.zoom(heightDecimal);
        }
    }
    else {
        panZoom.setMinZoom(1);
    }

    panZoom.setZoomScaleSensitivity(0.4);
}

function toggleDirection() {
    var $svg = $("svg");
    var $directionButton = $("#direction-button");

    $svg.remove();

    if (workflWs.direction == "TB") {
        workflWs.direction = "LR";
        $directionButton.css({ "transform": "rotate(-90deg)" });
    }
    else {
        workflWs.direction = "TB";
        $directionButton.css({ "transform": "rotate(0deg)" });
    }

    // TODO: Do this locally rather than requesting from the server.
    requestMermaid();
};

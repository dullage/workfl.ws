// Globals
var workflWs = { direction: "TB", panZoom: null }

$(document).ready(function () {
    // Selector Variables
    var $coverall = $("#coverall");
    var $helpButton = $("#help-button");
    var $helpModal = $("#help-modal");
    var $shareButton = $("#share-button");
    var $shareModal = $("#share-modal");
    var $shareUrl = $("#share-url");
    var $shareUrlCopyButton = $("#share-url-copy-button");
    var $shareUrlCopied = $("#share-url-copied");
    var $shareUrlLengthWarning = $("#share-url-length-warning");
    var $modals = $(".modal");
    var $input = $("#input");
    var $directionButton = $("#direction-button");
    var $fullscreenButton = $("#fullscreen-button");
    var $editButton = $("#edit-button");
    var urlParams = new URLSearchParams(window.location.search);

    // Window Resizing
    $(window).resize(windowResize);

    // Help Button
    $helpButton.click(function () {
        $helpModal.fadeIn(100);
    });

    // Share Button
    $shareButton.click(function () {
        $shareUrlLengthWarning.hide();
        $shareUrl.val("Loading...");
        $shareModal.fadeIn(100);
        getShareUrl();
    });

    // Copy URL Button
    $shareUrlCopyButton.click(function () {
        $shareUrl.select();
        document.execCommand("copy");
        $shareUrlCopied.show();
        $shareUrlCopied.fadeOut(2000);
    });

    // Modal Closing
    $modals.mousedown(function (event) {
        $modals.fadeOut(100);
    })
    $modals.children().mousedown(function (e) {
        e.stopPropagation();
    });

    // Input Change
    $input.on("change keyup paste", inputChangeCheck);

    // Direction Button
    $directionButton.click(toggleDirection);

    // Fullscreen Button
    $fullscreenButton.click(toggleFullscreen);

    // Edit Button
    $editButton.click(toggleFullscreen);

    // Initialize Mermaid
    mermaid.mermaidAPI.initialize({
        startOnLoad: false
    });
    renderMermaid();  // Render the default workflow

    // Show Help on Load?
    if (urlParams.get("show-help") == "true") {
        $helpModal.show();
    };

    // Go Fullscreen on Load?
    if (urlParams.get("fullscreen") == "true") {
        toggleFullscreen();  // This includes $coverall.fadeOut(200);
    }
    else {
        $coverall.fadeOut(200);
    };
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
    // Re-render the workflow after resizing the viewport
    clearTimeout(workflWs.resizeTimer);
    workflWs.resizeTimer = setTimeout(renderMermaid, 600);
};

function onInputChange() {
    var $svg = $("#right-panel svg");
    var $loadingSpinner = $("#loading-spinner");

    $svg.hide();
    $loadingSpinner.show();

    clearTimeout(workflWs.typingTimer);
    workflWs.typingTimer = setTimeout(requestMermaid, 1000);
};

function requestMermaid() {
    var $input = $("#input");
    var $mermaid = $("#mermaid");

    $.post("/render", { workfl: $input.val(), direction: workflWs.direction }, function (result) {
        $mermaid.text(result);
        renderMermaid();
    });
};

function renderMermaid() {
    var $mermaid = $("#mermaid");
    var $loadingSpinner = $("#loading-spinner");
    var $rightPanel = $("#right-panel");
    var $svg = $("#right-panel svg");
    var uniqueId = "render" + (Math.floor(Math.random() * 10000)).toString();
    var mermaidMl = $mermaid.text();

    // Remove the existing SVG
    $svg.remove();

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
    var $svg = $("#right-panel svg");
    var $zoomInButton = $("#zoom-in-button");
    var $zoomOutButton = $("#zoom-out-button");

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
    workflWs.panZoom = svgPanZoom($svg[0]);

    // Bind Zoom Buttons
    $zoomInButton.click(function() {
        workflWs.panZoom.zoomIn();
    })
    $zoomOutButton.click(function() {
        workflWs.panZoom.zoomOut();
    })

    // If the SVG is smaller than the panel, zoom out.
    if ((svgWidth < rightPanelWidth) & (svgHeight < rightPanelHeight)) {
        widthDecimal = 1 / (rightPanelWidth / svgWidth);
        heightDecimal = 1 / (rightPanelHeight / svgHeight);

        if (widthDecimal > heightDecimal) {
            workflWs.panZoom.setMinZoom(widthDecimal);
            workflWs.panZoom.zoom(widthDecimal);
        }
        else {
            workflWs.panZoom.setMinZoom(heightDecimal);
            workflWs.panZoom.zoom(heightDecimal);
        }
    }
    else {
        workflWs.panZoom.setMinZoom(1);
    }

    workflWs.panZoom.setZoomScaleSensitivity(0.4);
}

function toggleDirection() {
    var $svg = $("#right-panel svg");
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

function toggleFullscreen() {
    var $coverall = $("#coverall");
    var $leftPanel = $("#left-panel");
    var $gutter = $(".gutter");
    var $rightPanel = $("#right-panel");
    var $directionButton = $("#direction-button");
    var $fullscreenButton = $("#fullscreen-button");
    var $editButton = $("#edit-button");
    var $h1 = $("h1")

    $coverall.fadeIn(200, function () {
        $leftPanel.toggle();
        $gutter.toggle();
        $rightPanel.toggleClass("fullscreen");
        $directionButton.toggle();
        $fullscreenButton.toggle();
        $editButton.toggle();
        $h1.toggleClass("fullscreen");

        renderMermaid();

        $coverall.fadeOut(200);
    });
};

function getShareUrl() {
    var $input = $("#input");
    var $shareUrl = $("#share-url")
    var $shareUrlLengthWarning = $("#share-url-length-warning");

    $.post("/share", { workfl: $input.val() }, function (result) {
        $shareUrl.val(result.url);
        if (result.len > 2000) {
            $shareUrlLengthWarning.fadeIn(600);
        }
    }, "json");
};

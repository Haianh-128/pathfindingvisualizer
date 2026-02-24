var algorithmDescriptions = require("./algorithmDescriptions");

function showAlgorithmInfo(algorithmKey) {
  var data = algorithmDescriptions.descriptions[algorithmKey];
  if (!data) return;

  // Remove old modal if it exists
  var old = document.getElementById("algorithmInfoModal");
  if (old && old.parentNode) old.parentNode.removeChild(old);

  var html = '<div class="modal fade dark-stage" id="algorithmInfoModal" tabindex="-1">' +
    '<div class="modal-dialog modal-lg">' +
    '<div class="modal-content algo-modal-content">' +
    '<div class="modal-header">' +
    '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
    '<h4 class="modal-title">' + data.name + '</h4>' +
    '<div class="algo-modal-meta">' +
    '<span class="badge">' + data.category + '</span>' +
    '<span class="badge">' + (data.guaranteesOptimal ? "Optimal" : "Not optimal") + '</span>' +
    '</div>' +
    '<div class="algo-modal-divider" aria-hidden="true"></div>' +
    '</div>' +
    '<div class="modal-body">' +
    '<p>' + data.shortDescription + '</p>' +
    '<h5>How It Works</h5><ol>' +
    data.howItWorks.map(function (s) { return '<li>' + s + '</li>'; }).join('') +
    '</ol>' +
    '<h5>Pseudocode</h5><pre class="algo-pseudocode">' +
    data.pseudocode.join("\n") +
    '</pre>' +
    '<div class="algo-insight"><strong>Key Insight:</strong> ' + data.keyInsight + '</div>' +
    '<h5>Characteristics</h5>' +
    '<table class="table table-condensed">' +
    '<tr><td>Data Structure</td><td>' + data.characteristics.dataStructure + '</td></tr>' +
    '<tr><td>Time Complexity</td><td>' + data.characteristics.timeComplexity + '</td></tr>' +
    '<tr><td>Uses Heuristic</td><td>' + (data.characteristics.usesHeuristic ? "Yes" : "No") + '</td></tr>' +
    '<tr><td>Selection Rule</td><td>' + data.characteristics.selectionRule + '</td></tr>' +
    '</table>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button type="button" class="btn btn-default" data-dismiss="modal">Got it!</button>' +
    '</div>' +
    '</div></div></div>';

  var wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  var modal = wrapper.firstChild;
  document.body.appendChild(modal);

  $(modal).modal("show");

  $(modal).on("hidden.bs.modal", function () {
    if (modal.parentNode) modal.parentNode.removeChild(modal);
  });
}

module.exports = { showAlgorithmInfo: showAlgorithmInfo };

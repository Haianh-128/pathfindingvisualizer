var algorithmDescriptions = require("./algorithmDescriptions");
var algorithmModal = require("./algorithmModal");

var ALGORITHM_ORDER = [
  "dijkstra",
  "astar",
  "greedy",
  "swarm",
  "convergentSwarm",
  "bidirectional",
  "bfs",
  "dfs"
];

function escapeHTML(value) {
  return String(value === undefined || value === null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function yesNo(value) {
  return value ? "Yes" : "No";
}

function completeLabel(value) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Variant dependent";
}

function weightedLabel(category) {
  return category === "weighted" ? "Yes" : "No";
}

function buildTableRows() {
  return ALGORITHM_ORDER.map(function (key) {
    var data = algorithmDescriptions.descriptions[key];
    if (!data) return "";
    var characteristics = data.characteristics || {};
    return (
      "<tr>" +
      "<td>" + escapeHTML(data.name) + "</td>" +
      "<td>" + weightedLabel(data.category) + "</td>" +
      "<td>" + yesNo(data.guaranteesOptimal) + "</td>" +
      "<td>" + completeLabel(data.complete) + "</td>" +
      "<td>" + yesNo(characteristics.usesHeuristic) + "</td>" +
      "<td>" + escapeHTML(characteristics.selectionRule) + "</td>" +
      "<td>" + escapeHTML(characteristics.timeComplexity) + "</td>" +
      "<td>" + escapeHTML(characteristics.spaceComplexity) + "</td>" +
      '<td><button class="btn btn-xs btn-default compare-open-algo" data-key="' + escapeHTML(key) + '" type="button">Open details</button></td>' +
      "</tr>"
    );
  }).join("");
}

function buildCardRows() {
  return ALGORITHM_ORDER.map(function (key) {
    var data = algorithmDescriptions.descriptions[key];
    if (!data) return "";
    var characteristics = data.characteristics || {};

    return (
      '<article class="algo-compare-card">' +
      '<div class="algo-compare-card-head">' +
      '<h5 class="algo-compare-card-title">' + escapeHTML(data.name) + '</h5>' +
      '<button class="btn btn-sm btn-default compare-open-algo" data-key="' + escapeHTML(key) + '" type="button">Open details</button>' +
      '</div>' +
      '<div class="algo-compare-card-grid">' +
      '<div class="algo-compare-card-item"><span class="label">Weighted</span><span class="value">' + weightedLabel(data.category) + '</span></div>' +
      '<div class="algo-compare-card-item"><span class="label">Optimal</span><span class="value">' + yesNo(data.guaranteesOptimal) + '</span></div>' +
      '<div class="algo-compare-card-item"><span class="label">Complete</span><span class="value">' + completeLabel(data.complete) + '</span></div>' +
      '<div class="algo-compare-card-item"><span class="label">Heuristic</span><span class="value">' + yesNo(characteristics.usesHeuristic) + '</span></div>' +
      '<div class="algo-compare-card-item"><span class="label">Time</span><span class="value">' + escapeHTML(characteristics.timeComplexity) + '</span></div>' +
      '<div class="algo-compare-card-item"><span class="label">Space</span><span class="value">' + escapeHTML(characteristics.spaceComplexity) + '</span></div>' +
      '</div>' +
      '<p class="algo-compare-card-rule"><strong>Selection Rule:</strong> ' + escapeHTML(characteristics.selectionRule) + '</p>' +
      '</article>'
    );
  }).join("");
}

function showComparisonModal() {
  var old = document.getElementById("algorithmCompareModal");
  if (old && old.parentNode) old.parentNode.removeChild(old);

  var html =
    '<div class="modal fade dark-stage algo-compare-modal" id="algorithmCompareModal" tabindex="-1">' +
    '  <div class="modal-dialog modal-lg">' +
    '    <div class="modal-content algo-modal-content">' +
    '      <div class="modal-header">' +
    '        <button type="button" class="close" data-dismiss="modal">&times;</button>' +
    '        <h4 class="modal-title">Algorithm Comparison</h4>' +
    '        <div class="algo-modal-divider" aria-hidden="true"></div>' +
    "      </div>" +
    '      <div class="modal-body">' +
    '        <div class="algo-compare-card-list">' +
    buildCardRows() +
    "        </div>" +
    '        <div class="table-responsive">' +
    '          <table class="table table-condensed algo-compare-table">' +
    "            <thead>" +
    "              <tr>" +
    "                <th>Algorithm</th>" +
    "                <th>Weighted</th>" +
    "                <th>Optimal</th>" +
    "                <th>Complete</th>" +
    "                <th>Heuristic</th>" +
    "                <th>Selection Rule</th>" +
    "                <th>Time Complexity</th>" +
    "                <th>Space Complexity</th>" +
    "                <th>Details</th>" +
    "              </tr>" +
    "            </thead>" +
    "            <tbody>" +
    buildTableRows() +
    "            </tbody>" +
    "          </table>" +
    "        </div>" +
    '        <h5>Quick Selection Guide</h5>' +
    '        <ul class="algo-compare-guide">' +
    "          <li>Need guaranteed lowest-cost path on weighted maps: use Dijkstra or A*.</li>" +
    "          <li>Need faster practical results and can accept non-optimal paths: use Greedy, Swarm, or Convergent Swarm.</li>" +
    "          <li>Need shortest path by steps on unweighted maps: use BFS.</li>" +
    "          <li>Need fast reachability traversal, not shortest paths: use DFS.</li>" +
    "          <li>Need bidirectional exploration behavior on larger maps: use Bidirectional Swarm.</li>" +
    "        </ul>" +
    "      </div>" +
    '      <div class="modal-footer">' +
    '        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
    "      </div>" +
    "    </div>" +
    "  </div>" +
    "</div>";

  var wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  var modal = wrapper.firstChild;
  document.body.appendChild(modal);

  modal.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.classList || !target.classList.contains("compare-open-algo")) return;
    var key = target.getAttribute("data-key");
    if (!key) return;
    $("#algorithmCompareModal").modal("hide");
    setTimeout(function () {
      algorithmModal.showAlgorithmInfo(key);
    }, 180);
  });

  $(modal).modal("show");
  $(modal).on("hidden.bs.modal", function () {
    if (modal.parentNode) modal.parentNode.removeChild(modal);
  });
}

module.exports = {
  showComparisonModal: showComparisonModal
};

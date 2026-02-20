var historyStorage = require("./historyStorage");

function formatTimestamp(ts) {
  var date = new Date(ts);
  var now = new Date();
  var diffMs = now - date;
  var diffMins = Math.floor(diffMs / 60000);
  var diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return diffMins + " min ago";
  if (diffHours < 24) return diffHours + " hour" + (diffHours > 1 ? "s" : "") + " ago";

  var options = { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
  return date.toLocaleDateString("en-US", options);
}

function formatAlgorithmName(algo) {
  var names = {
    dijkstra: "Dijkstra",
    astar: "A*",
    greedy: "Greedy",
    CLA: "Swarm",
    swarm: "Swarm",
    "convergent swarm": "Conv. Swarm",
    bidirectional: "Bidirectional",
    bfs: "BFS",
    dfs: "DFS"
  };
  return names[algo] || algo;
}

function renderHistoryList(board) {
  var container = document.getElementById("historyList");
  if (!container) {
    console.warn("[History UI] historyList element not found");
    return;
  }

  var runs = historyStorage.loadRuns();
  container.innerHTML = "";

  if (runs.length === 0) {
    var emptyState = document.createElement("div");
    emptyState.className = "history-empty";
    emptyState.textContent = "No saved runs yet. Click 'Visualize!' to create one.";
    container.appendChild(emptyState);
    return;
  }

  for (var i = 0; i < runs.length; i++) {
    var run = runs[i];
    container.appendChild(createHistoryItem(run, board));
  }

  var clearAll = document.createElement("div");
  clearAll.className = "history-clear-all";
  clearAll.innerHTML = '<button id="clearAllHistoryBtn" type="button">Clear All History</button>';
  container.appendChild(clearAll);

  var clearBtn = document.getElementById("clearAllHistoryBtn");
  if (clearBtn) {
    clearBtn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (confirm("Delete all run history? This cannot be undone.")) {
        historyStorage.clearHistory();
        renderHistoryList(board);
      }
    };
  }
}

function createHistoryItem(run, board) {
  var item = document.createElement("div");
  item.className = "history-item";

  var algoName = formatAlgorithmName(run.settings ? run.settings.algorithm : "unknown");
  var result = run.result || {};

  var summary;
  if (result.found) {
    summary = "Path: " + (result.pathLength || "?") +
      " | Cost: " + (result.pathCost || "?") +
      " | Visited: " + (result.nodesVisited || "?");
  } else {
    summary = "No path found";
  }

  item.innerHTML =
    '<div class="history-item-header">' +
    '<span class="history-item-name">' + algoName + '</span>' +
    '<span class="history-item-time">' + formatTimestamp(run.timestamp) + '</span>' +
    '</div>' +
    '<div class="history-item-summary">' + summary + '</div>' +
    '<div class="history-item-actions">' +
    '<button class="load-btn" data-run-id="' + run.id + '" type="button">Load</button>' +
    '<button class="replay-btn" data-run-id="' + run.id + '" type="button">Replay</button>' +
    '<button class="delete-btn" data-run-id="' + run.id + '" type="button">Delete</button>' +
    '</div>';

  var loadBtn = item.querySelector(".load-btn");
  var replayBtn = item.querySelector(".replay-btn");
  var deleteBtn = item.querySelector(".delete-btn");

  loadBtn.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    loadRun(run, board, false);
  };

  replayBtn.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    loadRun(run, board, true);
  };

  deleteBtn.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    historyStorage.deleteRun(run.id);
    renderHistoryList(board);
  };

  return item;
}

function loadRun(run, board, autoReplay) {
  console.log("[History] Loading run:", run.id, "autoReplay:", autoReplay);

  board.clearPath("clickedButton");
  board.clearWalls();

  var runStart = run.nodes && run.nodes.start;
  var runTarget = run.nodes && run.nodes.target;

  if (runStart && runStart !== board.start && board.nodes[runStart]) {
    document.getElementById(board.start).className = "unvisited";
    board.nodes[board.start].status = "unvisited";

    board.start = runStart;
    board.nodes[runStart].status = "start";
    document.getElementById(runStart).className = "start";
  }

  if (runTarget && runTarget !== board.target && board.nodes[runTarget]) {
    document.getElementById(board.target).className = "unvisited";
    board.nodes[board.target].status = "unvisited";

    board.target = runTarget;
    board.nodes[runTarget].status = "target";
    document.getElementById(runTarget).className = "target";
  }

  var walls = run.walls || [];
  for (var i = 0; i < walls.length; i++) {
    var wallId = walls[i];
    if (board.nodes[wallId] && wallId !== board.start && wallId !== board.target) {
      board.nodes[wallId].status = "wall";
      board.nodes[wallId].weight = 0;
      document.getElementById(wallId).className = "wall";
    }
  }

  var weights = run.weights || [];
  for (var j = 0; j < weights.length; j++) {
    var w = weights[j];
    if (board.nodes[w.id] && w.id !== board.start && w.id !== board.target && board.nodes[w.id].status !== "wall") {
      board.nodes[w.id].status = "unvisited";
      board.nodes[w.id].weight = w.value;
      document.getElementById(w.id).className = "unvisited weight";
    }
  }

  if (run.settings) {
    board.currentAlgorithm = run.settings.algorithm;
    board.currentHeuristic = run.settings.heuristic;
    board.speed = run.settings.speed || "fast";
    board.currentWeightValue = run.settings.weightValue || 15;

    var speedText = board.speed.charAt(0).toUpperCase() + board.speed.slice(1);
    var speedElement = document.getElementById("adjustSpeed");
    if (speedElement) {
      speedElement.innerHTML = "Speed: " + speedText + '<span class="caret"></span>';
    }

    var slider = document.getElementById("weightSlider");
    var valueDisplay = document.getElementById("weightValue");
    if (slider) slider.value = board.currentWeightValue;
    if (valueDisplay) valueDisplay.textContent = board.currentWeightValue;

    board.changeStartNodeImages();
  }

  renderHistoryList(board);

  console.log("[History] Run loaded successfully");

  if (autoReplay && board.currentAlgorithm) {
    setTimeout(function () {
      var startBtn = document.getElementById("actualStartButton");
      if (startBtn) {
        startBtn.click();
      }
    }, 300);
  }
}

function initHistoryUI(board) {
  renderHistoryList(board);
  console.log("[History UI] Initialized");
}

module.exports = {
  initHistoryUI: initHistoryUI,
  renderHistoryList: renderHistoryList,
  renderHistoryDropdown: renderHistoryList,
  loadRun: loadRun
};

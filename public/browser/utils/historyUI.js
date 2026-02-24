var historyStorage = require("./historyStorage");

var pendingRun = null;
var pendingRenderScheduled = false;
var pendingRenderTimer = null;
var pendingClearTimer = null;
var lastPendingRenderAt = 0;
var PENDING_RENDER_THROTTLE_MS = 100;
var FAILED_CARD_DURATION_MS = 1200;

function setHistoryLocked(board, locked) {
  var container = document.getElementById("historyList");
  if (!container) return;
  var shouldLock = typeof locked === "boolean" ? locked : !(board && board.buttonsOn);
  container.classList.toggle("history-locked", shouldLock);
  var buttons = container.querySelectorAll("button");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].disabled = shouldLock;
    buttons[i].classList.toggle("control-disabled", shouldLock);
  }
}

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

function formatPendingAlgorithmName(pending) {
  if (!pending) return "Algorithm";
  if (pending.label) return pending.label;
  if (pending.algorithm === "CLA") {
    if (pending.heuristic === "extraPoweredManhattanDistance") return "Convergent Swarm";
    return "Swarm";
  }
  return formatAlgorithmName(pending.algorithm || "unknown");
}

function formatPendingProgress(prefix, current, total) {
  var safeCurrent = typeof current === "number" ? Math.max(0, current) : 0;
  var safeTotal = typeof total === "number" ? Math.max(0, total) : 0;
  if (safeTotal > 0) {
    if (safeCurrent > safeTotal) safeCurrent = safeTotal;
    return prefix + " " + safeCurrent + "/" + safeTotal;
  }
  return prefix + "...";
}

function getPendingStatusText(pending) {
  if (!pending) return "Running...";
  if (pending.statusText) return pending.statusText;
  if (pending.phase === "path") {
    return formatPendingProgress("Path", pending.current, pending.total);
  }
  if (pending.phase === "finalizing") {
    return "Finalizing run...";
  }
  if (pending.phase === "failed") {
    return "Failed";
  }
  return formatPendingProgress("Exploring", pending.current, pending.total);
}

function createPendingHistoryItem(pending) {
  var item = document.createElement("div");
  item.className = "history-item history-item-pending";

  var header = document.createElement("div");
  header.className = "history-item-header";

  var name = document.createElement("span");
  name.className = "history-item-name";
  var modeSuffix = pending.mode === "replay" ? " (Replay)" : "";
  name.textContent = formatPendingAlgorithmName(pending) + modeSuffix;

  var badge = document.createElement("span");
  badge.className = "history-pending-badge";
  if (pending.phase === "failed") {
    badge.classList.add("history-pending-badge-failed");
    badge.textContent = "Failed";
  } else {
    badge.textContent = "Running";
  }

  var summary = document.createElement("div");
  summary.className = "history-item-summary history-pending-progress";
  summary.textContent = getPendingStatusText(pending);

  header.appendChild(name);
  header.appendChild(badge);
  item.appendChild(header);
  item.appendChild(summary);

  return item;
}

function scheduleHistoryRender(board, immediate) {
  if (immediate) {
    if (pendingRenderTimer) {
      clearTimeout(pendingRenderTimer);
      pendingRenderTimer = null;
    }
    pendingRenderScheduled = false;
    lastPendingRenderAt = Date.now();
    renderHistoryList(board);
    return;
  }

  if (pendingRenderScheduled) return;

  var now = Date.now();
  var elapsed = now - lastPendingRenderAt;
  if (elapsed >= PENDING_RENDER_THROTTLE_MS) {
    lastPendingRenderAt = now;
    renderHistoryList(board);
    return;
  }

  pendingRenderScheduled = true;
  pendingRenderTimer = setTimeout(function () {
    pendingRenderScheduled = false;
    pendingRenderTimer = null;
    lastPendingRenderAt = Date.now();
    renderHistoryList(board);
  }, PENDING_RENDER_THROTTLE_MS - elapsed);
}

function normalizeRunContext(context) {
  var normalized = {
    mode: "visualize",
    sourceRunId: null
  };
  if (!context) return normalized;
  if (context.mode === "replay") normalized.mode = "replay";
  if (context.sourceRunId) normalized.sourceRunId = context.sourceRunId;

  var keys = Object.keys(context);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key === "mode" || key === "sourceRunId") continue;
    normalized[key] = context[key];
  }

  return normalized;
}

function setRunContext(board, context) {
  if (!board) return null;
  board.runContext = normalizeRunContext(context);
  return board.runContext;
}

function getRunContext(board) {
  if (!board || !board.runContext) return normalizeRunContext();
  return normalizeRunContext(board.runContext);
}

function clearRunContext(board) {
  if (!board) return;
  board.runContext = null;
}

function createRunToken() {
  return "pending-" + Date.now() + "-" + Math.floor(Math.random() * 1000000);
}

function setPendingRun(board, meta) {
  if (pendingClearTimer) {
    clearTimeout(pendingClearTimer);
    pendingClearTimer = null;
  }

  var data = meta || {};
  pendingRun = {
    token: createRunToken(),
    mode: data.mode === "replay" ? "replay" : "visualize",
    sourceRunId: data.sourceRunId || null,
    algorithm: data.algorithm || null,
    heuristic: data.heuristic || null,
    speed: data.speed || null,
    phase: data.phase || "exploring",
    current: typeof data.current === "number" ? data.current : 0,
    total: typeof data.total === "number" ? data.total : 0,
    startedAt: data.startedAt || Date.now(),
    statusText: data.statusText || "",
    persistedRunId: data.persistedRunId || null,
    label: data.label || null
  };

  scheduleHistoryRender(board, true);
  return pendingRun.token;
}

function updatePendingRun(board, token, patch) {
  if (!pendingRun) return false;
  if (token && pendingRun.token !== token) return false;
  if (!patch) return true;

  var keys = Object.keys(patch);
  for (var i = 0; i < keys.length; i++) {
    pendingRun[keys[i]] = patch[keys[i]];
  }

  scheduleHistoryRender(board, false);
  return true;
}

function clearPendingRun(board, token) {
  if (!pendingRun) return false;
  if (token && pendingRun.token !== token) return false;

  if (pendingClearTimer) {
    clearTimeout(pendingClearTimer);
    pendingClearTimer = null;
  }

  pendingRun = null;
  clearRunContext(board);
  scheduleHistoryRender(board, true);
  return true;
}

function resolvePendingRun(board, token, payload) {
  if (!pendingRun) return false;
  if (token && pendingRun.token !== token) return false;

  var data = payload || {};
  var status = data.status || "success";

  if (status === "success") {
    if (data.persistedRunId) pendingRun.persistedRunId = data.persistedRunId;
    pendingRun = null;
    clearRunContext(board);
    scheduleHistoryRender(board, true);
    return true;
  }

  pendingRun.phase = "failed";
  pendingRun.statusText = data.statusText || "Failed";
  scheduleHistoryRender(board, true);
  clearRunContext(board);

  var tokenToClear = pendingRun.token;
  var clearDelayMs = typeof data.clearDelayMs === "number" ? data.clearDelayMs : FAILED_CARD_DURATION_MS;
  if (pendingClearTimer) clearTimeout(pendingClearTimer);
  pendingClearTimer = setTimeout(function () {
    clearPendingRun(board, tokenToClear);
  }, clearDelayMs);

  return true;
}

function renderHistoryList(board) {
  var container = document.getElementById("historyList");
  if (!container) {
    console.warn("[History UI] historyList element not found");
    return;
  }

  var runs = historyStorage.loadRuns();
  var activePending = pendingRun;
  var filteredRuns = [];
  for (var i = 0; i < runs.length; i++) {
    if (activePending && activePending.persistedRunId && runs[i].id === activePending.persistedRunId) {
      continue;
    }
    filteredRuns.push(runs[i]);
  }

  container.innerHTML = "";

  if (activePending) {
    container.appendChild(createPendingHistoryItem(activePending));
  }

  if (filteredRuns.length === 0 && !activePending) {
    var emptyState = document.createElement("div");
    emptyState.className = "history-empty";
    emptyState.textContent = "No saved runs yet. Click 'Visualize!' to create one.";
    container.appendChild(emptyState);
    setHistoryLocked(board);
    return;
  }

  for (var j = 0; j < filteredRuns.length; j++) {
    var run = filteredRuns[j];
    container.appendChild(createHistoryItem(run, board));
  }

  if (filteredRuns.length > 0) {
    var clearAll = document.createElement("div");
    clearAll.className = "history-clear-all";
    clearAll.innerHTML = '<button id="clearAllHistoryBtn" type="button">Clear All History</button>';
    container.appendChild(clearAll);

    var clearBtn = document.getElementById("clearAllHistoryBtn");
    if (clearBtn) {
      clearBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!board || !board.buttonsOn) return;
        if (confirm("Delete all run history? This cannot be undone.")) {
          historyStorage.clearHistory();
          renderHistoryList(board);
        }
      };
    }
  }

  setHistoryLocked(board);
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
    if (!board || !board.buttonsOn) return;
    loadRun(run, board, false);
  };

  replayBtn.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!board || !board.buttonsOn) return;
    loadRun(run, board, true);
  };

  deleteBtn.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!board || !board.buttonsOn) return;
    historyStorage.deleteRun(run.id);
    renderHistoryList(board);
  };

  return item;
}

function loadRun(run, board, autoReplay) {
  if (!board || !board.buttonsOn) return;
  console.log("[History] Loading run:", run.id, "autoReplay:", autoReplay);

  if (autoReplay) {
    setRunContext(board, { mode: "replay", sourceRunId: run.id });
  } else {
    setRunContext(board, { mode: "visualize", sourceRunId: null });
  }

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
    if (typeof board.syncAlgorithmSelectionUI === "function") {
      board.syncAlgorithmSelectionUI();
    }
  }

  renderHistoryList(board);

  console.log("[History] Run loaded successfully");

  if (autoReplay && board.currentAlgorithm) {
    setTimeout(function () {
      var startBtn = document.getElementById("actualStartButton");
      if (startBtn) {
        startBtn.click();
      } else {
        clearRunContext(board);
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
  loadRun: loadRun,
  setHistoryLocked: setHistoryLocked,
  setRunContext: setRunContext,
  getRunContext: getRunContext,
  clearRunContext: clearRunContext,
  setPendingRun: setPendingRun,
  updatePendingRun: updatePendingRun,
  resolvePendingRun: resolvePendingRun,
  clearPendingRun: clearPendingRun
};

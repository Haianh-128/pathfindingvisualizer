function mazeGenerationAnimations(board, onComplete) {
  let nodes = board.wallsToAnimate.slice(0);
  let speed = board.speed === "fast" ?
    5 : board.speed === "average" ?
      25 : 75;
  function timeout(index) {
    setTimeout(function () {
      if (index === nodes.length) {
        board.wallsToAnimate = [];
        if (typeof onComplete === "function") {
          onComplete();
        } else {
          board.toggleButtons();
        }
        return;
      }
      nodes[index].className = board.nodes[nodes[index].id].weight > 0 ? "unvisited weight" : "wall";
      timeout(index + 1);
    }, speed);
  }

  timeout(0);
};

module.exports = mazeGenerationAnimations;

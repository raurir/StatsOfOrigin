function initUI() {

  var buttonNames = [
    {
      id: "countdown",
      label: "Countdown",
    },{
      id: "series_winner",
      label: "Series",
    },{
      id: "matches_won",
      label: "Matches",
    },{
      id: "points_scored",
      label: "Points",
    },
  ];

  var selectedButton = null;
  addEventListener(EVENT_SHOW, function(e) {
    var b = e.detail;
    if (selectedButton === b) return;
    selectedButton = b;
    var selected = document.getElementsByClassName("selected");
    for (var i = 0; i < selected.length; i++) {
      selected[i].className = 'button';
    }
    document.getElementById(b).className += " selected";
  })

  var mouseDown = false;
  var position = {x: 0, y: 0};
  var start = {x: 0, y: 0}

  function onDown(e) {
    mouseDown = true;
    if (e.changedTouches) e = e.changedTouches[0];
    // con.log("e.changedTouches", e)
    position = {x: e.clientX, y: e.clientY};
    start.x = position.x; start.y = position.y;
    dispatchEvent(new CustomEvent(EVENT_INTERACT_START));
  }
  function onUp(e) {
    mouseDown = false;
    dispatchEvent(new CustomEvent(EVENT_INTERACT_STOP));
  }
  function onMove(e) {
    if (e.changedTouches) e = e.changedTouches[0];
    // con.log("e.changedTouches", e)
    position = {x: e.clientX, y: e.clientY};
    if (mouseDown) {
      dispatchEvent(new CustomEvent(EVENT_INTERACT_MOVE, {detail:{x: position.x - start.x, y: position.y - start.y}}));
    }
    start.x = position.x; start.y = position.y;
  }

  addEventListener("mousedown", onDown);
  addEventListener("mouseup", onUp);
  addEventListener("mousemove", onMove);
  addEventListener("touchstart", onDown);
  addEventListener("touchend", onUp);
  addEventListener("touchmove", onMove);

  var buttons = document.getElementById("buttons");

  function createButton(b) {
    var button = document.createElement("div");
    button.innerHTML = b.label;
    button.id = b.id;
    button.className = "button";
    buttons.appendChild(button);
    button.addEventListener("click", function() {
      if (b.id === "countdown") {
        dispatchEvent(new CustomEvent(EVENT_COUNTDOWN_SELECTED));
      } else {
        dispatchEvent(new CustomEvent(EVENT_STAT_SELECTED, {detail:b.id}));
      }
    })
  }
  for (var b in buttonNames) {
    createButton(buttonNames[b]);
  }


}


function openTask() {
  document.getElementById("task-form").style.display = "block";
  document.getElementById("open_task").style.display = "none";
  document.getElementById("close_task").style.display = "block";

}
function closeTask() {
  document.getElementById("task-form").style.display = "none";
  document.getElementById("close_task").style.display = "none";
  document.getElementById("open_task").style.display = "block";
}

function calenderTab(evt, tab) {
  document.getElementById("list").style.display = "none";
  document.getElementById("calender").style.display = "flex";

}

function listTab(evt, tab) {
  document.getElementById("calender").style.display = "none";
  document.getElementById("list").style.display = "flex";
}

function orientationchange(x) {

  if (x.matches) {
    var sbs = document.querySelectorAll('.storage-box');
    for (var i = 0; i < sbs.length; i++) {
      sbs[i].style.display = 'block';
      sbs[i].style.width = '50vw';
    }

    var h1s = document.querySelectorAll('h1');
    for (var i = 0; i < h1s.length; i++) {
      h1s[i].style.display = 'flex';
    }
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].style.display = 'none';
    }

  } else {

    var sbs = document.querySelectorAll('.storage-box');
    for (var i = 0; i < sbs.length; i++) {
      sbs[i].style.display = 'none';
      sbs[i].style.width = '100vw';
    }

    var lists = document.querySelectorAll('.list');
    for (var i = 0; i < lists.length; i++) {
      lists[i].style.display = 'block';
    }
    var footers = document.querySelectorAll('.foot');
    for (var i = 0; i < footers.length; i++) {
      footers[i].style.display = 'flex';
    }


    document.getElementById("calender").style.display = "none";

    var h1s = document.querySelectorAll('h1');
    for (var i = 0; i < h1s.length; i++) {
      h1s[i].style.display = 'none';
    }


    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].style.display = 'flex';
    }



  }
}

const orientationCheck = window.matchMedia("(orientation:landscape)")
orientationchange(orientationCheck);
orientationCheck.addEventListener("change", function () {
  orientationchange(orientationCheck);
});




function openTask() {
  document.getElementById("task-form").style.display = "block";
  document.getElementById("open_task").style.display = "none";
  document.getElementById("close_task").style.display = "block";

}
function closeTask() {
  const vals = [];
  vals[0] = document.getElementById("task-name");
  vals[1] = document.getElementById("task-description");
  vals[2] = document.getElementById("task-priority");
  vals[3] = document.getElementById("task-due-date");
  createTask(vals);
  document.getElementById("task-form").style.display = "none";
  document.getElementById("close_task").style.display = "none";
  document.getElementById("open_task").style.display = "block";
  setTasks()



}



function setTasks(tasks) {
  document.getElementById('task_list').replaceChildren();
  for (let i = 0; i < tasks.length; i++) {
    const task = document.createElement('li');
    task.textContent = tasks[i].name;
    task.setAttribute("id", "listItem")
    task.setAttribute("class", "listItemClass")

    document.getElementById('task_list').appendChild(task);
  }

}

listItemclass.addEventListener('click', (e) => {
  displayTask("listItem")
  document.getElementById("taskDisplayList").style.display="block";
});
calendarDates.addEventListener('click', (e) => {
  if (e.target.textContent !== '') {
    document.getElementById("taskDisplayCalender").style.display="block"
    cList=document.createElement('ul');
    document.getElementById("taskDisplayCalender").appendChild(cList);
    cList.replaceChildren();
    const tasks=getTasks();
  for (let i = 0; i < tasks.length; i++) {
         const task = document.createElement('li');
    task.textContent = tasks[i].name;
    task.setAttribute("id", "listItem")
    task.setAttribute("class", "listItemClass")

    document.getElementById('task_list').appendChild(task);
  }
  }
});


function displayTask(drop) {
  const t=getTasks().find(({ name }) => name === drop.textContent);
    
    title=document.createElement('h1');
    title.textContent=t.name;
    drop.appendChild(title);
    title.setAttribute("");
    desc=document.createElement('div');
    desc.textContent=t.description;
    drop.appendChild(desc);
    desc.setAttribute("");
    p=document.createElement('div');
    p.textContent=t.name;
    drop.appendChild(p);
    p.setAttribute("");
    da=document.createElement('div');
    da.textContent=t.name;
    drop.appendChild(da);
    da.setAttribute("");
    cb=document.createElement('button')
    drop.appendChild(cb);
    eb=document.createElement('button')
    drop.appendChild(eb);
    db=document.createElement('button')
    drop.appendChild(db);
  

}


function due_Date_sort(){
  const tasks=fetch('/tasks',{ method: 'GET'});
  function compare(a, b) {
    const dateA = a.dueAt;
    const dateB = b.dueAt;
    let comparison = 0;
    if (dateA > dateB) {
      comparison = -1;
    } else if (dateA < dateB) {
      comparison = 1;
    }
    return comparison;
  }  
  tasks.sort(compare);
  setTasks(tasks);
}
async function prioritySort(){
  const tasks=await fetch('/tasks',{ method: 'GET'});
  function compare(a, b) {
    const prioA = a.priority;
    const prioB = b.priority;
    let comparison = 0;
    if (dateA > dateB) {
      comparison = 1;
    } else if (dateA < dateB) {
      comparison = -1;
    }
    return comparison;
  }  
  tasks.sort(compare);
  setTasks(tasks);
}

setTasks(fetch('/tasks',{ method: 'GET'}));

function calenderTab(evt, tab) {
  document.getElementById("list").style.display = "none";
  document.getElementById("calender").style.display = "block";

}

function listTab(evt, tab) {
  document.getElementById("calender").style.display = "none";
  document.getElementById("list").style.display = "block";
}

function orientationchange(x) {

  if (x.matches) {
    var sbs = document.querySelectorAll('.storage-box');
    for (var i = 0; i < sbs.length; i++) {
      sbs[i].style.display = 'block';
      sbs[i].style.width = '50vw';
    }
    var cs = document.querySelectorAll('.calendarm');
    for (var i = 0; i < cs.length; i++) {
      cs[i].style.width = '50vw';
    }

    var h1s = document.querySelectorAll('h1');
    for (var i = 0; i < h1s.length; i++) {
      h1s[i].style.display = 'flex';
    }
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].style.display = 'none';
    }
    var lists = document.querySelectorAll('.list');
    for (var i = 0; i < lists.length; i++) {
      lists[i].style.display = 'block';
    }
    var tbs = document.querySelectorAll('.tab_content');
    for (var i = 0; i < tbs.length; i++) {
      tbs[i].style.display = 'block';
    }



  } else {

    var sbs = document.querySelectorAll('.storage-box');
    for (var i = 0; i < sbs.length; i++) {
      sbs[i].style.display = 'none';
      sbs[i].style.width = '100vw';
    }
    var cs = document.querySelectorAll('.calendarm');
    for (var i = 0; i < cs.length; i++) {
      cs[i].style.width = '100vw';
    }

    var lists = document.querySelectorAll('.list');
    for (var i = 0; i < lists.length; i++) {
      lists[i].style.display = 'block';
    }
    var footers = document.querySelectorAll('.foot');
    for (var i = 0; i < footers.length; i++) {
      footers[i].style.display = 'block';
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
    var ths = document.querySelectorAll('.th');
    for (var i = 0; i < ths.length; i++) {
      ths[i].style.display = 'flex';
    }



  }
}

const orientationCheck = window.matchMedia("(orientation:landscape)")
orientationchange(orientationCheck);
orientationCheck.addEventListener("change", function () {
  orientationchange(orientationCheck);
});

const calendarDates = document.querySelector('.calendar-dates');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function renderCalendar(month, year) {
  calendarDates.innerHTML = '';
  monthYear.textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    calendarDates.appendChild(blank);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement('div');
    day.textContent = i;
    cd=new Date(year, month,i);
    let found=1;
    found = getTasks.find(({ dueAt }) => dueAt === cd);
    if(found!=1){
    day.setAttribute("background", "red")
    }
    calendarDates.appendChild(day);
  }
}

renderCalendar(currentMonth, currentYear);

prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
});

day.addEventListener('click', (e) => {
  if (e.target.textContent !== '') {
    cd = new Date(currentYear,currentMonth,day.textContent);
    let cdTasks=[];
    let j=0;
    for(let i=0;i<getTasks.length;i++){
      if(getTasks[i].dueAt==cd){
        cdTasks[j]=getTasks[i];
        j++;
      }
    }


  }
});

//const { response } = require("express");

let tasks = [];
async function getAllTasks() {
  const headers = { 'content-type': 'application/json' };
  const res = await fetch('/api/tasks', { method: 'GET' });
  tasks = await res.json();

}
async function start() {
  await getAllTasks();
  setTasks();
}
start();



async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  location.replace('/login');
}
async function deleteTask() {
  const name = document.getElementById("nm");
  const t = tasks.find(t => t.name === name.textContent.slice(6, name.textContent.length));
  const id = t.id
  const headers = { 'content-type': 'application/json' };
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  closeOpenTask();
  setTasks();
}
function openTask() {
  document.getElementById("task-form").style.display = "block";
  document.getElementById("open_task").style.display = "none";
  document.getElementById("close_task").style.display = "block";
  document.getElementById("cv").style.display = "block";

}
function closeTask() {
  document.getElementById("task-form").style.display = "none";
  document.getElementById("close_task").style.display = "none";
  document.getElementById("open_task").style.display = "block";
  document.getElementById("cv").style.display = "none";



}
function closeOpenTask() {
  document.getElementById("cv").style.display = "none";
  document.getElementById("fullTask").style.display = "none";

}

async function createTask(options) {
  const name = options.name;
  const description = options.description;
  const priority = options.priority;

  const dueAt = options.dueAt;
  if (name && dueAt) {
    const payload = { name, dueAt };
    const body = JSON.stringify(payload);
    const headers = { 'content-type': 'application/json' };
    const res = await fetch('/api/tasks', { method: 'POST', headers, body });
    if (res.ok) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

async function saveTaskForm() {
  const n = document.getElementById("task-name").value;
  const d = document.getElementById("task-description").value;
  const p = document.getElementById("task-priority").value;
  const dueDate = document.getElementById("task-due-date").value;
  const dueTime = document.getElementById("task-due-time").value;
  //ueDate.slice(0,5),dueDate.slice(6,8),dueDate.slice(9,11),dueTime.slice(0,3),dueTime.slice(4,6)
  const due = new Date(parseInt(dueDate.slice(0, 5)), parseInt(dueDate.slice(6, 8)), parseInt(dueDate.slice(9, 11)), parseInt(dueTime.slice(0, 3)), parseInt(dueTime.slice(4, 6)));
  const task = { name: n, description: d, priority: p, dueAt: due };
  createTask(task);
  setTasks();
  closeTask();
}


function setTasks() {
  if ((document.getElementById('taskDisplayList')) != null) {
    document.getElementById('taskDisplayList').innerHTML = '';
    for (let i = 0; i < tasks.length; i++) {
      const task = document.createElement('div');
      task.setAttribute("class", "storage-box list-item")
      task.style.whiteSpace = "pre-line";
      task.textContent = tasks[i].name;
      task.textContent += "\n";
      task.textContent += tasks[i].dueAt.slice(0, 10);
      document.getElementById('taskDisplayList').appendChild(task);
    }
    const listItems = document.querySelectorAll(".list-item")

    listItems.forEach(listItem => {
      listItem.addEventListener('click', (event) => {
        document.getElementById("cv").style.display = "block";
        document.getElementById("fullTask").style.display = "block"
        //console.log(listItem.textContent.slice(0,listItem.textContent.length-10));
        const t = tasks.find(t => t.name === listItem.textContent.slice(0, listItem.textContent.length - 11));
        document.getElementById("nm").textContent = "Name: " + t.name;
        document.getElementById("desc").textContent = t.description;
        document.getElementById("prio").textContent = "Priority: " + t.priority;
        document.getElementById("dt").textContent = "due on: " + t.dueAt.slice(0, 10) + " " + t.dueAt.slice(11, 16);
      });
    });
  }

}
setTasks();




/*
calendarDates.addEventListener('click', (e) => {
  if (e.target.textContent !== '') {
    document.getElementById("taskDisplayCalender").style.display = "block"
    cList = document.createElement('ul');
    document.getElementById("taskDisplayCalender").appendChild(cList);
    cList.replaceChildren();
    const tasks = getTasks();
    for (let i = 0; i < tasks.length; i++) {
      const task = document.createElement('li');
      task.textContent = tasks[i].name;
      task.setAttribute("id", "listItem")
      task.setAttribute("class", "listItemClass")

      document.getElementById('task_list').appendChild(task);
    }
  }
});*/


function displayTask(drop) {
  const t = getTasks().find(({ name }) => name === drop.textContent);

  title = document.createElement('h1');
  title.textContent = t.name;
  drop.appendChild(title);
  title.setAttribute("");
  desc = document.createElement('div');
  desc.textContent = t.description;
  drop.appendChild(desc);
  desc.setAttribute("");
  p = document.createElement('div');
  p.textContent = t.name;
  drop.appendChild(p);
  p.setAttribute("");
  da = document.createElement('div');
  da.textContent = t.name;
  drop.appendChild(da);
  da.setAttribute("");
  cb = document.createElement('button')
  drop.appendChild(cb);
  eb = document.createElement('button')
  drop.appendChild(eb);
  db = document.createElement('button')
  drop.appendChild(db);


}


function dueDateSort() {
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
  tasks.reverse();
  setTasks();
  console.log(tasks)

}
function prioritySort() {
  function compare(a, b) {
    const prioA = a.priority;
    const prioB = b.priority;
    let comparison = 0;
    if (prioA > prioB) {
      comparison = 1;
    } else if (prioA < prioB) {
      comparison = -1;
    }
    return comparison;
  }
  tasks.sort(compare);
  tasks.reverse();
  setTasks();
  console.log(tasks)
}
//const res = await fetch('/api/tasks', { method: 'POST', headers, body })
//setTasks();


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
    let d=i;
    if(d/10<1){
      d="0"+d;
    }
    let m=month+1;
    if(m/10<1){
      m="0"+m;
    }
    cd = new Date(year, month, i);

    let found = 1;

    found = tasks.find(({ dueAt }) => dueAt.toString().slice(0,10) === year+"-"+m+"-"+d);
    //console.log(tasks[0].dueAt.toString().slice(0,10));
    //console.log(year+"-"+m+"-"+d);
    console.log(found);
    if (found != undefined) {
      console.log("test");
      day.style.backgroundColor="#c67171";
    }
    calendarDates.appendChild(day);
  }
}
async function calStart() {
  await getAllTasks();
  renderCalendar(currentMonth, currentYear);
}
calStart();
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



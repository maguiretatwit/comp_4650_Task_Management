async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  location.replace('/login');
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

async function createTask(options) {
  const name = options.name;
  const description=options.description;
  const priority=options.priority;

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
  const due= new date(dueDate.slice(0,5),dueDate.slice(6,8),dueDate.slice(9,11),dueTime.slice(0,3),dueTime.slice(4,6));
  const task = {name:n, description:d, priority:p, dueAt: due};
  createTask(task);
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


function due_Date_sort() {
  const tasks = fetch('/tasks', { method: 'GET' });
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
function prioritySort() {
  const tasks = fetch('/tasks', { method: 'GET' });
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
    cd = new Date(year, month, i);
    let found = 1;
    /*found = getTasks.find(({ dueAt }) => dueAt === cd);
    if (found != 1) {
      day.setAttribute("background", "red")
    }*/
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
    cd = new Date(currentYear, currentMonth, day.textContent);
    let cdTasks = [];
    let j = 0;
    for (let i = 0; i < getTasks.length; i++) {
      if (getTasks[i].dueAt == cd) {
        cdTasks[j] = getTasks[i];
        j++;
      }
    }


  }
});

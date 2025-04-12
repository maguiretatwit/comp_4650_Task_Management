/** @typedef {"UNKNOWN"|"CONFLICT"|"MISSING_PROPERTIES"|"VALIDATION_ERROR"} ErrorType @typedef {{id:number;name:string;description:string|null;priority:number;isComplete:boolean;dueAt:string;userId:number;createdAt:string;updatedAt:string}} Task @typedef {{name:string;description?:string;priority?:number;isComplete?:boolean;dueAt?:string}} CreateTaskOptions @typedef {Partial<CreateTaskOptions>} UpdateTaskOptions */

class RequestError extends Error {
  /** @readonly @type {number} */
  status;
  /** @readonly @type {string} */
  statusText;
  /** @readonly @type {ErrorType|null} */
  type;
  /** @readonly @type {Record<string,string>|null} */
  fields;
  /** @param {Response} res @param {{type:ErrorType;fields?:Record<string,string>;}} [body] */
  constructor(res, body) {
    super();
    this.status = res.status;
    this.statusText = res.statusText;
    this.type = this.fields = null;
    if (body) {
      this.type = body.type;
      if (body.fields) {
        this.fields = body.fields;
      }
    }
  }
}

/** @param {string} endpoint @param {string} [method] @param {Record<string,any>} [payload] @throws {RequestError} */
async function request(endpoint, method, payload) {
  /** @type {RequestInit} */
  const init = {};
  if (method) {
    init.method = method;
  }
  if (payload) {
    init.headers = {
      "content-type": "application/json"
    };
    init.body = JSON.stringify(payload);
  }
  const res = await fetch(endpoint, init);
  if (res.ok) {
    return res;
  } else {
    const args = [res];
    if (res.status === 400) {
      args.push(await res.json());
    }
    throw new RequestError(...args);
  }
}

/** @param {string} username @param {string} password */
async function login(username, password) {
  await request("/api/login", "POST", { username, password });
}

async function logout() {
  await request("/api/logout", "POST");
}

/** @returns {Promise<Task[]>} */
async function getTasks() {
  const res = await request("/api/tasks");
  return await res.json();
}

/** @param {CreateTaskOptions} options @returns {Promise<Task>} */
async function createTask(options) {
  const res = await request("/api/tasks", "POST", options);
  return await res.json();
}

/** @param {string} taskId @returns {Promise<Task>} */
async function getTask(taskId) {
  const res = await request(`/api/${encodeURIComponent(taskId)}`);
  return await res.json();
}

/** @param {string} taskId @param {UpdateTaskOptions} options @returns {Promise<Task>} */
async function updateTask(taskId, options) {
  const res = await request(`/api/tasks/${encodeURIComponent(taskId)}`, "PATCH", options);
  return await res.json();
}

/** @param {string} taskId */
async function deleteTask(taskId) {
  await request(`/api/tasks/${encodeURIComponent(taskId)}`, "DELETE");
}

let taskList = [];
async function refreshTasks() {
  taskList = await getTasks();
  setTasks(taskList);
}
refreshTasks();



async function handleLogout() {
  await logout();
  location.replace('/login');
}

async function handleDeleteTask() {
  const name = document.getElementById("nm");
  const t = taskList.find(t => t.name === name.textContent.slice(6, name.textContent.length));
  const id = t.id
  await deleteTask(id);
  closeOpenTask();
  refreshTasks();
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
function closeTaskList() {
  document.getElementById("cv").style.display = "none";
  document.getElementById("taskDisplayCal").style.display = "none";

}

function closeOpenTask() {
  document.getElementById("cv").style.display = "none";
  document.getElementById("fullTask").style.display = "none";

}

async function saveTaskForm() {
  const name = document.getElementById("task-name").value;
  const description = document.getElementById("task-description").value;
  const priority = document.getElementById("task-priority").value;
  const dueDate = document.getElementById("task-due-date").value;
  const dueTime = document.getElementById("task-due-time").value;
  const dueAt = new Date(parseInt(dueDate.slice(0, 5)), parseInt(dueDate.slice(6, 8)), parseInt(dueDate.slice(9, 11)), parseInt(dueTime.slice(0, 3)), parseInt(dueTime.slice(4, 6)));
  const task = { name, description, priority, dueAt };
  await createTask(task);
  await refreshTasks();
  closeTask();
}

/** @param {string} taskId */
function showTaskOptions(taskId) {
  const task = taskList.find(t => t.id === taskId);
  document.getElementById("cv").style.display = "block";
  document.getElementById("fullTask").style.display = "block"
  document.getElementById("nm").innerText = "Name: " + task.name;
  document.getElementById("desc").innerText = "Description:" + task.description;
  document.getElementById("prio").innerText = "Priority: " + task.priority;
  const dueAt = new Date(task.dueAt);
  document.getElementById("dt").innerText = "Due: " + dueAt.toLocaleString();
}

/** @param {InputEvent} event */
function handleTaskListItemClick(event) {
  /** @type {HTMLDivElement} */
  const taskElement = event.currentTarget;
  showTaskOptions(Number(taskElement.dataset.id));
}


/** @param {string} label @param {string} value */
function createTextFieldElement(label, value) {
  const container = document.createElement("div");
  const inlineContainer = document.createElement("span");
  const labelElement = document.createElement("b");
  labelElement.innerText = label;
  inlineContainer.append(labelElement, `: ${value}`);
  container.append(inlineContainer);
  return container;
}

/** @param {Task} task */
function createTaskListItemElement(task) {
  const taskElement = document.createElement("div");
  taskElement.classList.add("task-list__item");
  taskElement.dataset.id = task.id;
  const nameElement = createTextFieldElement("Name", task.name);
  const priorityElement = createTextFieldElement("Priority", task.priority);
  const dueAt = new Date(task.dueAt);
  const dueAtElement = createTextFieldElement("Due", dueAt.toLocaleString());
  taskElement.append(nameElement, priorityElement, dueAtElement);
  taskElement.addEventListener("click", handleTaskListItemClick);
  return taskElement;
}

/** @param {Task[]} tasks */
function setTasks(tasks) {
  if ((document.getElementById('taskDisplayList')) != null) {
    document.getElementById('taskDisplayList').innerHTML = '';
    for (const task of tasks) {
      const taskElement = createTaskListItemElement(task);
      document.getElementById('taskDisplayList').appendChild(taskElement);
    }
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

/*
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


}*/

let sortBy = "priority";
let sortDesc = false;
function sortTaskList(by) {
  if (by === sortBy) {
    sortDesc = !sortDesc;
  }
  sortBy = by;
  switch (by) {
    case "priority":
      prioritySort(sortDesc);
    case "dueDate":
      dueDateSort(sortDesc);
  }
}

function dueDateSort(desc = false) {
  const mult = desc ? -1 : 1;
  function compare(a, b) {
    const dateA = new Date(a.dueAt);
    const dateB = new Date(b.dueAt);
    return mult * (dateA.getTime() - dateB.getTime());
  }
  taskList.sort(compare);
  setTasks(taskList);
}
function prioritySort(desc = false) {
  const mult = desc ? -1 : 1;
  function compare(a, b) {
    return mult * (a.priority - b.priority);
  }
  taskList.sort(compare);
  setTasks(taskList);
}

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
    let d = i;
    if (d / 10 < 1) {
      d = "0" + d;
    }
    let m = month + 1;
    if (m / 10 < 1) {
      m = "0" + m;
    }
    cd = new Date(year, month, i);

    let found = 1;

    found = taskList.find(({ dueAt }) => dueAt.toString().slice(0, 10) === year + "-" + m + "-" + d);
    //console.log(tasks[0].dueAt.toString().slice(0,10));
    //console.log(year+"-"+m+"-"+d);
    //console.log(found);
    if (found != undefined) {
      //console.log("test");
      day.style.backgroundColor = "#c67171";
    }
    calendarDates.appendChild(day);
    day.addEventListener('click', (event) => {
      document.getElementById("cv").style.display = "block";
      document.getElementById("taskDisplayCaa").style.display = "block"
      if ((document.getElementById('taskDisplayCal')) != null) {
        document.getElementById('taskDisplayCal').innerHTML = '';
        for (let i = 0; i < taskList.length; i++) {
          if (taskList[i].dueAt.toString().slice(0, 10) === year + "-" + m + "-" + d) {
            const task = document.createElement('div');
            task.setAttribute("class", "storage-box list-item")
            task.style.whiteSpace = "pre-line";
            task.textContent = taskList[i].name;
            task.textContent += "\n";
            task.textContent += taskList[i].dueAt.slice(0, 10);
            document.getElementById('taskDisplayCal').appendChild(task);
          }
        }
      }
      const listItems = document.querySelectorAll(".list-item")

      listItems.forEach(listItem => {
        listItem.addEventListener('click', (event) => {
          document.getElementById("cv").style.display = "block";
          document.getElementById("fullTask").style.display = "block"
          const t = taskList.find(t => t.name === listItem.textContent.slice(0, listItem.textContent.length - 11));
          document.getElementById("nm").textContent = "Name: " + t.name;
          document.getElementById("desc").textContent = t.description;
          document.getElementById("prio").textContent = "Priority: " + t.priority;
          document.getElementById("dt").textContent = "due on: " + t.dueAt.slice(0, 10) + " " + t.dueAt.slice(11, 16);
        });
      });
    });

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



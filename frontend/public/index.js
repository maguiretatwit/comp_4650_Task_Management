/** @typedef {"UNKNOWN"|"CONFLICT"|"MISSING_PROPERTIES"|"VALIDATION_ERROR"} ErrorType @typedef {{id:number;name:string;description:string|null;priority:number;isComplete:boolean;dueAt:string;userId:number;createdAt:string;updatedAt:string}} Task @typedef {{name:string;description?:string;priority?:number;isComplete?:boolean;dueAt?:string}} CreateTaskOptions @typedef {Partial<CreateTaskOptions>} UpdateTaskOptions @typedef {"create"|"update"} TaskFormAction */

/*
 * --------------
 * |  REQUESTS  |
 * --------------
 */

class RequestError extends Error {
  /** @readonly @type {number} */
  status;
  /** @readonly @type {string} */
  statusText;
  /** @readonly @type {string|null} */
  message;
  /** @readonly @type {ErrorType|null} */
  type;
  /** @readonly @type {Record<string,string>|null} */
  fields;
  /** @param {Response} res @param {{type:ErrorType;message?:string;fields?:Record<string,string>;}} [body] */
  constructor(res, body) {
    super();
    this.status = res.status;
    this.statusText = res.statusText;
    this.message = this.type = this.fields = null;
    if (body) {
      this.type = body.type;
      if (body.message) {
        this.message = body.message;
      }
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

/* 
 * -----------
 * |  FORMS  |
 * -----------
 */

/** @param {HTMLObjectElement} element @param {string} message */
function setCustomValidity(element, message) {
  function clearValidity() {
    element.setCustomValidity("");
    element.removeEventListener("input", clearValidity);
  }
  element.setCustomValidity(message);
  element.addEventListener("input", clearValidity);
}

const errorContainer = document.createElement("div");
errorContainer.classList.add("form__error");
const errorElement = document.createElement("span");
errorContainer.append(errorElement);
/** @param {HTMLFormElement} form @param {...string} messages  */
function showErrorMessage(form, ...messages) {
  if (messages.length === 0) {
    errorElement.innerText = "Something went wrong.";
  } else {
    errorElement.innerHTML = messages.join("<br>");
  }
  form.lastChild.after(errorContainer);
}

/** @param {HTMLFormElement} form @param {RequestError} error */
function showError(form, error) {
  if (error.status === 400) {
    if (error.type === "CONFLICT") {
      const fields = error.fields;
      for (const field in fields) {
        if (field in form) {
          setCustomValidity(form[field], fields[field]);
        }
      }
    } else {
      showErrorMessage(form, error.message);
    }
  } else {
    showErrorMessage(form);
  }
}

/** @param {SubmitEvent} event */
async function handleSubmitTask(event) {
  event.preventDefault();
  /** @type {HTMLFormElement} */
  const form = event.currentTarget;
  /** @type {[HTMLInputElement,HTMLInputElement,HTMLSelectElement,HTMLFieldSetElement,HTMLInputElement,HTMLInputElement]} */
  const [nameInput, descriptionInput, priorityInput, _dueAtElement, dueDateInput, dueTimeInput] = form.elements;
  const name = nameInput.value;
  const description = descriptionInput.value || undefined;
  const priority = priorityInput.value;
  const dueDate = dueDateInput.value;
  const dueTime = dueTimeInput.value;
  const dueAt = new Date(`${dueDate.replaceAll("-", "/")} ${dueTime}`);
  const options = { name, description, priority, dueAt };
  try {
    /** @type {{action:TaskFormAction;taskId:string}} */
    const { action, taskId } = form.dataset;
    switch (action) {
      case "create":
        await createTask(options);
        break;
      case "update":
        await updateTask(taskId, options);
        break;
    }
    await refreshTasks();
    closeTaskForm();
  } catch (error) {
    showError(form, error);
  }
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
  const taskElement = document.getElementById("fullTask");
  await deleteTask(taskElement.dataset.id);
  await refreshTasks();
  closeOpenTask();
}

/** @param {TaskFormAction} action */
function openTaskForm(action) {
  const taskForm = document.getElementById("task-form");
  taskForm.dataset.action = action;
  taskForm.classList.remove("hide");
  document.getElementById("cover").classList.remove("hide");
  refreshTasks();
}
async function handleEditTask() {
  openTask();
  const name = document.getElementById("nm");
  const t = taskList.find(t => t.name === name.textContent.slice(6, name.textContent.length));
  const id = t.id  
  document.getElementById("task-name").value=t.name;
  document.getElementById("task-description").value= t.description
  document.getElementById("task-priority").value=t.priority;
  const dueAt=new Date(t.dueAt);
  document.getElementById("task-due-date").value= `${dueAt.getFullYear()}-${(dueAt.getMonth()+1).toString().padStart(2,"0")}-${dueAt.getDate().toString().padStart(2,"0")}`;
  document.getElementById("task-due-time").value=`${dueAt.getHours().toString().padStart(2,"0")}:${dueAt.getMinutes().toString().padStart(2,"0")}`;
  document.getElementById("editButton").style.display="block"
  document.getElementById("submitButton").style.display="none"
  

}



function openTask() {
  document.getElementById("task-form").style.display = "block";
  document.getElementById("open_task").style.display = "none";
  document.getElementById("close_task").style.display = "block";
  document.getElementById("cv").style.display = "block";
  document.getElementById("editButton").style.display="none"
  document.getElementById("task-name").value="";
  document.getElementById("task-description").value=""
  document.getElementById("task-priority").value="1";
  document.getElementById("task-due-date").value= "";
  document.getElementById("task-due-time").value= "";
}

function closeTaskForm() {
  document.getElementById("task-form").classList.add("hide");
  document.getElementById("cover").classList.add("hide");
  errorContainer.remove();
}

function closeTaskList() {
  document.getElementById("cover").classList.add("hide");
  document.getElementById("taskBoxCal").classList.add("hide");

}

function closeOpenTask() {
  document.getElementById("cover").classList.add("hide");
  document.getElementById("fullTask").classList.add("hide");

}
function closeOpenTaskCal() {
  document.getElementById("fullTask").classList.add("hide");

}

/* 
 * -----------
 * |  TASKS  |
 * -----------
 */

/** @param {string} taskId */
function showTaskOptions(taskId) {
  const task = taskList.find(t => t.id.toString() === taskId);
  document.getElementById("cover").classList.remove("hide");
  const taskElement = document.getElementById("fullTask");
  taskElement.dataset.id = taskId;
  taskElement.classList.remove("hide");
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
  showTaskOptions(taskElement.dataset.id);
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
    document.getElementById("taskDisplayCalender").classList.remove("hide")
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
    if (found != undefined) {
      //console.log("test");
      day.style.backgroundColor = "#c67171";
    }
    calendarDates.appendChild(day);
    day.addEventListener("click", () => {
      document.getElementById("cover").classList.remove("hide");
      document.getElementById("taskBoxCal").classList.remove("hide")
      const taskDisplay = document.getElementById("taskDisplayCal");
      if (taskDisplay) {
        taskDisplay.innerHTML = '';
        for (const task of taskList) {
          const date = new Date(task.dueAt);
          date.setHours(0, 0, 0, 0);
          const target = new Date(year, m - 1, d);
          if (date.getTime() == target.getTime()) {
            const taskElement = createTaskListItemElement(task);
            taskDisplay.append(taskElement);
          }
        }
      }
    });

  }



}
async function calStart() {
  await refreshTasks();
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



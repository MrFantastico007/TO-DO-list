const addtask = document.getElementById("addtask");
const taskcontainer = document.querySelector(".taskcontainer");
const input = document.getElementById("taskInput");

addtask.addEventListener("click", function () {
  let task = document.createElement("div");
  task.classList.add("task");
  let li = document.createElement("li");
  li.innerText = input.value;
  task.appendChild(li);
  //   taskcontainer.appendChild(task);

  let checkbtn = document.createElement("button");
  checkbtn.innerHTML = '<i class ="fa-solid fa-check"></i>';
  checkbtn.classList.add("checktask");
  task.appendChild(checkbtn);

  let deletebtn = document.createElement("button");
  deletebtn.innerHTML = '<i class ="fa-solid fa-trash-can"></i>';
  deletebtn.classList.add("deletetask");
  task.appendChild(deletebtn);

  if (input.value === "") {
    alert("Please enter a task");
  } else {
    taskcontainer.appendChild(task);
  }

  input.value = "";
});

taskcontainer.addEventListener("click", function (e) {
  if (e.target.closest(".checktask")) {
    let taskdiv = e.target.closest(".task");
    let li = taskdiv.querySelector("li");
    li.classList.toggle("completed");
  }

  if(e.target.closest(".deletetask")) {
    let taskdiv = e.target.closest(".task");
    taskdiv.remove();
  }
});
input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addtask.click(); 
  }
});

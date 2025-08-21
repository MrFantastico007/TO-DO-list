import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const appSettings = {
  databaseURL:
    "https://realtime-project-920d5-default-rtdb.asia-southeast1.firebasedatabase.app/",
};
const app = initializeApp(appSettings);
const db = getDatabase(app);

let currentRoom = null;

const roomScreen = document.getElementById("roomScreen");
const todoScreen = document.getElementById("todoScreen");
const roomInput = document.getElementById("roomInput");
const roomIdDisplay = document.getElementById("roomIdDisplay");
const createRoomBtn = document.getElementById("createRoom");
const joinRoomBtn = document.getElementById("joinRoom");
const leaveRoomBtn = document.getElementById("leaveRoom");

const addtask = document.getElementById("addtask");
const taskcontainer = document.querySelector(".taskcontainer");
const input = document.getElementById("taskInput");



function updateRoomActivity(roomId) {
  const roomRef = ref(db, `rooms/${roomId}/lastActive`);
  set(roomRef, Date.now());
}



function addTask() {
  if (!input.value.trim()) {
    alert("please enter a task!!");
    return;
  }
  if (!currentRoom) return;

  const taskref = ref(db, `rooms/${currentRoom}/tasks`);
  push(taskref, { text: input.value, completed: false });

  updateRoomActivity(currentRoom);
  input.value = "";
}

addtask.addEventListener("click", addTask);
input.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});



function loadTasks() {
  if (!currentRoom) return;

  const taskref = ref(db, `rooms/${currentRoom}/tasks`);

  onValue(taskref, (snapshot) => {
    taskcontainer.innerHTML = "";
    snapshot.forEach((child) => {
      const taskdata = child.val();
      const taskID = child.key;

      let task = document.createElement("div");
      task.classList.add("task");

      let li = document.createElement("li");
      li.innerText = taskdata.text;
      if (taskdata.completed) {
        li.classList.add("completed");
      } else {
        li.classList.remove("completed");
      }
      task.appendChild(li);

      // ✅ Copy task text
      let copybtn = document.createElement("button");
      copybtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
      copybtn.classList.add("copytask");
      copybtn.addEventListener("click", () => {
        navigator.clipboard.writeText(taskdata.text).then(() => {
          copybtn.innerHTML = '<i class="fa-solid fa-check"></i>'; 
          setTimeout(() => {
            copybtn.innerHTML = '<i class="fa-solid fa-copy"></i>'; 
          }, 1000);
        });
      });
      task.appendChild(copybtn);

      // ✅ Complete task
      let checkbtn = document.createElement("button");
      checkbtn.innerHTML = '<i class="fa-solid fa-check"></i>';
      checkbtn.classList.add("checktask");
      checkbtn.addEventListener("click", () => {
        const taskRef = ref(db, `rooms/${currentRoom}/tasks/${taskID}`);
        set(taskRef, {
          text: taskdata.text,
          completed: !taskdata.completed,
        });
        updateRoomActivity(currentRoom);
      });
      task.appendChild(checkbtn);

      // ✅ Delete task
      let deletebtn = document.createElement("button");
      deletebtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      deletebtn.classList.add("deletetask");
      deletebtn.addEventListener("click", () => {
        remove(ref(db, `rooms/${currentRoom}/tasks/${taskID}`));
        updateRoomActivity(currentRoom);
      });
      task.appendChild(deletebtn);

      taskcontainer.appendChild(task);
    });
  });
}



//  Create room
createRoomBtn.addEventListener("click", () => {
  const roomId = Math.random().toString(36).substring(2, 8);

  const roomRef = ref(db, `rooms/${roomId}`);
  set(roomRef, {
    createdAt: Date.now(),
    lastActive: Date.now(), // 🔥 track activity
    tasks: {},
  });

  enterRoom(roomId);
});


//  Auto delete rooms inactive for 24h
function autoDeleteExpiredRooms() {
  const roomsRef = ref(db, "rooms");

  onValue(roomsRef, (snapshot) => {
    snapshot.forEach((child) => {
      const room = child.val();
      const roomKey = child.key;

      const oneDay = 24 * 60 * 60 * 1000;
      if (Date.now() - room.lastActive > oneDay) {
        remove(ref(db, `rooms/${roomKey}`));
        console.log(`Deleted inactive room: ${roomKey}`);
      }
    });
  });
}
autoDeleteExpiredRooms();


//  Join room
joinRoomBtn.addEventListener("click", () => {
  const roomId = roomInput.value.trim();
  if (!roomId) {
    alert("Please enter a Room ID");
    return;
  }
  enterRoom(roomId);
});


//  Leave room
leaveRoomBtn.addEventListener("click", () => {
  currentRoom = null;
  todoScreen.classList.add("hidden");
  roomScreen.classList.remove("hidden");
});


//  Enter room function
function enterRoom(roomId) {
  currentRoom = roomId;
  roomIdDisplay.innerText = roomId;

  roomScreen.classList.add("hidden");
  todoScreen.classList.remove("hidden");

  updateRoomActivity(roomId); 
  loadTasks();
}

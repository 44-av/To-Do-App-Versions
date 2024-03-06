import './App.css'
import React, { useEffect, useState } from 'react'
import { IoCheckbox } from "react-icons/io5";
import { TbSubtask } from "react-icons/tb";
import { database } from "./firebase.config";
import { ref, set, onValue, remove } from "firebase/database";

const AddToDoTask = ({ NewTask }) => {
  const [task, setTask] = useState("");

  const handleAdd = () => {
    const taskid = Math.floor(10000000 + Math.random() * 90000000);
    NewTask(taskid, task, "Pending");
    setTask("");

  }
  return (
    <>
      <div className="flex items-center mb-4 leading-none">
        <TbSubtask size={40} className="text-2xl font-bold text-left mr-2" />
        <h1 className="text-4xl font-bold text-left m-4 leading-none">TO DO APP</h1>
      </div>
      <p className="text-gray text-left leading-none mb-10">Stay organized, focused, and in control of your tasks!</p>
      <form id="task-form" className="flex justify-center mb-4 mt-2">
        <input type="text" id="task-input" className="w-full text-black p-2 rounded-lg outline-green focus:text-black focus:bg-transparent" placeholder="New Task" value={task} onChange={(e) => setTask(e.target.value)} />
        <button type="button" className="ms-2 text-sm bg-darkGreen hover:bg-green text-white" onClick={handleAdd}>Add</button>
      </form>
    </>
  )
}
const DoneTask = ({ Task, DateCreated, Status, DateFinished }) => {
  return (
    <div class="w-500 p-5 mt-2 rounded-lg shadow-lg bg-white">
      <div class="flex">
        <div class="flex items-center h-5">
          <h2> <IoCheckbox class="bg-green mt-10 w-6 h-6" /></h2>
        </div>
        <div class="ms-2 text-sm ml-5">
          <p id="helper-radio-text" class="text-xxs font-normal text-lightGrey dark:text-black-100"> Date Created: {DateCreated}  </p>
          <h3 class="text-green text-xl font-bold uppercase">{Task}</h3>
          <p id="helper-radio-text" class="text-xxs font-normal text-lightGrey dark:text-black-100">Status ({Status}) | Date Finished: {DateFinished}</p>
        </div>
      </div>
    </div>

  )
}
const ToDoItem = ({ Task, DateCreated, Status, Done, Remove, Id }) => {
  return (
    <div className="ease-in duration-900 w-400 mt-2 p-5 rounded-lg shadow-lg bg-white hover:bg-lightBlue" >
      <div className="flex ">
        <div className="flex items-center h-5">
          <input
            class="mt-8 w-6 h-6 accent-darkGreen"
            id="default-checkbox"
            type="checkbox"
            checked={false}
            onClick={() => Done(Id)}
          />
        </div>
        <div className="flex flex-row ml-5 justify-between w-full">
          <div className='w-full'
            onClick={() => Done(Id)}
          >
            <p id="helper-radio-text" className="text-xs font-normal text-lightGrey dark:text-gray-300">
              {DateCreated}
            </p>
            <h3 className="text-black text-xl font-bold uppercase">{Task}</h3>
            <p id="helper-radio-text" className="text-xxs font-normal text-lightGrey dark:text-gray-300">
              Status ({Status})
            </p>
          </div>
          <button
            type="button"
            className="text-sm bg-lightremove mt-2 hover:bg-delete text-white h-12"
            onClick={() => Remove(Id)}
          >
            Remove
          </button>
        </div>
      </div>
      <div className="flex justify-end">

      </div>

    </div>


  )
}

export default function App() {
  const current = new Date();
  const now = `${current.getMonth() + 1}/${current.getDate()}/${current.getFullYear()}`;

  const [pendingTasks, setPendingTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);

  const [isPending, setIsPending] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [isDone, setIsDone] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isClear, setIsClear] = useState(false);

  const [isDeleteID, setIsDeleteID] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const onPending = () => {
    setIsPending(true);
    setIsDone(false);
    setSearchTerm("");
  }
  const onDone = () => {
    setIsDone(true);
    setIsPending(false)
    setSearchTerm("");
  }
  const onDelete = (id) => {
    setIsDelete(true)
    setIsDeleteID(id)
  }
  const onClear = () => {
    setIsClear(true)
  }

  const addTask = (taskid, task, status) => {
    try {
      set(ref(database, 'pending-tasks/' + taskid), {
        Date_Created: now,
        Task: task,
        Status: status,
        Task_ID: taskid,
      });
      // alert("Done")
    } catch (e) {
      alert(e)
    }
  }
  const doneTask = async (taskid) => {
    let dateCreated;
    let taskName;
    try {
      const taskRef = ref(database, `pending-tasks/${taskid}`);

      onValue(taskRef, (snapshot) => {
        if (snapshot.exists()) {
          dateCreated = snapshot.val().Date_Created;
          taskName = snapshot.val().Task;
        }
      });
      set(ref(database, 'done-tasks/' + taskid), {
        Date_Created: dateCreated,
        Task: taskName,
        Status: "Done",
        Task_ID: taskid,
      });
      remove(taskRef);

    } catch (e) {
      alert(e)
    }
  }
  const clearTasks = async () => {
    try {
      const taskRef = ref(database, `done-tasks`);
      await remove(taskRef);
      setIsClear(false);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  const removeTask = async () => {
    try {

      const taskRef = ref(database, `pending-tasks/${isDeleteID}`);
      await remove(taskRef);
      setIsDelete(false)
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  const getPendingTasks = () => {
    setIsLoading(true)
    const tasksRef = ref(database, 'pending-tasks');
    return onValue(tasksRef, (snapshot) => {
      const tasks = [];
      snapshot.forEach((childSnapshot) => {
        tasks.push(childSnapshot.val());
      });

      setIsLoading(false);
      return setPendingTasks(tasks);
    });
  };
  const getDoneTasks = () => {
    const tasksRef = ref(database, 'done-tasks');
    return onValue(tasksRef, (snapshot) => {
      const tasks = [];
      snapshot.forEach((childSnapshot) => {
        tasks.push(childSnapshot.val());
      });

      return setDoneTasks(tasks);
    });
  };
  useEffect(() => {
    getPendingTasks();
    getDoneTasks();
  }, [])

  return (
    <>
      <div className='container' class="bg-midnight p-10 mt-20 rounded-lg text-white md:container max-w-lg md:mx-auto" >
        <AddToDoTask NewTask={addTask} />
        <div className='taskTab'>
          <button type="button" class={`${isPending ? "ms-2 text-sm bg-orange hover:bg-orange text-white" : "ms-2 text-sm hover:bg-lightOrange text-white"}`} onClick={onPending}>Pending</button>
          <button type="button" class={`${isDone ? "ms-2 text-sm bg-orange hover:bg-orange text-white" : "ms-2 text-sm hover:bg-lightOrange text-white"}`} onClick={onDone}>Done</button>
          {isDone &&
            <>
              <button type="button" className="clearTab" onClick={onClear}>
                Clear Tasks
              </button>
            </>
          }
        </div>
        <form id="task-form" className="flex justify-center mb-4 mt-2">
          <input type="text" id="task-input" className="w-full text-black p-2 rounded-lg outline-green" placeholder="Search Task" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </form>

        {isPending &&
          <>
           {isLoading && (
              <div className="w-500 p-5 rounded-lg shadow-lg bg-white">
                <h3 className="text-gray">Loading Tasks...</h3>
              </div>
           )}
            {pendingTasks
              .filter((task) => {
                return searchTerm.toLowerCase() === "" ? task : task.Task.toLowerCase().includes(searchTerm)
              })
              .map((task, index) => (
                <ToDoItem
                  key={index}
                  Task={task.Task}
                  DateCreated={task.Date_Created}
                  Status={task.Status}
                  Done={doneTask}
                  Remove={onDelete}
                  Id={task.Task_ID}
                />
              ))} {pendingTasks.length === 0 && !isLoading && (
                <div className="w-500 p-5 rounded-lg shadow-lg bg-white">
                  <h3 className="text-gray">NO PENDING TASK</h3>
                </div>
              )}
          </>
        }
        {isDone &&
          <>
            {doneTasks
              .filter((task) => {
                return searchTerm.toLowerCase() === "" ? task : task.Task.toLowerCase().includes(searchTerm)
              })
              .map((task, index) => (
                <DoneTask
                  key={index}
                  Task={task.Task}
                  DateCreated={task.Date_Created}
                  Status={task.Status}
                  DateFinished={now}
                />
              ))}{doneTasks.length === 0 && (
                <div className="w-500 p-5 rounded-lg shadow-lg bg-white">
                  <h3 className="text-gray">NO TASKS DONE</h3>
                </div>
              )}
          </>
        }
        {/* CONFIRM */}
        {isDelete &&
          <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

                <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                      <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg class="h-6 w-6 text-delete" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                      <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <h3 class="text-base font-semibold leading-6 text-black" id="modal-title">Delete Task</h3>
                        <div class="mt-2">
                          <p class="text-sm text-black">Are you sure you want to delete your task? All of your data will be permanently removed. This action cannot be undone.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="bg-white px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button type="button" class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-delete shadow-sm hover:text-white hover:bg-delete sm:ml-3 sm:w-auto" onClick={removeTask}>Delete</button>
                    <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-remove shadow-sm ring-1 ring-inset ring-remove hover:bg-gray hover:ring-none sm:mt-0 sm:w-auto" onClick={() => setIsDelete(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        {/* CONFIRM */}
        {isClear &&
          <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

                <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                      <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg class="h-6 w-6 text-delete" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                      <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <h3 class="text-base font-semibold leading-6 text-black" id="modal-title">Delete Done Tasks</h3>
                        <div class="mt-2">
                          <p class="text-sm text-black">Are you sure you want to delete your task? All of your data will be permanently removed. This action cannot be undone.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="bg-white px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button type="button" class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-delete shadow-sm hover:text-white hover:bg-delete sm:ml-3 sm:w-auto" onClick={clearTasks}>Delete All</button>
                    <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-remove shadow-sm ring-1 ring-inset ring-remove hover:bg-gray hover:ring-none sm:mt-0 sm:w-auto" onClick={() => setIsClear(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>


    </>
  )
}

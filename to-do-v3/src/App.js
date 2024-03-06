import './App.css'
import React, { useEffect, useState } from 'react'
import { IoCheckbox } from "react-icons/io5";
import { TbSubtask } from "react-icons/tb";
import { firestore } from "./firebase.config";
import { addDoc, collection, getDocs, doc, deleteDoc, onSnapshot } from "@firebase/firestore";

const AddToDoTask = ({ NewTask }) => {
  const [task, setTask] = useState("");
  return (
    <>
      <div className="flex items-center mb-4 leading-none">
        <TbSubtask size={40} className="text-2xl font-bold text-left mr-2" />
        <h1 className="text-4xl font-bold text-left m-4 leading-none">TO DO APP</h1>
      </div>
      <p className="text-gray text-left leading-none mb-10">Stay organized, focused, and in control of your tasks!</p>
      <form id="task-form" className="flex justify-center mb-4 mt-2">
        <input type="text" id="task-input" className="w-full text-black p-2 rounded-lg outline-green" placeholder="New Task" value={task} onChange={(e) => setTask(e.target.value)} />
        <button type="button" className="ms-2 text-sm bg-darkGreen hover:bg-green text-white" onClick={() => { NewTask(task); setTask("") }}>Add</button>
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
          <p id="helper-radio-text" class="text-xs font-normal text-gray dark:text-gray-300"> Date Created: {DateCreated}  </p>
          <h3 class="text-green text-xl font-bold uppercase">{Task}</h3>
          <p id="helper-radio-text" class="text-xs font-normal text-gray dark:text-gray-300">Status ({Status}) | Date Finished: {DateFinished}</p>
        </div>
      </div>
    </div>

  )
}
const ToDoItem = ({ Task, DateCreated, Status, Done, Remove, Id }) => {
  return (
    <div className="ease-in duration-900 w-500 mt-2 p-5 rounded-lg shadow-lg bg-white hover:bg-lightBlue">
      <div className="flex justify-between">
        <div className="flex items-center h-5">
          <input
            class="mt-8 w-6 h-6 accent-darkGreen"
            id="default-checkbox"
            type="checkbox"
            checked={false}
            onClick={() => Done(Id)}
          />
        </div>
        <div className="flex-grow ml-5">
          <p id="helper-radio-text" className="text-xs font-normal text-gray dark:text-gray-300">
            {DateCreated}
          </p>
          <h3 className="text-black text-xl font-bold uppercase">{Task}</h3>
          <p id="helper-radio-text" className="text-xxs font-normal text-gray dark:text-gray-300">
            Status ({Status})
          </p>
        </div>
        <div className="flex ">
          <button
            type="button"
            className="text-sm bg-lightremove hover:bg-delete text-white mt-3 h-12"
            onClick={() => Remove(Id)}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const current = new Date();
  const now = `${current.getMonth()}/${current.getDate()}/${current.getFullYear()}`;

  const [pendingTasks, setPendingTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);

  const [isPending, setIsPending] = useState(true);
  const [isDone, setIsDone] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const onPending = () => {
    setIsPending(true);
    setIsDone(false);
    setSearchTerm("");
  }
  const onDone = () => {
    setIsDone(true);
    setIsPending(false)
    getDoneTasks();
    setSearchTerm("");
  }
  const getPendingTasks = async () => {
    const data = await getDocs(collection(firestore, "pending-tasks"));
    // data.forEach((doc) => {
    //   setPendingTasks(prev => [...prev, { ...doc.data(), id: doc.id }]);
    // })
  
    setPendingTasks(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  }
  const getDoneTasks = async () => {
    const data = await getDocs(collection(firestore, "done-tasks"));
    setDoneTasks(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

    // data.forEach((doc) => {
    //   setDoneTasks(prev => [...prev, { ...doc.data(), id: doc.id }]);
    // })
  }

  const addNewTask = async (task) => {
    try {
      addDoc(collection(firestore, "pending-tasks"), {
        Date_Created: now,
        Status: "Pending",
        Task: task,
      });
      getPendingTasks();
    } catch (e) {
      console.log(e)
    }
  }
  const doneTask = async (id) => {
    try {
      onSnapshot(doc(firestore, "pending-tasks", id), (doc) => {
        if (doc.exists()) {
          addDoc(collection(firestore, "done-tasks"), {
            Date_Created: doc.data().Date_Created,
            Date_Finished: now,
            Status: "Done",
            Task: doc.data().Task,
          });
        }
      });
      await deleteDoc(doc(firestore, "pending-tasks", id));
      getPendingTasks();
    } catch (e) {
      console.log(e)
    }
  }
  const clearTasks = async () => {
    try {
      const userCollection = collection(firestore, "done-tasks");
      const querySnapshot = await getDocs(userCollection);

      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
        getDoneTasks();

      });
    } catch (e) {
      console.error(e);
    }
  };
  const removeTask = async (id) => {
    try {
      const userDoc = doc(firestore, "pending-tasks", id);
      await deleteDoc(userDoc);
      getPendingTasks();
    } catch (e) {
      console.log(e)
    }
  };

  useEffect(() => {
    getPendingTasks();
    getDoneTasks();
  }, [])

  return (
    <>
      <div className='container' class="bg-midnight p-10 mt-20 rounded-lg text-white md:container max-w-lg md:mx-auto" >
        <AddToDoTask NewTask={addNewTask} />
        <div className='taskTab'>
          <button type="button" class={`${isPending ? "ms-2 text-sm bg-orange hover:bg-orange text-white" : "ms-2 text-sm hover:bg-lightOrange text-white"}`} onClick={onPending}>Pending</button>
          <button type="button" class={`${isDone ? "ms-2 text-sm bg-orange hover:bg-orange text-white" : "ms-2 text-sm hover:bg-lightOrange text-white"}`} onClick={onDone}>Done</button>
          {isDone &&
            <>
              <button type="button" className="clearTab" onClick={clearTasks}>
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
                  Remove={removeTask}
                  Id={task.id}
                />
              ))} {pendingTasks.length === 0 && (
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
      </div>
      {/* Confirm */}
      
    </>
  )
}

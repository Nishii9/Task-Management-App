import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Loader from './utils/Loader';
import Tooltip from './utils/Tooltip';

const Tasks = () => {
  const authState = useSelector(state => state.authReducer);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]); 
  const [fetchData, { loading }] = useFetch();
  const [searchTerm, setSearchTerm] = useState(''); 
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTasks = useCallback(() => {
    const config = { url: '/tasks', method: 'get', headers: { Authorization: authState.token } };
    fetchData(config, { showSuccessToast: false }).then(data => {
      setTasks(data.tasks);
      setFilteredTasks(data.tasks); 
    });
  }, [authState.token, fetchData]);

  useEffect(() => {
    if (!authState.isLoggedIn) return;
    fetchTasks();
  }, [authState.isLoggedIn, fetchTasks]);

  useEffect(() => {
    const filtered = tasks.filter(task =>
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (priorityFilter === '' || task.priority === priorityFilter)
    );
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, priorityFilter]);

  const handleDelete = id => {
    const config = { url: `/tasks/${id}`, method: 'delete', headers: { Authorization: authState.token } };
    fetchData(config).then(() => fetchTasks());
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePriorityFilterChange = (e) => {
    setPriorityFilter(e.target.value);
  };

  return (
    <>
      <div className="my-2 mx-auto max-w-[700px] py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="my-2 ml-2 md:ml-0 text-xl">Your tasks ({filteredTasks.length})</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search tasks"
              value={searchTerm}
              onChange={handleSearchChange}
              className="border p-2 rounded-md"
            />
            <select
              value={priorityFilter}
              onChange={handlePriorityFilterChange}
              className="border p-2 rounded-md"
            >
              <option value="">Filter by Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div>
            {filteredTasks.length === 0 ? (
              <div className="w-[600px] h-[300px] flex items-center justify-center gap-4">
                <span>No tasks found</span>
                <Link
                  to="/tasks/add"
                  className="bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-md px-4 py-2"
                >
                  + Add new task{' '}
                </Link>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <div key={task._id} className="bg-white my-4 p-4 text-gray-600 rounded-md shadow-md">
                  <div className="flex">
                    <span className="font-medium">Task #{index + 1}</span>
                    <Tooltip text={'Edit this task'} position={'top'}>
                      <Link to={`/tasks/${task._id}`} className="ml-auto mr-2 text-green-600 cursor-pointer">
                        <i className="fa-solid fa-pen"></i>
                      </Link>
                    </Tooltip>
                    <Tooltip text={'Delete this task'} position={'top'}>
                      <span className="text-red-500 cursor-pointer" onClick={() => handleDelete(task._id)}>
                        <i className="fa-solid fa-trash"></i>
                      </span>
                    </Tooltip>
                  </div>
                  <div className="whitespace-pre">
                    <p>Description: {task.description}</p>
                    <p>Priority: {task.priority}</p>
                    <p>Due Date: {formatDate(task.dueDate)}</p> {/* Format dueDate here */}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Tasks;


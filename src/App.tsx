import React from 'react'
import './App.css'
import { applyAction, initialize, makeSideEffectExecutor, SideEffect } from './ToDo/todo'
import { useMVUReducer } from './mvuReducer'
import { TrashIcon } from '@heroicons/react/20/solid'

function App() {
  const syncWithServer = async (_message: SideEffect) => {
    return { success: true as const }
  }

  const [state, dispatch] = useMVUReducer(initialize, applyAction, makeSideEffectExecutor(syncWithServer))
  const { items, editingId } = state

  const toggleTodo = (id: number) => {
    dispatch({ action: 'toggle-complete', id })
  }

  const addTodo = () => {
    const id = Date.now()
    dispatch({ action: 'add-item', text: '' })
    dispatch({ action: 'start-edit', id })
  }

  const handleEdit = (id: number) => {
    dispatch({ action: 'start-edit', id })
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold mb-8">Todo List</h1>

                <button
                  onClick={addTodo}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>

                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleTodo(item.id)}
                        className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      {editingId === item.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            dispatch({ action: 'end-edit' })
                          }}
                          className="flex-1"
                        >
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => dispatch({ action: 'update-text', id: item.id, text: e.target.value })}
                            onBlur={() => dispatch({ action: 'end-edit' })}
                            autoFocus
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      ) : (
                        <span
                          onClick={() => handleEdit(item.id)}
                          className={`flex-1 cursor-pointer ${item.completed ? 'line-through text-gray-400' : ''}`}
                        >
                          {item.text || '(Click to edit)'}
                        </span>
                      )}
                      <button
                        onClick={() => dispatch({ action: 'remove-item', id: item.id })}
                        className="p-1 hover:bg-gray-200 rounded-full"
                        type="button"
                      >
                        <TrashIcon className="w-4 h-4 text-gray-500 hover:text-red-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

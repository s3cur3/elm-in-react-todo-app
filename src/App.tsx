import React from 'react'
import './App.css'
import { applyAction, initialize, makeSideEffectExecutor, SideEffect } from './ToDo/todo'
import { useMVUReducer } from './mvuReducer'
import { TrashIcon, PlusIcon } from '@heroicons/react/20/solid'

function App() {
  const syncWithServer = async (message: SideEffect) => {
    try {
      localStorage.setItem('todos', JSON.stringify(message.items))
      return { success: true as const }
    } catch (error) {
      console.error('Failed to sync with localStorage:', error)
      return { success: false, error: String(error) }
    }
  }

  const [state, dispatch] = useMVUReducer(
    () => initialize(JSON.parse(localStorage.getItem('todos') || '[]')),
    applyAction,
    makeSideEffectExecutor(syncWithServer)
  )
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
    <div className="min-h-screen bg-zinc-900 text-zinc-100 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium">Tasks</h1>
            <button
              onClick={addTodo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-100 text-sm rounded-md hover:bg-zinc-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <PlusIcon className="w-4 h-4" />
              New Task
            </button>
          </div>

          <ul className="space-y-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="group flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded-md transition-colors duration-150"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleTodo(item.id)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900"
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
                      className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </form>
                ) : (
                  <span
                    onClick={() => handleEdit(item.id)}
                    className={`flex-1 cursor-pointer ${
                      item.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                    }`}
                  >
                    {item.text || '(Click to edit)'}
                  </span>
                )}
                <button
                  onClick={() => dispatch({ action: 'remove-item', id: item.id })}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded-md transition-all duration-150"
                  type="button"
                >
                  <TrashIcon className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App

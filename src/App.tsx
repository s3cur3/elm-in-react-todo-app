import React, { useState } from 'react'
import './App.css'
import { applyAction, initialize, makeSideEffectExecutor, SideEffect } from './ToDo/todo'
import { useMVUReducer } from './mvuReducer'

function App() {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  const syncWithServer = async (_message: SideEffect) => {
    return { success: true as const }
  }

  const [state, dispatch] = useMVUReducer(initialize, applyAction, makeSideEffectExecutor(syncWithServer))
  const { items } = state

  const toggleTodo = (id: number) => {
    dispatch({ action: 'toggle-complete', id })
  }

  const addTodo = () => {
    const id = Date.now()
    dispatch({ action: 'add-item', text: '' })
    setEditingId(id)
    setEditText('')
  }

  const updateTodo = (id: number, text: string) => {
    dispatch({ action: 'update-text', id, text })
  }

  const handleEdit = (id: number, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const handleSubmit = (id: number) => {
    if (editText.trim()) {
      updateTodo(id, editText.trim())
    }
    setEditingId(null)
    setEditText('')
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
                            handleSubmit(item.id)
                          }}
                          className="flex-1 flex gap-2"
                        >
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={() => handleSubmit(item.id)}
                            autoFocus
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </form>
                      ) : (
                        <span
                          onClick={() => handleEdit(item.id, item.text)}
                          className={`flex-1 cursor-pointer ${item.completed ? 'line-through text-gray-400' : ''}`}
                        >
                          {item.text || '(Click to edit)'}
                        </span>
                      )}
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

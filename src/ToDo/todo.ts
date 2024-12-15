import { Update } from '~/mvuReducer'

export interface Todo {
  id: number
  text: string
  completed: boolean
}

export type State = {
  items: Todo[]
  editingId?: number
}

type AddItemAction = { action: 'add-item'; text: string }
type ToggleCompleteAction = { action: 'toggle-complete'; id: number }
type RemoveItemAction = { action: 'remove-item'; id: number }
type StartEditAction = { action: 'start-edit'; id: number }
type UpdateTextAction = { action: 'update-text'; id: number; text: string }
type EndEditAction = { action: 'end-edit' }

export type Action =
  | AddItemAction
  | ToggleCompleteAction
  | RemoveItemAction
  | StartEditAction
  | UpdateTextAction
  | EndEditAction

export type Dispatch = (action: Action) => void

export type SideEffect = { action: 'sync'; items: Todo[] }

export function initialize(existingTodos: Todo[] = []): [State, SideEffect[]] {
  return [{ items: existingTodos }, []]
}

const updateItem = (state: State, id: number, update: Partial<Todo>): State => ({
  ...state,
  items: state.items.map((item) => (item.id === id ? { ...item, ...update } : item)),
})

export function applyAction(state: State, action: Action): Update<State, SideEffect> {
  switch (action.action) {
    case 'add-item': {
      const newItem: Todo = {
        id: Date.now(),
        text: action.text,
        completed: false,
      }
      const newState = { ...state, items: [...state.items, newItem] }
      return [newState, [{ action: 'sync', items: newState.items }]]
    }

    case 'toggle-complete': {
      const item = state.items.find((i) => i.id === action.id)
      const completed = !item?.completed
      const newState = updateItem(state, action.id, { completed })
      return [newState, [{ action: 'sync', items: newState.items }]]
    }

    case 'remove-item': {
      const newState = { ...state, items: state.items.filter((item) => item.id !== action.id) }
      return [newState, [{ action: 'sync', items: newState.items }]]
    }

    case 'update-text': {
      const newState = updateItem(state, action.id, { text: action.text })
      return [newState, [{ action: 'sync', items: newState.items }]]
    }

    case 'start-edit':
      return [{ ...state, editingId: action.id }, []]

    case 'end-edit':
      return [{ ...state, editingId: undefined }, []]
  }
}

type ServerResult = { success: true } | { success: false; error: string }
type SyncWithServer = (message: SideEffect) => Promise<ServerResult>

export function makeSideEffectExecutor(
  sendServerMessage: SyncWithServer
): (effect: SideEffect, dispatch: Dispatch) => void {
  return (effect, _dispatch) => {
    sendServerMessage(effect).then((result) => {
      if (!result.success) {
        console.error('Failed to sync with server:', result.error)
      }
    })
  }
}

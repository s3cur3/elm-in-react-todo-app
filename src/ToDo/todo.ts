import { Update } from '~/mvuReducer'

export interface Todo {
  id: number
  text: string
  completed: boolean
}

export type State = {
  items: Todo[]
}

type AddItemAction = { action: 'add-item'; text: string }
type UpdateTextAction = { action: 'update-text'; id: number; text: string }
type ToggleCompleteAction = { action: 'toggle-complete'; id: number }
type RemoveItemAction = { action: 'remove-item'; id: number }

export type Action = AddItemAction | UpdateTextAction | ToggleCompleteAction | RemoveItemAction
export type Dispatch = (action: Action) => void

type UpdateItemEffect = { action: 'update-item'; id: number; text: string; completed: boolean }
type AddItemEffect = { action: 'add-item'; text: string }

export type SideEffect = UpdateItemEffect | AddItemEffect

export function initialize(): [State, SideEffect[]] {
  return [{ items: [] }, []]
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
      return [{ ...state, items: [...state.items, newItem] }, []]
    }

    case 'update-text':
      return [updateItem(state, action.id, { text: action.text }), []]

    case 'toggle-complete': {
      const item = state.items.find((i) => i.id === action.id)

      return [updateItem(state, action.id, { completed: !item?.completed }), []]
    }

    case 'remove-item':
      return [
        {
          ...state,
          items: state.items.filter((item) => item.id !== action.id),
        },
        [],
      ]
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

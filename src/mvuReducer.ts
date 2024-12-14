/**
 * This is an implementation of The Elm Architecture (TEA), generically known as Model-View-Update (MVU).
 *
 * The idea here is that the full lifecycle of a component (and, in fact, a whole app!) can be
 * captured by three functions:
 *
 * - One to provide the initial state
 * - One to describe how the state changes in response to a user action (the full range of which
 *   can be enumerated by the implementer) and what side effects are produced by that action
 * - One to describe how to execute side effects
 *
 * The State is all the data your component needs to maintain. This is a replacement for
 * class state or React hooks.
 *
 * An Action is something the user does. It should be semantically meaningful, like
 * "submit a form" or "change text," rather than purely mechanical ("click a button" or
 * "press a key"). React code uses the `dispatch` function to bubble actions up to where
 * they will be actually applied.
 *
 * A SideEffect is what Elm calls a "command". It might be something like "make a network request"
 *  or "focus an input element."
 */

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * The reducer in an MVU architecture describes how the state changes and which side effects
 * should be executed in response to a user action.
 */
export type MVUReducer<State, Action, SideEffect> = (state: State, action: Action) => Update<State, SideEffect>

/**
 * An update (produced by the MVUReducer) is a tuple of the new state and a list of
 * (potentially asynchronous) side effects to execute. Side effects will execute in
 * the order they are given, and may contain things like making network requests, focusing
 * DOM elements, etc.
 */
export type Update<State, SideEffect> = [State, SideEffect[]]

/**
 * The thing in charge of actually executing a SideEffect.
 *
 * Depending on the results of a side effect, the dispatch function may bubble up
 * actions that update the state of the parent component (or even produce further side effects).
 * A good example of this is a network request, where, depending on what you get back,
 * might require further requests based on the new information.
 */
export type SideEffectExecutor<SideEffect, Action> = (effect: SideEffect, dispatch: (action: Action) => void) => void

type Initializer<State, SideEffect> = [State, SideEffect[]]

/**
 * A hook that integrates an MVU reducer with React.
 *
 * This should only be used at the highest level of your component hierarchy,
 * and individual components should be receiving their state from the parent and
 * bubbling up their actions to the parent for updates.
 */
export function useMVUReducer<State, Action, SideEffect>(
  initializer: Initializer<State, SideEffect> | (() => Initializer<State, SideEffect>),
  reducer: MVUReducer<State, Action, SideEffect>,
  sideEffectExecutor: SideEffectExecutor<SideEffect, Action>
): [State, (action: Action) => [State, Array<SideEffect>]] {
  const [initialState, initialSideEffects] = typeof initializer === 'function' ? initializer() : initializer

  const [state, setState] = useState<State>(initialState)
  const stateRef = useRef(state)

  // Tyler notes: there is some risk that useCallback will produce new functions
  // too frequently. Since the reducer and sideEffectExecutor should be constant
  // for the life of a component, though, I *think* it will be fine.
  //  If we end up having a bunch of rerenders, we may need to steal the implementation
  // of the proposed-but-scrapped useEvent hook from React (or whatever they have since
  // implemented that solves the same problem).
  const dispatch = useCallback(
    (action: Action) => {
      const update = reducer(stateRef.current, action)
      const [newState, sideEffects] = update
      debugLogUpdate(action, stateRef.current, newState, sideEffects)

      stateRef.current = newState
      setState(newState)

      sideEffects.forEach((effect) => sideEffectExecutor(effect, dispatch))

      return update
    },
    [reducer, sideEffectExecutor]
  )

  // We run the initial side effects exactly once.
  // Thus, it's not an error that `useEffect` has no dependency on `initialSideEffects`,
  // because we explicitly do not want it to run on rerenders.
  useEffect(() => {
    initialSideEffects.forEach((effect) => sideEffectExecutor(effect, dispatch))
  }, [])

  return [state, dispatch]
}

function debugLogUpdate<Action, State, SideEffect>(
  action: Action,
  state: State,
  newState: State,
  sideEffects: SideEffect[]
) {
  debugLog(
    'Applied',
    summarizeAction(action),
    'action to',
    summarizeState(state),
    'state, producing new state',
    summarizeState(newState),
    'with',
    summarizeSideEffects(sideEffects)
  )
}

function summarizeState<State>(state: State) {
  return state && typeof state === 'object' && 'mode' in state ? `\`${state.mode}\`` : state
}

function summarizeAction<Action>(action: Action) {
  return action && typeof action === 'object' && 'action' in action ? `\`${action.action}\`` : action
}

function summarizeSideEffects<SideEffect>(sideEffects: SideEffect[]) {
  const summarized = sideEffects.map((effect) => {
    if (effect && typeof effect === 'object' && 'effect' in effect) {
      return `\`${effect.effect}\``
    }
    return effect
  })

  return summarized.length === 0 ? 'no side effects' : `side effects: ${summarized}`
}

// function debugLog(...args: any[]) {
//   console.log(`[MVU Reducer]`, ...args)
// }

function debugLog(..._args: any[]) {
  // No-op unless devs opt in
}

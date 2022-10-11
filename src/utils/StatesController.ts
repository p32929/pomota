import { state, action, createStore } from 'usm-redux';

export interface IStates {
    workTime: number,
    breakTime: number,
    pomoState: 'work' | 'break' | 'idle',
    warningSecs: number,
    currentTimer: number
}

export const initialState: IStates = {
    workTime: 50,
    breakTime: 10,
    warningSecs: 30,
    pomoState: 'idle',
    currentTimer: 0,
}

export class Controller {
    @state
    states = initialState

    @action
    setState(state: Partial<IStates>) {
        this.states = {
            ...this.states,
            ...state
        }
    }
}

export const controller = new Controller();

export const store = createStore({
    modules: [controller],
});
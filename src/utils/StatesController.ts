import { state, action, createStore } from 'usm-redux';

export interface IStates {
    workTime: number,
    breakTime: number,
    pomoState: 'work' | 'break' | 'idle',
    currentTimer: number
}

export class Controller {
    @state
    states: IStates = {
        workTime: 1,
        breakTime: 1,
        pomoState: 'idle',
        currentTimer: 0,
    }

    @action
    setState(state: Partial<IStates>) {
        // console.log(`SetState`, state)
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
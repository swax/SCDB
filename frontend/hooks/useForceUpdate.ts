import { useReducer } from 'react';

export function useForceUpdate() {
    return useReducer((x: number) => x + 1, 0)[1];
}

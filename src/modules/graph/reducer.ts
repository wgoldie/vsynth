import { ActionType } from 'typesafe-actions';
import { SimpleVideoGraph } from '../../model/SimpleVideoGraph';
import { findEdge, insertEdge, removeEdge } from '@davidisaaclee/graph';
import * as Constants from './constants';
import * as actions from './actions';
import * as uuid from 'uuid';

export interface State {
	graph: SimpleVideoGraph;
	outputNodeKey: string | null;
};

const initialState: State = {
	graph: {
		nodes: {
			'constant': {
				type: 'constant',
				uniforms: {
					value: {
						type: '3f',
						data: [0, 0, 0],
					}
				},
			},
			'oscillator': {
				type: 'oscillator',
				uniforms: {
					frequency: {
						type: 'f',
						data: 20,
					}
				},
			},
			'lfo': {
				type: 'oscillator',
				uniforms: {
					frequency: {
						type: 'f',
						data: 11,
					}
				},
			},
		},
		edges: {
			'constant -> oscillator.rotation': {
				src: 'oscillator',
				dst: 'constant',
				metadata: {
					inlet: 'rotation'
				}
			},
			/*
			'constant -> lfo.rotation': {
				src: 'lfo',
				dst: 'constant',
				metadata: {
					uniformIdentifier: 'rotationTheta'
				}
			},
			'lfo -> osc.rotation': {
				src: 'oscillator',
				dst: 'lfo',
				metadata: {
					uniformIdentifier: 'rotationTheta'
				}
			}
			*/
		}
	},
	outputNodeKey: 'oscillator'
};

type RootAction = ActionType<typeof actions>;

export const reducer = (state: State = initialState, action: RootAction) => {
	switch (action.type) {
		case Constants.SET_MASTER_OUTPUT:
			return {
				...state,
				outputNodeKey: action.payload,
			};

		case Constants.CONNECT_NODES:
			return (({ toNodeKey, fromNodeKey, inletKey }) => {
				const edge = {
					src: toNodeKey,
					dst: fromNodeKey,
					metadata: {
						inlet: inletKey
					}
				};

				if (findEdge(state.graph, e => edge === e) != null) {
					return state;
				} else {
					return {
						...state,
						graph: insertEdge(state.graph, edge, uuid())
					};
				}
			})(action.payload);

		case Constants.DISCONNECT_NODES:
			return (({ toNodeKey, fromNodeKey, inletKey }) => {
				const edge = {
					src: action.payload.toNodeKey,
					dst: action.payload.fromNodeKey,
					metadata: {
						inlet: action.payload.inletKey
					}
				};

				const edgeKeyToRemove = findEdge(state.graph, e => edge === e);

				if (edgeKeyToRemove == null) {
					return state;
				} else {
					return {
						...state,
						graph: removeEdge(state.graph, edgeKeyToRemove)
					};
				}
			})(action.payload);

		default:
			return state;
	}
};



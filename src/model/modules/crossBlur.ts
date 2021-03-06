import * as Graph from '@davidisaaclee/graph';
import { VideoModule, SubgraphModule, ModuleConfigurationType } from '../VideoModule';
import * as SinglePassBlur from './singlePassBlur';

export const parameterKeys = {
	input: 'input',
	rotation: 'rotation',
};

export const inletKeys = {
	input: 'input',
};

export const nodeKeys = {
	first: 'first',
	last: 'last',
};

export const crossBlur: VideoModule<SubgraphModule> = {
	name: 'crossblur',
	description: "Applies a Gaussian blur in two perpendicular directions.",

	parameters: {
		keys: [
			parameterKeys.input,
			parameterKeys.rotation
		],
		defaultValues: {
			[parameterKeys.input]: 1,
			[parameterKeys.rotation]: 0,
		}
	},

	inlets: {
		keys: [inletKeys.input],

		associatedParameters: {
			[inletKeys.input]: parameterKeys.input,
		}
	},

	details: {
		type: ModuleConfigurationType.subgraph,

		inletsToSubInlets: {
			[inletKeys.input]: [{
				nodeKey: nodeKeys.first,
				inletKey: SinglePassBlur.inletKeys.input,
			}],
		},

		parametersToSubParameters: params => {
			const theta = 2 * Math.PI * params[parameterKeys.rotation];
			const d1 = {
				x: Math.cos(theta),
				y: -Math.sin(theta),
			};
			const d2 = {
				x: -d1.y,
				y: d1.x,
			};

			return {
				[nodeKeys.first]: {
					[SinglePassBlur.inletKeys.input]: params[parameterKeys.input],
					[SinglePassBlur.parameterKeys.dx]: d1.x,
					[SinglePassBlur.parameterKeys.dy]: d1.y,
				},
				[nodeKeys.last]: {
					[SinglePassBlur.parameterKeys.dx]: d2.x,
					[SinglePassBlur.parameterKeys.dy]: d2.y,
				},
			};
		},

		buildSubgraph: () => {
			const result = Graph.empty();
			Graph.insertNode(
				result,
				'singlePassBlur',
				nodeKeys.first);
			Graph.insertNode(
				result,
				'singlePassBlur',
				nodeKeys.last);

			Graph.insertEdge(
				result,
				{
					dst: nodeKeys.first,
					src: nodeKeys.last,
					metadata: {
						inlet: SinglePassBlur.inletKeys.input,
					}
				},
				'first -> last.input');

			return {
				graph: result,
				outputNodeKey: nodeKeys.last
			};
		}
	}

};


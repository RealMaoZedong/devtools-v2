class GraphEvaluator {
    constructor(nodeManager) {
        this.nodeManager = nodeManager;
    }

    async evaluateNode(node, evaluatedResults) {
        if (evaluatedResults.has(node)) {
            return evaluatedResults.get(node);
        }

        if (node.inputs.length === 0) {
            let result = await node.eval([], node.settings);
            evaluatedResults.set(node, result);
            return result;
        }

        let inputValues = new Array(node.inputs.length).fill(null);
        
        const connectionPromises = node.connections.map(async (conn) => {
            if (conn.inputNode === node) {
                let sourceResults = await this.evaluateNode(conn.outputNode, evaluatedResults);
                inputValues[conn.input] = sourceResults[conn.output];
            }
        });

        await Promise.all(connectionPromises);

        if (inputValues.some(v => v === null)) {
            console.warn(`Node ${node.name} has disconnected inputs`);
            if(node.name === "Output") {
                await node.eval([], node.settings);
            }
            return [];
        }

        let result = await node.eval(inputValues, node.settings);
        evaluatedResults.set(node, result);
        return result;
    }

    async evaluateGraph() {
        const outputNode = this.nodeManager.nodes.find(node => node.name === "Output");
        if (outputNode) {
            await this.evaluateNode(outputNode, new Map());
        }
    }
}

export default GraphEvaluator;

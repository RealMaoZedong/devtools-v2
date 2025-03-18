import { NODE_WIDTH } from '../constants.js';

class NodeManager {
    constructor(allUseableNodes) {
        this.nodes = [];
        this.allUseableNodes = allUseableNodes;
    }

    addNode(nodeName, x, y) {
        const nodeTemplate = this.allUseableNodes[nodeName];
        
        let settingsCopy = {};
        if (nodeTemplate.settings) {
            for (const key in nodeTemplate.settings) {
                settingsCopy[key] = {
                    ...nodeTemplate.settings[key],
                    value: nodeTemplate.settings[key].value
                };
            }
        }

        const node = {
            ...nodeTemplate,
            name: nodeName,
            inputs: [...nodeTemplate.inputs],
            outputs: [...nodeTemplate.outputs],
            connections: [],
            eval: nodeTemplate.eval,
            settings: settingsCopy,
            renderData: {
                x: x,
                y: y
            }
        };
        
        this.nodes.push(node);
        return node;
    }

    removeNode(node) {
        if (node.name === 'Input' || node.name === 'Output') {
            return false;
        }

        this.nodes.forEach(n => {
            n.connections = n.connections.filter(conn => 
                conn.inputNode !== node && conn.outputNode !== node
            );
        });
        
        this.nodes = this.nodes.filter(n => n !== node);
        return true;
    }

    findNodeAtPosition(worldPos) {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            if (this.isMouseOverNode(node, worldPos)) {
                return node;
            }
        }
        return null;
    }

    findInputAtPosition(worldPos) {
        for (const node of this.nodes) {
            for (let i = 0; i < node.inputs.length; i++) {
                if (this.isMouseOverInput(node, i, worldPos)) {
                    return { node, inputIndex: i };
                }
            }
        }
        return null;
    }

    findOutputAtPosition(worldPos) {
        for (const node of this.nodes) {
            for (let i = 0; i < node.outputs.length; i++) {
                if (this.isMouseOverOutput(node, i, worldPos)) {
                    return { node, outputIndex: i };
                }
            }
        }
        return null;
    }

    isMouseOverNode(node, worldPos) {
        return worldPos.x >= node.renderData.x && 
               worldPos.x <= node.renderData.x + NODE_WIDTH &&
               worldPos.y >= node.renderData.y && 
               worldPos.y <= node.renderData.y + this.calcNodeHeight(node) + 50;
    }

    isMouseOverInput(node, inputIndex, worldPos) {
        const x = node.renderData.x;
        const y = node.renderData.y + 50 + (50 * inputIndex);
        const radius = 10;
        return Math.sqrt((worldPos.x - x) ** 2 + (worldPos.y - y) ** 2) <= radius;
    }

    isMouseOverOutput(node, outputIndex, worldPos) {
        const x = node.renderData.x + NODE_WIDTH;
        const y = node.renderData.y + 50 + (50 * outputIndex);
        const radius = 10;
        return Math.sqrt((worldPos.x - x) ** 2 + (worldPos.y - y) ** 2) <= radius;
    }

    removeExistingConnection(node, inputIndex) {
        node.connections = node.connections.filter(conn => 
            !(conn.inputNode === node && conn.input === inputIndex)
        );
    }

    addConnection(outputNode, outputIndex, inputNode, inputIndex) {
        // First remove any existing connection to this input
        this.removeExistingConnection(inputNode, inputIndex);
        
        // Create the new connection
        const connection = {
            output: outputIndex,
            outputNode: outputNode,
            input: inputIndex,
            inputNode: inputNode
        };
        
        // Add the connection to the input node
        inputNode.connections.push(connection);
        
        return connection;
    }

    removeOutputConnections(node, outputIndex) {
        this.nodes.forEach(n => {
            n.connections = n.connections.filter(conn => 
                !(conn.outputNode === node && conn.output === outputIndex)
            );
        });
    }

    calcNodeHeight(node) {
        return (Math.max(node.inputs.length, node.outputs.length) + 
               (node.settings !== undefined ? Object.keys(node.settings).length : 0)) * 50;
    }
}

export default NodeManager;
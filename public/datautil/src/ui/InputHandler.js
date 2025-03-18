import { SETTING_TYPES } from '../constants.js';

class InputHandler {
    constructor(canvas, nodeManager, transformUtils, renderer, nodeMenu, graphEvaluator) {
        this.canvas = canvas;
        this.nodeManager = nodeManager;
        this.transformUtils = transformUtils;
        this.renderer = renderer;
        this.nodeMenu = nodeMenu;
        this.graphEvaluator = graphEvaluator;
        
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        
        this.draggingNode = null;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.isDraggingOutput = false;
        this.draggingOutputNode = null;
        this.draggingOutput = null;
        this.lineStartPos = null;
        
        this.mousePos = { x: 0, y: 0 };
        
        this.initEventListeners();
    }
    
    initEventListeners() {
    
        this.boundMouseDown = this.onMouseDown.bind(this);
        this.boundMouseMove = this.onMouseMove.bind(this);
        this.boundMouseUp = this.onMouseUp.bind(this);
        this.boundWheel = this.onWheel.bind(this);
        this.boundContextMenu = this.onContextMenu.bind(this);
        
    
        this.canvas.addEventListener('mousedown', this.boundMouseDown);
        this.canvas.addEventListener('mousemove', this.boundMouseMove);
        this.canvas.addEventListener('mouseup', this.boundMouseUp);
        this.canvas.addEventListener('wheel', this.boundWheel);
        this.canvas.addEventListener('contextmenu', this.boundContextMenu);
    }
    
    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    
    async onMouseDown(event) {
        this.mousePos = this.getMousePos(event);
        const worldPos = this.transformUtils.screenToWorld(this.mousePos);

    
        if (event.button === 1) {
            this.isPanning = true;
            this.panStart = { x: this.mousePos.x, y: this.mousePos.y };
            this.canvas.style.cursor = 'grabbing';
            return;
        }

        if (event.button === 0) {
            for (const node of this.nodeManager.nodes) {
                if (this.nodeManager.isMouseOverNode(node, worldPos)) {
                    if (this.handleSettingClick(node, worldPos)) {
                        this.renderer.render();
                        return;
                    }
                }
            }

            const outputResult = this.nodeManager.findOutputAtPosition(worldPos);
            if (outputResult) {
                this.isDraggingOutput = true;
                this.draggingOutput = outputResult.outputIndex;
                this.draggingOutputNode = outputResult.node;
                this.lineStartPos = { 
                    x: outputResult.node.renderData.x + 200, 
                    y: outputResult.node.renderData.y + 50 + (50 * outputResult.outputIndex) 
                };
                this.renderer.setLineDrag(true, this.lineStartPos);
                return;
            }
            
            const node = this.nodeManager.findNodeAtPosition(worldPos);
            if (node) {
                this.draggingNode = node;
                this.offsetX = worldPos.x - node.renderData.x;
                this.offsetY = worldPos.y - node.renderData.y;
            }
        }
    }
    
    async onMouseMove(event) {
        this.mousePos = this.getMousePos(event);
        this.renderer.setMousePos(this.mousePos);
        const worldPos = this.transformUtils.screenToWorld(this.mousePos);

    
        if (this.isPanning) {
            this.transformUtils.pan(event.movementX, event.movementY);
            this.renderer.render();
            return;
        }

    
        if (this.draggingNode) {
            this.draggingNode.renderData.x = worldPos.x - this.offsetX;
            this.draggingNode.renderData.y = worldPos.y - this.offsetY;
            this.renderer.render();
        }

        if (this.isDraggingOutput) {
            this.renderer.render();
        }
    }
    
    async onMouseUp(event) {
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = 'default';
            return;
        }

        if (event.button === 2) {
            return;
        }
        
        this.mousePos = this.getMousePos(event);
        const worldPos = this.transformUtils.screenToWorld(this.mousePos);

        if (this.draggingNode) {
            this.draggingNode = null;
        }

        if (this.isDraggingOutput) {
            let connectedToInput = false;
            
            const inputResult = this.nodeManager.findInputAtPosition(worldPos);
            if (inputResult) {
            
                this.nodeManager.removeExistingConnection(inputResult.node, inputResult.inputIndex);
                this.nodeManager.addConnection(
                    this.draggingOutputNode, 
                    this.draggingOutput, 
                    inputResult.node, 
                    inputResult.inputIndex
                );
                
            
                await this.graphEvaluator.evaluateGraph();
                connectedToInput = true;
                
            
                this.renderer.render();
            }

            if (!connectedToInput) {
                const allUseableNodes = this.nodeManager.allUseableNodes;
                const NODE_CATEGORIES = window.NODE_CATEGORIES || {};
                
            
                this.nodeMenu.showMenu(worldPos.x, worldPos.y, this.draggingOutputNode, this.draggingOutput, allUseableNodes, NODE_CATEGORIES);
            }

            this.draggingOutputNode = null;
            this.draggingOutput = null;
            this.isDraggingOutput = false;
            this.renderer.setLineDrag(false, null);
            this.renderer.render();
        }
    }
    
    onWheel(event) {
        event.preventDefault();
        this.transformUtils.handleZoom(event.deltaY, this.mousePos);
        this.renderer.render();
    }
    
    async onContextMenu(event) {
        event.preventDefault();
        this.mousePos = this.getMousePos(event);
        const worldPos = this.transformUtils.screenToWorld(this.mousePos);

    
        const inputResult = this.nodeManager.findInputAtPosition(worldPos);
        if (inputResult) {
            this.nodeManager.removeExistingConnection(inputResult.node, inputResult.inputIndex);
            await this.graphEvaluator.evaluateGraph();
            this.renderer.render();
            return;
        }

    
        const outputResult = this.nodeManager.findOutputAtPosition(worldPos);
        if (outputResult) {
            this.nodeManager.removeOutputConnections(outputResult.node, outputResult.outputIndex);
            await this.graphEvaluator.evaluateGraph();
            this.renderer.render();
            return;
        }

    
        const node = this.nodeManager.findNodeAtPosition(worldPos);
        if (node) {
            const removed = this.nodeManager.removeNode(node);
            if (removed) {
                await this.graphEvaluator.evaluateGraph();
                this.renderer.render();
            }
        }
    }
    
    handleSettingClick(node, worldPos) {
        if (!node.settings) return false;
        
        const ioports = Math.max(node.inputs.length, node.outputs.length);
        let index = 0;
        
        for (const key in node.settings) {
            if (Object.prototype.hasOwnProperty.call(node.settings, key)) {
                const setting = node.settings[key];
                const settingY = node.renderData.y + 50 + (50 * (ioports + index));
                const controlX = node.renderData.x + 200 - 60;
                const controlY = settingY - 15;
                
                switch (setting.type) {
                    case SETTING_TYPES.CHECKBOX:
                        if (worldPos.x >= controlX && worldPos.x <= controlX + 30 &&
                            worldPos.y >= controlY && worldPos.y <= controlY + 30) {
                            setting.value = !setting.value;
                            this.graphEvaluator.evaluateGraph();
                            return true;
                        }
                        break;
                        
                    case SETTING_TYPES.NUMBER:
                    case SETTING_TYPES.TEXT:
                        if (worldPos.x >= controlX - 30 && worldPos.x <= controlX + 50 &&
                            worldPos.y >= controlY && worldPos.y <= controlY + 30) {
                            const newValue = prompt(`Enter ${setting.type} for ${key}:`, setting.value);
                            if (newValue !== null) {
                                if (setting.type === SETTING_TYPES.NUMBER) {
                                    const num = parseFloat(newValue);
                                    if (!isNaN(num)) {
                                        setting.value = num;
                                        this.graphEvaluator.evaluateGraph();
                                    }
                                } else {
                                    setting.value = newValue;
                                    this.graphEvaluator.evaluateGraph();
                                }
                            }
                            return true;
                        }
                        break;
                }
                index++;
            }
        }
        return false;
    }
}

export default InputHandler;

import { NODE_WIDTH, SETTING_TYPES, GRID_SIZE } from '../constants.js';

class Renderer {
    constructor(canvas, ctx, nodeManager, transformUtils) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.nodeManager = nodeManager;
        this.transformUtils = transformUtils;
        this.lineStartPos = null;
        this.isDraggingOutput = false;
        this.mousePos = { x: 0, y: 0 };
    }

    setMousePos(pos) {
        this.mousePos = pos;
    }

    setLineDrag(isDragging, startPos) {
        this.isDraggingOutput = isDragging;
        this.lineStartPos = startPos;
    }
    
    resize() {
        const container = this.canvas.parentElement;
        const canvasWidth = container.offsetWidth - 500;
        const canvasHeight = window.innerHeight;

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        this.render();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderBG();
        
        this.transformUtils.applyTransform();
        
        
        for (let i = 0; i < this.nodeManager.nodes.length; i++) {
            this.renderNode(this.nodeManager.nodes[i]);
        }

        if (this.isDraggingOutput) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.lineStartPos.x, this.lineStartPos.y);
            let worldMouse = this.transformUtils.screenToWorld(this.mousePos);
            this.ctx.lineTo(worldMouse.x, worldMouse.y);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        this.renderConnections();

        this.transformUtils.restoreTransform();
    }

    renderBG() {
        this.ctx.fillStyle = "#101010";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fill();

        this.ctx.strokeStyle = "#202020";

        for (let i = 0; i < this.canvas.width / GRID_SIZE; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * GRID_SIZE, 0);
            this.ctx.lineTo(i * GRID_SIZE, this.canvas.height);
            this.ctx.stroke();
        }

        for (let i = 0; i < this.canvas.height / GRID_SIZE; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * GRID_SIZE);
            this.ctx.lineTo(this.canvas.width, i * GRID_SIZE);
            this.ctx.stroke();
        }
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.arcTo(x + width, y, x + width, y + height, radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.arcTo(x, y + height, x, y + height - radius, radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.arcTo(x, y, x + radius, y, radius);
        this.ctx.closePath();
        this.ctx.fill();
    }

    renderInput(node, input, index) {
        let x = node.renderData.x;
        let y = node.renderData.y + 50 + (50 * index);
        let radius = 10;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fill();

        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(input.name, node.renderData.x + 20, y + 5);
    }

    renderOutput(node, output, index) {
        let x = node.renderData.x + NODE_WIDTH;
        let y = node.renderData.y + 50 + (50 * index);
        let radius = 10;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.fill();

        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#ffffff';

        let textMetrics = this.ctx.measureText(output.name);
        let textWidth = textMetrics.width;

        this.ctx.fillText(output.name, node.renderData.x + NODE_WIDTH - textWidth - 20, y + 5);
    }

    renderConnections() {
        for (const node of this.nodeManager.nodes) {
            if (!node.connections || node.connections.length === 0) continue;
            
            for (const conn of node.connections) {
                if (!conn.outputNode || !conn.inputNode) continue;
                
                const ox = conn.outputNode.renderData.x + NODE_WIDTH;
                const oy = conn.outputNode.renderData.y + 50 + (50 * conn.output);
                
                const ix = conn.inputNode.renderData.x;
                const iy = conn.inputNode.renderData.y + 50 + (50 * conn.input);
                
                this.ctx.beginPath();
                this.ctx.moveTo(ox, oy);
                this.ctx.lineTo(ix, iy);
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }
    }

    renderSetting(node, settingName, setting, index) {
        let x = node.renderData.x;
        let y = node.renderData.y + 50 + (50 * index);

        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#ffffff';
        
        this.ctx.fillText(settingName, x + 20, y + 5);
        
        const controlX = x + NODE_WIDTH - 60;
        const controlY = y - 15;
        
        this.ctx.fillStyle = '#333333';
        
        switch (setting.type) {
            case SETTING_TYPES.CHECKBOX:
                this.drawRoundedRect(controlX, controlY, 30, 30, 5);
                if (setting.value) {
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(controlX + 5, controlY + 15);
                    this.ctx.lineTo(controlX + 12, controlY + 22);
                    this.ctx.lineTo(controlX + 25, controlY + 8);
                    this.ctx.stroke();
                }
                break;
                
            case SETTING_TYPES.NUMBER:
            case SETTING_TYPES.TEXT:
                this.drawRoundedRect(controlX - 30, controlY, 80, 30, 5);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '16px monospace';
                this.ctx.fillText(setting.value.toString(), controlX - 25, controlY + 20);
                break;
        }
    }

    renderNode(node) {
        const ioPorts = Math.max(node.inputs.length, node.outputs.length);
        this.ctx.fillStyle = "#252525";
        
        const nodeHeight = this.nodeManager.calcNodeHeight(node) + 50;
        this.drawRoundedRect(node.renderData.x, node.renderData.y, NODE_WIDTH, nodeHeight, 10);
        
        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#ffffff';

        let textMetrics = this.ctx.measureText(node.name);
        let textWidth = textMetrics.width;

        let centerX = node.renderData.x + (NODE_WIDTH - textWidth) / 2;
        this.ctx.fillText(node.name, centerX, node.renderData.y + 25);

        for (let i = 0; i < node.inputs.length; i++) {
            this.renderInput(node, node.inputs[i], i);
        }

        for (let i = 0; i < node.outputs.length; i++) {
            this.renderOutput(node, node.outputs[i], i);
        }

        if (node.settings !== undefined) {
            let index = 0;
            for (const key in node.settings) {
                if (Object.prototype.hasOwnProperty.call(node.settings, key)) {
                    this.renderSetting(node, key, node.settings[key], ioPorts + index);
                    index++;
                }
            }
        }
    }
}

export default Renderer;
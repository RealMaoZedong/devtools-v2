import NodeManager from './core/NodeManager.js';
import GraphEvaluator from './core/GraphEvaluator.js';
import Renderer from './ui/Renderer.js';
import InputHandler from './ui/InputHandler.js';
import NodeMenu from './ui/NodeMenu.js';
import TransformUtils from './utils/TransformUtils.js';
import Loader from './nodes/nodeLoader.js'
class NodeEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodeMenu = document.getElementById('node-menu');
        Loader();

        this.nodeManager = new NodeManager(window.allUseableNodes || {});
        this.transformUtils = new TransformUtils(this.ctx);
        this.renderer = new Renderer(this.canvas, this.ctx, this.nodeManager, this.transformUtils);
        this.graphEvaluator = new GraphEvaluator(this.nodeManager);
        this.nodeMenuHandler = new NodeMenu(this.nodeMenu, this.nodeManager, this.graphEvaluator, this.renderer, this.transformUtils);
        this.inputHandler = new InputHandler(
            this.canvas, 
            this.nodeManager, 
            this.transformUtils, 
            this.renderer, 
            this.nodeMenuHandler, 
            this.graphEvaluator
        );
        
        this.initialize();
    }

    
    initialize() {
        this.nodeManager.addNode("Input", 100, 200);
        this.nodeManager.addNode("Output", 700, 200);
        
        this.transformUtils.addTransformListener(this.nodeMenuHandler);
        
        document.addEventListener('click', (e) => {
            const menu = this.nodeMenu;
            const canvas = this.canvas;
            
            if (menu.style.display === 'block' && 
                !menu.contains(e.target) && 
                e.target !== canvas) {
                menu.style.display = 'none';
            }
        });
        
        window.addEventListener('resize', this.onResize.bind(this), false);
        document.getElementById('input').addEventListener('input', this.onInputChange.bind(this));
        
        window.onload = () => {
            document.getElementById('input').value = '"Hello, world!"';
            document.getElementById('output').value = 'Output not connected';
            this.renderer.resize();
        };
    }
    
    onResize() {
        this.renderer.resize();
    }
    
    async onInputChange() {
        await this.graphEvaluator.evaluateGraph();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NodeEditor();
});

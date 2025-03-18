class NodeMenu {
    constructor(nodeMenuElement, nodeManager, graphEvaluator, renderer, transformUtils) {
        this.nodeMenu = nodeMenuElement;
        this.nodeManager = nodeManager;
        this.graphEvaluator = graphEvaluator;
        this.renderer = renderer;
        this.transformUtils = transformUtils;
        
        this.activeSourceNode = null;
        this.activeOutputIndex = null;
        this.menuWorldPos = null;
        
        this.boundCloseMenu = this.closeMenu.bind(this);
    }

    async showMenu(worldX, worldY, sourceNode, outputIndex, allUseableNodes, NODE_CATEGORIES) {
        this.menuWorldPos = { x: worldX, y: worldY };
        this.activeSourceNode = sourceNode;
        this.activeOutputIndex = outputIndex;
        
        this.nodeMenu.innerHTML = '';
        
        this.updateMenuPosition();
        
        for (const [category, nodeTypes] of Object.entries(NODE_CATEGORIES)) {
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'menu-category';
            
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category;
            categoryContainer.appendChild(categoryHeader);

            nodeTypes.forEach(nodeName => {
                if (allUseableNodes[nodeName] && nodeName !== 'Input' && nodeName !== 'Output') {
                    const item = document.createElement('div');
                    item.className = 'menu-item';
                    item.textContent = nodeName;
                    
                    item.onclick = async (e) => {
                        e.stopPropagation();
                        
                        const newNode = this.nodeManager.addNode(nodeName, this.menuWorldPos.x, this.menuWorldPos.y);
                        
                        if (newNode.inputs.length > 0) {
                            this.nodeManager.addConnection(
                                this.activeSourceNode, 
                                this.activeOutputIndex, 
                                newNode, 
                                0
                            );
                            await this.graphEvaluator.evaluateGraph();
                        }
                        
                        this.hideMenu();
                        this.renderer.render();
                    };
                    categoryContainer.appendChild(item);
                }
            });
            
            if (categoryContainer.children.length > 1) {
                this.nodeMenu.appendChild(categoryContainer);
            }
        }

        document.removeEventListener('click', this.boundCloseMenu);
        
        this.nodeMenu.style.display = 'block';
        this.nodeMenu.style.zIndex = '1000';
        
        requestAnimationFrame(() => {
            document.addEventListener('click', this.boundCloseMenu);
        });
    }

    updateMenuPosition() {
        if (!this.menuWorldPos) return;

        const canvas = this.nodeMenu.ownerDocument.querySelector('canvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        const canvasPos = this.transformUtils.worldToScreen(this.menuWorldPos);
        const pageX = canvasRect.left + canvasPos.x;
        const pageY = canvasRect.top + canvasPos.y;
        
        this.nodeMenu.style.position = 'fixed';
        this.nodeMenu.style.left = `${pageX}px`;
        this.nodeMenu.style.top = `${pageY}px`;
    }

    hideMenu() {
        this.nodeMenu.style.display = 'none';
        document.removeEventListener('click', this.boundCloseMenu);
        this.activeSourceNode = null;
        this.activeOutputIndex = null;
        this.menuWorldPos = null;
    }

    closeMenu(e) {
        if (!this.nodeMenu.contains(e.target)) {
            this.hideMenu();
        }
    }

    isVisible() {
        return this.nodeMenu.style.display === 'block';
    }
}

export default NodeMenu;

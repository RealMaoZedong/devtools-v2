class TransformUtils {
    constructor(ctx) {
        this.ctx = ctx;
        this.offset = { x: 0, y: 0 };
        this.scale = 1;
        this.transformListeners = [];
    }

    addTransformListener(listener) {
        this.transformListeners.push(listener);
    }

    notifyTransformChanged() {
        this.transformListeners.forEach(listener => {
            if (typeof listener.updateMenuPosition === 'function') {
                listener.updateMenuPosition();
            }
        });
    }

    applyTransform() {
        this.ctx.save();
        this.ctx.translate(this.offset.x, this.offset.y);
        this.ctx.scale(this.scale, this.scale);
    }

    restoreTransform() {
        this.ctx.restore();
    }

    screenToWorld(screenPoint) {
        return {
            x: (screenPoint.x - this.offset.x) / this.scale,
            y: (screenPoint.y - this.offset.y) / this.scale
        };
    }

    worldToScreen(worldPoint) {
        return {
            x: worldPoint.x * this.scale + this.offset.x,
            y: worldPoint.y * this.scale + this.offset.y
        };
    }

    handleZoom(deltaY, mousePos) {
        const mousePosBeforeZoom = this.screenToWorld(mousePos);
        
        const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
        this.scale *= zoomFactor;
        
        this.scale = Math.min(Math.max(this.scale, 0.1), 5);
        
        const mousePosAfterZoom = this.screenToWorld(mousePos);
        this.offset.x += (mousePosAfterZoom.x - mousePosBeforeZoom.x) * this.scale;
        this.offset.y += (mousePosAfterZoom.y - mousePosBeforeZoom.y) * this.scale;

        this.notifyTransformChanged();
    }

    pan(movementX, movementY) {
        this.offset.x += movementX;
        this.offset.y += movementY;
        
        this.notifyTransformChanged();
    }
}

export default TransformUtils;

// Interactive background particle animation

class ParticleAnimation {
    constructor(options = {}) {
        this.options = {
            selector: options.selector || 'body',
            quantity: options.quantity || 30,
            staticity: options.staticity || 50, 
            ease: options.ease || 50,
            color: options.color || 'rgba(255, 255, 255, 1)'
        };
        
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;
        this.circles = [];
        this.mouse = { x: 0, y: 0 };
        this.canvasSize = { w: 0, h: 0 };
        this.animationFrame = null;
        
        // Extract RGB components from color string
        if (this.options.color.startsWith('#')) {
            const r = parseInt(this.options.color.substring(1, 3), 16);
            const g = parseInt(this.options.color.substring(3, 5), 16);
            const b = parseInt(this.options.color.substring(5, 7), 16);
            this.colorRGB = `${r}, ${g}, ${b}`;
        } else {
            this.colorRGB = '255, 255, 255';
        }
        
        this.init();
    }
    
    init() {
        // Create container div for canvas with better z-index
        const container = document.createElement('div');
        container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none;';
        
        // Add canvas to container
        this.canvas.style.cssText = 'display: block; width: 100%; height: 100%;';
        container.appendChild(this.canvas);
        
        // Add container to DOM as the first child of body
        document.body.prepend(container);
        
        // Setup event listeners
        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        this.resize();
        this.animate();
        
        // console.log('Particle animation initialized with', this.options.quantity, 'particles');
    }
    
    resize() {
        this.circles = [];
        this.canvasSize.w = window.innerWidth;
        this.canvasSize.h = window.innerHeight;
        this.canvas.width = this.canvasSize.w * this.dpr;
        this.canvas.height = this.canvasSize.h * this.dpr;
        this.canvas.style.width = `${this.canvasSize.w}px`;
        this.canvas.style.height = `${this.canvasSize.h}px`;
        this.context.scale(this.dpr, this.dpr);
        this.drawParticles();
        
        // console.log('Canvas resized to', this.canvasSize.w, 'x', this.canvasSize.h);
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.canvasSize.w / 2;
        const y = e.clientY - rect.top - this.canvasSize.h / 2;
        const inside = Math.abs(x) < this.canvasSize.w / 2 && Math.abs(y) < this.canvasSize.h / 2;
        if (inside) {
            this.mouse.x = x;
            this.mouse.y = y;
        }
    }
    
    circleParams() {
        const x = Math.floor(Math.random() * this.canvasSize.w);
        const y = Math.floor(Math.random() * this.canvasSize.h);
        const translateX = 0;
        const translateY = 0;
        // Larger size for better visibility
        const size = Math.floor(Math.random() * 3) + 1;
        const alpha = 0;
        // Higher target alpha for better visibility
        const targetAlpha = parseFloat((Math.random() * 0.8 + 0.2).toFixed(1));
        const dx = (Math.random() - 0.5) * 0.2;
        const dy = (Math.random() - 0.5) * 0.2;
        const magnetism = 0.1 + Math.random() * 4;
        
        return {
            x, y, translateX, translateY, size, alpha, targetAlpha, dx, dy, magnetism
        };
    }
    
    drawCircle(circle, update = false) {
        const { x, y, translateX, translateY, size, alpha } = circle;
        this.context.translate(translateX, translateY);
        this.context.beginPath();
        this.context.arc(x, y, size, 0, 2 * Math.PI);
        
        // Use the color option if provided
        if (this.options.color) {
            if (this.options.color.startsWith('#')) {
                const r = parseInt(this.options.color.slice(1, 3), 16);
                const g = parseInt(this.options.color.slice(3, 5), 16);
                const b = parseInt(this.options.color.slice(5, 7), 16);
                this.context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            } else {
                this.context.fillStyle = this.options.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            }
        } else {
            this.context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        }
        
        this.context.fill();
        this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        
        if (!update) {
            this.circles.push(circle);
        }
    }
    
    clearContext() {
        this.context.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
    }
    
    drawParticles() {
        this.clearContext();
        const particleCount = this.options.quantity;
        for (let i = 0; i < particleCount; i++) {
            const circle = this.circleParams();
            this.drawCircle(circle);
        }
    }
    
    remapValue(value, start1, end1, start2, end2) {
        const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
        return remapped > 0 ? remapped : 0;
    }
    
    animate() {
        this.clearContext();
        
        for (let i = 0; i < this.circles.length; i++) {
            const circle = this.circles[i];
            
            // Handle the alpha value
            const edge = [
                circle.x + circle.translateX - circle.size, // distance from left edge
                this.canvasSize.w - circle.x - circle.translateX - circle.size, // distance from right edge
                circle.y + circle.translateY - circle.size, // distance from top edge
                this.canvasSize.h - circle.y - circle.translateY - circle.size, // distance from bottom edge
            ];
            
            const closestEdge = edge.reduce((a, b) => Math.min(a, b));
            const remapClosestEdge = parseFloat(this.remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));
            
            if (remapClosestEdge > 1) {
                circle.alpha += 0.02;
                if (circle.alpha > circle.targetAlpha) {
                    circle.alpha = circle.targetAlpha;
                }
            } else {
                circle.alpha = circle.targetAlpha * remapClosestEdge;
            }
            
            circle.x += circle.dx;
            circle.y += circle.dy;
            circle.translateX += ((this.mouse.x / (this.options.staticity / circle.magnetism)) - circle.translateX) / this.options.ease;
            circle.translateY += ((this.mouse.y / (this.options.staticity / circle.magnetism)) - circle.translateY) / this.options.ease;
            
            // If circle gets out of the canvas
            if (
                circle.x < -circle.size ||
                circle.x > this.canvasSize.w + circle.size ||
                circle.y < -circle.size ||
                circle.y > this.canvasSize.h + circle.size
            ) {
                // Remove the circle from the array
                this.circles.splice(i, 1);
                // Create a new circle
                const newCircle = this.circleParams();
                this.drawCircle(newCircle);
            } else {
                // Update the circle position
                this.drawCircle(
                    {
                        ...circle,
                        x: circle.x,
                        y: circle.y,
                        translateX: circle.translateX,
                        translateY: circle.translateY,
                        alpha: circle.alpha,
                    },
                    true
                );
            }
        }
        
        this.animationFrame = window.requestAnimationFrame(this.animate.bind(this));
    }
    
    // Method to dynamically update particle count
    setParticleCount(count) {
        const difference = count - this.circles.length;
        
        if (difference > 0) {
            // Add more particles
            for (let i = 0; i < difference; i++) {
                const circle = this.circleParams();
                this.drawCircle(circle);
            }
        } else if (difference < 0) {
            // Remove excess particles
            this.circles = this.circles.slice(0, count);
        }
        
        this.options.quantity = count;
        // console.log('Particle count updated to', count);
    }
    
    destroy() {
        window.cancelAnimationFrame(this.animationFrame);
        window.removeEventListener('resize', this.resize);
        window.removeEventListener('mousemove', this.onMouseMove);
        this.canvas.parentNode.remove();
    }
}

// Add initialization function for convenience
function initParticles(options = {}) {
    try {
        return new ParticleAnimation(options);
    } catch (e) {
        console.warn("Particles initialization failed:", e);
        return null;
    }
}
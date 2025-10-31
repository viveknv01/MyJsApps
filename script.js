// Smooth navigation to projects
function navigateToProject(projectPath) {
    // Add a smooth transition effect
    console.log('Navigating to:', projectPath);
    document.body.style.opacity = '0.8';
    document.body.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        window.location.href = projectPath;
    }, 200);
}

// Add hover sound effect (optional)
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Add click animation to cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function() {
        const project = this.dataset.project;
        let projectPath;
        
        if (project === 'otp-rem') {
            projectPath = 'OTP-Rem/index.html';
        } else if (project === 'just-calc') {
            projectPath = 'Just-Calc_v1/index.html';
        } else if (project === 'memory-game') {
            projectPath = 'Mobile-Memory-Game/index.html';
        }
        
        if (projectPath) {
            navigateToProject(projectPath);
        }
    });
});

// Smooth scroll and parallax effect for floating shapes
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.1);
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Animated Cat Logic
class WalkingCat {
    constructor() {
        this.cat = document.getElementById('animatedCat');
        this.x = Math.random() * (window.innerWidth - 60);
        this.y = Math.random() * (window.innerHeight - 60);
        this.targetX = this.x;
        this.targetY = this.y;
        this.speed = 0.5;
        this.isWalking = false;
        this.currentState = 'sitting'; // sitting, walking, sleeping
        this.stateTimer = 0;
        this.colors = ['', 'cat-orange', 'cat-gray', 'cat-black', 'cat-white', 'cat-brown', 'cat-purple', 'cat-blue', 'cat-green'];
        this.currentColorIndex = Math.floor(Math.random() * this.colors.length);
        this.currentColor = this.colors[this.currentColorIndex];
        this.isVisible = true;
        this.lastClickTime = 0;
        
        // Drag functionality
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.wasWalkingBeforeDrag = false;
        
        this.init();
        this.setupDragHandlers();
        this.setupToggleHandler();
        this.setupDoubleClickHandler();
        this.startBehavior();
    }

    init() {
        this.cat.style.left = this.x + 'px';
        this.cat.style.top = this.y + 'px';
        this.cat.classList.add(this.currentColor);
        this.updateCatDirection();
    }

    setupDragHandlers() {
        // Mouse events
        this.cat.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());

        // Touch events for mobile
        this.cat.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]), { passive: false });
        document.addEventListener('touchmove', (e) => this.drag(e.touches[0]), { passive: false });
        document.addEventListener('touchend', () => this.endDrag());
    }

    setupDoubleClickHandler() {
        this.cat.addEventListener('dblclick', (e) => {
            e.preventDefault();
            this.changeColor();
        });

        // Prevent text selection on double click
        this.cat.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
    }

    changeColor() {
        if (!this.isVisible) return;
        
        // Remove current color class
        this.cat.classList.remove(this.currentColor);
        
        // Move to next color
        this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
        this.currentColor = this.colors[this.currentColorIndex];
        
        // Add color change animation
        this.cat.classList.add('color-changing');
        
        // Add new color class after a short delay for effect
        setTimeout(() => {
            this.cat.classList.add(this.currentColor);
        }, 100);
        
        // Remove animation class
        setTimeout(() => {
            this.cat.classList.remove('color-changing');
        }, 500);
        
        // Create sparkle effect
        this.createSparkleEffect();
        
        // Save color preference
        localStorage.setItem('catColor', this.currentColorIndex);
    }

    createSparkleEffect() {
        const sparkles = ['✨', '⭐', '💫', '🌟'];
        const catRect = this.cat.getBoundingClientRect();
        
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.innerHTML = sparkles[Math.floor(Math.random() * sparkles.length)];
                sparkle.style.position = 'fixed';
                sparkle.style.left = (catRect.left + Math.random() * catRect.width) + 'px';
                sparkle.style.top = (catRect.top + Math.random() * catRect.height) + 'px';
                sparkle.style.fontSize = '16px';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.zIndex = '1001';
                sparkle.style.animation = 'sparkleUp 1.5s ease-out forwards';
                document.body.appendChild(sparkle);
                
                // Add sparkle animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes sparkleUp {
                        0% { opacity: 1; transform: translateY(0) scale(0.5); }
                        50% { opacity: 1; transform: translateY(-30px) scale(1); }
                        100% { opacity: 0; transform: translateY(-50px) scale(0.5); }
                    }
                `;
                document.head.appendChild(style);
                
                setTimeout(() => {
                    sparkle.remove();
                    style.remove();
                }, 1500);
            }, i * 100);
        }
    }

    setupToggleHandler() {
        const toggleBtn = document.getElementById('catToggle');
        const toggleText = toggleBtn.querySelector('.toggle-text');
        
        toggleBtn.addEventListener('click', () => {
            this.isVisible = !this.isVisible;
            
            if (this.isVisible) {
                this.cat.classList.remove('hidden');
                this.cat.classList.add('visible');
                toggleBtn.classList.remove('cat-hidden');
                toggleText.textContent = 'Hide Cat';
            } else {
                this.cat.classList.remove('visible');
                this.cat.classList.add('hidden');
                toggleBtn.classList.add('cat-hidden');
                toggleText.textContent = 'Show Cat';
                
                // Stop dragging if currently dragging
                if (this.isDragging) {
                    this.endDrag();
                }
            }
            
            // Save preference
            localStorage.setItem('catVisible', this.isVisible);
        });
        
        // Load saved preferences
        const savedVisibility = localStorage.getItem('catVisible');
        if (savedVisibility !== null) {
            this.isVisible = savedVisibility === 'true';
            if (!this.isVisible) {
                this.cat.classList.remove('visible');
                this.cat.classList.add('hidden');
                toggleBtn.classList.add('cat-hidden');
                toggleText.textContent = 'Show Cat';
            }
        }
        
        // Load saved color
        const savedColor = localStorage.getItem('catColor');
        if (savedColor !== null) {
            this.cat.classList.remove(this.currentColor);
            this.currentColorIndex = parseInt(savedColor);
            this.currentColor = this.colors[this.currentColorIndex];
            this.cat.classList.add(this.currentColor);
        }
    }

    startDrag(e) {
        if (!this.isVisible) return; // Don't allow dragging if cat is hidden
        
        e.preventDefault();
        this.isDragging = true;
        this.wasWalkingBeforeDrag = this.currentState === 'walking';
        
        // Calculate offset from mouse to cat position
        this.dragOffset.x = e.clientX - this.x;
        this.dragOffset.y = e.clientY - this.y;
        
        // Add dragging class and set cat to sitting
        this.cat.classList.add('dragging');
        this.setState('sitting');
        
        // Stop automatic behavior while dragging
        this.stateTimer = 0;
    }

    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        // Calculate new position
        const newX = e.clientX - this.dragOffset.x;
        const newY = e.clientY - this.dragOffset.y;
        
        // Keep cat within screen bounds
        this.x = Math.max(0, Math.min(window.innerWidth - 60, newX));
        this.y = Math.max(0, Math.min(window.innerHeight - 60, newY));
        
        // Update cat position
        this.cat.style.left = this.x + 'px';
        this.cat.style.top = this.y + 'px';
        
        // Update target position to current position
        this.targetX = this.x;
        this.targetY = this.y;
    }

    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.cat.classList.remove('dragging');
        
        // Resume behavior after a short delay
        setTimeout(() => {
            if (this.wasWalkingBeforeDrag) {
                this.setState('walking');
            } else {
                // Random behavior after being moved
                const behaviors = ['sitting', 'walking', 'sleeping'];
                this.setState(behaviors[Math.floor(Math.random() * behaviors.length)]);
            }
        }, 1000);
    }

    setNewTarget() {
        const margin = 100;
        this.targetX = margin + Math.random() * (window.innerWidth - 2 * margin - 60);
        this.targetY = margin + Math.random() * (window.innerHeight - 2 * margin - 60);
    }

    updateCatDirection() {
        if (this.targetX > this.x) {
            this.cat.className = `cat-container cat-walking-right ${this.currentColor} visible`;
        } else {
            this.cat.className = `cat-container cat-walking-left ${this.currentColor} visible`;
        }
    }

    setState(state) {
        this.currentState = state;
        this.cat.classList.remove('cat-sitting', 'cat-sleeping');
        
        if (state === 'sitting') {
            this.cat.classList.add('cat-sitting');
            this.stateTimer = 2000 + Math.random() * 3000; // 2-5 seconds
        } else if (state === 'sleeping') {
            this.cat.classList.add('cat-sleeping');
            this.stateTimer = 3000 + Math.random() * 5000; // 3-8 seconds
        } else if (state === 'walking') {
            this.setNewTarget();
            this.updateCatDirection();
            this.stateTimer = 3000 + Math.random() * 4000; // 3-7 seconds
        }
    }

    update() {
        // Don't update position if being dragged or if cat is hidden
        if (this.isDragging || !this.isVisible) return;
        
        if (this.currentState === 'walking') {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 2) {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
                
                this.cat.style.left = this.x + 'px';
                this.cat.style.top = this.y + 'px';
            } else {
                // Reached target, decide next behavior
                const rand = Math.random();
                if (rand < 0.4) {
                    this.setState('sitting');
                } else if (rand < 0.6) {
                    this.setState('sleeping');
                } else {
                    this.setState('walking');
                }
            }
        }

        // Update state timer
        this.stateTimer -= 16; // Assuming 60fps
        if (this.stateTimer <= 0) {
            const rand = Math.random();
            if (this.currentState === 'sitting') {
                if (rand < 0.7) {
                    this.setState('walking');
                } else {
                    this.setState('sleeping');
                }
            } else if (this.currentState === 'sleeping') {
                if (rand < 0.8) {
                    this.setState('walking');
                } else {
                    this.setState('sitting');
                }
            } else {
                if (rand < 0.5) {
                    this.setState('sitting');
                } else if (rand < 0.7) {
                    this.setState('walking');
                } else {
                    this.setState('sleeping');
                }
            }
        }
    }

    startBehavior() {
        // Start with a random behavior
        const behaviors = ['sitting', 'walking', 'sleeping'];
        this.setState(behaviors[Math.floor(Math.random() * behaviors.length)]);
        
        // Update loop
        const animate = () => {
            this.update();
            requestAnimationFrame(animate);
        };
        animate();
    }

    // Handle window resize
    handleResize() {
        const newWidth = window.innerWidth - 60;
        const newHeight = window.innerHeight - 60;
        
        if (this.x > newWidth) this.x = newWidth;
        if (this.y > newHeight) this.y = newHeight;
        if (this.targetX > newWidth) this.targetX = newWidth;
        if (this.targetY > newHeight) this.targetY = newHeight;
        
        this.cat.style.left = this.x + 'px';
        this.cat.style.top = this.y + 'px';
    }
}

// Initialize cat when page loads
let walkingCat;
window.addEventListener('load', () => {
    // Wait a bit for the page to settle
    setTimeout(() => {
        walkingCat = new WalkingCat();
    }, 1000);
});

// Handle window resize
window.addEventListener('resize', () => {
    if (walkingCat) {
        walkingCat.handleResize();
    }
});

// Cat interaction - click to pet the cat (only if not dragging)
let clickTimeout;
document.addEventListener('mousedown', (e) => {
    if (e.target.closest('#animatedCat')) {
        // Set a timeout to distinguish between click and drag
        clickTimeout = setTimeout(() => {
            // This is a click, not a drag
            if (walkingCat && !walkingCat.isDragging) {
                petCat(e);
            }
        }, 200);
    }
});

document.addEventListener('mousemove', () => {
    // Clear click timeout if mouse moves (indicates drag)
    if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
    }
});

document.addEventListener('mouseup', () => {
    // Clear click timeout
    if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
    }
});

function petCat(e) {
    // Only allow petting if cat is visible
    if (!walkingCat.isVisible) return;
    
    // Cat purr effect
    walkingCat.setState('sitting');
    walkingCat.cat.style.transform = 'scale(1.1)';
    
    // Create heart effect
    const heart = document.createElement('div');
    heart.innerHTML = '💖';
    heart.style.position = 'fixed';
    heart.style.left = e.clientX + 'px';
    heart.style.top = e.clientY + 'px';
    heart.style.fontSize = '20px';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '1001';
    heart.style.animation = 'floatUp 2s ease-out forwards';
    document.body.appendChild(heart);
    
    // Add float up animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-50px); }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        walkingCat.cat.style.transform = '';
        heart.remove();
        style.remove();
    }, 2000);
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === '1') {
        navigateToProject('OTP-Rem/index.html');
    } else if (e.key === '2') {
        navigateToProject('Just-Calc_v1/index.html');
    } else if (e.key === '3') {
        navigateToProject('Mobile-Memory-Game/index.html');
    } else if (e.key === 'c' || e.key === 'C') {
        // Press 'C' to change cat color
        if (walkingCat) {
            walkingCat.changeColor();
        }
    }
});

// Add touch gestures for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        // Add subtle animation feedback for swipe
        document.body.style.transform = `translateY(${diff > 0 ? -5 : 5}px)`;
        setTimeout(() => {
            document.body.style.transform = 'translateY(0)';
        }, 200);
    }
}
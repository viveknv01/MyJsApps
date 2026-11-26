function navigateToProject(projectPath) {
    document.body.style.opacity = '0.8';
    document.body.style.transform = 'scale(0.95)';

    setTimeout(() => {
        window.location.href = projectPath;
    }, 200);
}

document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function (e) {
        if (e.target.closest('a.project-btn')) return;

        const project = this.dataset.project;
        let projectPath;

        if (project === 'otp-rem') {
            projectPath = 'OTP-Rem/index.html';
        } else if (project === 'just-calc') {
            projectPath = 'Just-Calc_v1/index.html';
        } else if (project === 'memory-game') {
            projectPath = 'Mobile-Memory-Game/index.html';
        } else if (project === 'task-list') {
            projectPath = 'Task-List/index.html';
        }

        if (projectPath) {
            navigateToProject(projectPath);
        }
    });
});

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.shape');

    shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.1);
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

document.addEventListener('keydown', (e) => {
    if (e.key === '1') {
        navigateToProject('OTP-Rem/index.html');
    } else if (e.key === '2') {
        navigateToProject('Just-Calc_v1/index.html');
    } else if (e.key === '3') {
        navigateToProject('Mobile-Memory-Game/index.html');
    } else if (e.key === '4') {
        navigateToProject('Task-List/index.html');
    }
});

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
        document.body.style.transform = `translateY(${diff > 0 ? -5 : 5}px)`;
        setTimeout(() => {
            document.body.style.transform = 'translateY(0)';
        }, 200);
    }
}

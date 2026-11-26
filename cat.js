(function () {
    'use strict';
    window.nvCatPlugin = true;

    var CAT_W = 96;
    var CAT_H = 72;
    var DRAG_PX = 6;
    var COATS = ['cat-tabby', 'cat-gray', 'cat-tuxedo', 'cat-cream', 'cat-purple', 'cat-blue', 'cat-green'];

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    function NvCat(root, toggle) {
        this.root = root;
        this.toggle = toggle;
        this.head = root.querySelector('.cat-head');
        this.pupils = root.querySelectorAll('.cat-pupil');
        this.x = 24;
        this.y = 0;
        this.targetX = 24;
        this.targetY = 0;
        this.floorY = 0;
        this.speed = 55;
        this.state = 'sitting';
        this.stateMs = 0;
        this.facing = 1;
        this.coats = COATS;
        this.coatIndex = 0;
        this.visible = true;
        this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.pointer = { x: 0, y: 0 };
        this.pending = false;
        this.dragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.dragOffset = { x: 0, y: 0 };
        this.startleCool = 0;
        this.perchUntil = 0;
        this.last = 0;
        this.init();
    }

    NvCat.prototype.floor = function () {
        return window.innerHeight - CAT_H - 10;
    };

    NvCat.prototype.maxX = function () {
        return Math.max(0, window.innerWidth - CAT_W);
    };

    NvCat.prototype.applyPos = function () {
        this.root.style.left = this.x + 'px';
        this.root.style.top = this.y + 'px';
    };

    NvCat.prototype.setFacing = function (dir) {
        this.facing = dir < 0 ? -1 : 1;
        this.root.classList.toggle('cat-facing-left', this.facing < 0);
        this.root.classList.toggle('cat-facing-right', this.facing > 0);
    };

    NvCat.prototype.setCoat = function (index, sparkle) {
        var prev = this.coats[this.coatIndex];
        this.coatIndex = ((index % this.coats.length) + this.coats.length) % this.coats.length;
        this.root.classList.remove(prev);
        this.root.classList.add(this.coats[this.coatIndex]);
        try { localStorage.setItem('catColor', String(this.coatIndex)); } catch (e) {}
        if (sparkle) {
            var self = this;
            this.root.classList.add('color-changing');
            setTimeout(function () { self.root.classList.remove('color-changing'); }, 400);
        }
    };

    NvCat.prototype.setVisible = function (on) {
        this.visible = on;
        this.root.classList.toggle('visible', on);
        this.root.classList.toggle('hidden', !on);
        if (this.toggle) {
            this.toggle.classList.toggle('cat-hidden', !on);
            var text = this.toggle.querySelector('.toggle-text');
            if (text) text.textContent = on ? 'Hide Cat' : 'Show Cat';
            this.toggle.setAttribute('aria-label', on ? 'Hide cat' : 'Show cat');
        }
        try { localStorage.setItem('catVisible', String(on)); } catch (e) {}
        if (!on && this.dragging) this.endPointer();
    };

    NvCat.prototype.setState = function (state) {
        this.state = state;
        this.root.classList.remove('cat-walking', 'cat-sitting', 'cat-sleeping');
        if (state === 'walking') {
            this.root.classList.add('cat-walking');
            this.stateMs = 2800 + Math.random() * 4200;
        } else if (state === 'sleeping') {
            this.root.classList.add('cat-sleeping');
            this.stateMs = 4000 + Math.random() * 5000;
        } else {
            this.root.classList.add('cat-sitting');
            this.stateMs = 2500 + Math.random() * 4000;
        }
    };

    NvCat.prototype.pickWalkTarget = function () {
        this.floorY = this.floor();
        this.targetY = this.floorY;
        var margin = 40;
        this.targetX = margin + Math.random() * Math.max(1, this.maxX() - margin * 2);
        this.setFacing(this.targetX >= this.x ? 1 : -1);
    };

    NvCat.prototype.cardPerches = function () {
        var list = [];
        var cards = document.querySelectorAll('.project-card');
        for (var i = 0; i < cards.length; i++) {
            var r = cards[i].getBoundingClientRect();
            if (r.width < 80 || r.top < 80) continue;
            list.push({
                x: clamp(r.left + r.width * 0.5 - CAT_W / 2, 0, this.maxX()),
                y: clamp(r.top - CAT_H + 8, 40, this.floor())
            });
        }
        return list;
    };

    NvCat.prototype.maybePerch = function () {
        if (this.reduce || Math.random() > 0.28) return false;
        var spots = this.cardPerches();
        if (!spots.length) return false;
        var spot = spots[Math.floor(Math.random() * spots.length)];
        this.targetX = spot.x;
        this.targetY = spot.y;
        this.setFacing(this.targetX >= this.x ? 1 : -1);
        this.setState('walking');
        this.perchUntil = performance.now() + 6000;
        return true;
    };

    NvCat.prototype.init = function () {
        this.floorY = this.floor();
        this.x = 16 + Math.random() * Math.max(1, this.maxX() * 0.35);
        this.y = this.floorY;
        this.targetX = this.x;
        this.targetY = this.y;
        this.applyPos();

        var savedCoat = null;
        var savedVis = null;
        try {
            savedCoat = localStorage.getItem('catColor');
            savedVis = localStorage.getItem('catVisible');
        } catch (e) {}

        if (savedCoat !== null && !isNaN(parseInt(savedCoat, 10))) {
            this.setCoat(parseInt(savedCoat, 10), false);
        } else {
            this.setCoat(0, false);
        }

        this.setFacing(1);
        this.setState(this.reduce ? 'sitting' : 'walking');
        if (!this.reduce) this.pickWalkTarget();

        if (savedVis === 'false') this.setVisible(false);
        else this.setVisible(true);

        this.bind();
        this.last = performance.now();
        this.tick(this.last);
    };

    NvCat.prototype.bind = function () {
        var self = this;
        this.root.addEventListener('pointerdown', function (e) { self.onDown(e); });
        document.addEventListener('pointermove', function (e) { self.onMove(e); });
        document.addEventListener('pointerup', function () { self.onUp(); });
        document.addEventListener('pointercancel', function () { self.onUp(); });

        this.root.addEventListener('dblclick', function (e) {
            e.preventDefault();
            self.cycleCoat();
        });
        this.root.addEventListener('selectstart', function (e) { e.preventDefault(); });

        if (this.toggle) {
            this.toggle.addEventListener('click', function () {
                self.setVisible(!self.visible);
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'c' || e.key === 'C') {
                if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
                self.cycleCoat();
            }
        });

        window.addEventListener('resize', function () { self.handleResize(); });
    };

    NvCat.prototype.cycleCoat = function () {
        if (!this.visible) return;
        this.setCoat(this.coatIndex + 1, true);
    };

    NvCat.prototype.onDown = function (e) {
        if (!this.visible) return;
        if (e.button !== undefined && e.button !== 0) return;
        e.preventDefault();
        this.pending = true;
        this.dragging = false;
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
        this.dragOffset.x = e.clientX - this.x;
        this.dragOffset.y = e.clientY - this.y;
        try { this.root.setPointerCapture(e.pointerId); } catch (err) {}
    };

    NvCat.prototype.onMove = function (e) {
        this.pointer.x = e.clientX;
        this.pointer.y = e.clientY;
        if (!this.pending && !this.dragging) return;
        var dx = e.clientX - this.dragStart.x;
        var dy = e.clientY - this.dragStart.y;
        if (this.pending && !this.dragging && (dx * dx + dy * dy) > DRAG_PX * DRAG_PX) {
            this.pending = false;
            this.dragging = true;
            this.root.classList.add('dragging');
            this.setState('sitting');
        }
        if (this.dragging) {
            this.x = clamp(e.clientX - this.dragOffset.x, 0, this.maxX());
            this.y = clamp(e.clientY - this.dragOffset.y, 8, this.floor());
            this.targetX = this.x;
            this.targetY = this.y;
            this.applyPos();
        }
    };

    NvCat.prototype.onUp = function () {
        if (this.pending && !this.dragging) this.pet();
        if (this.dragging) this.endPointer();
        this.pending = false;
    };

    NvCat.prototype.endPointer = function () {
        this.dragging = false;
        this.root.classList.remove('dragging');
        this.floorY = this.floor();
        var self = this;
        this.y = this.floorY;
        this.targetY = this.floorY;
        this.applyPos();
        this.setState('sitting');
        setTimeout(function () {
            if (!self.reduce) self.setState('walking');
        }, 700);
    };

    NvCat.prototype.pet = function () {
        if (!this.visible) return;
        this.setState('sitting');
        this.root.classList.add('cat-petting');
        var self = this;
        setTimeout(function () { self.root.classList.remove('cat-petting'); }, 1400);
        var rect = this.root.getBoundingClientRect();
        for (var i = 0; i < 3; i++) {
            (function (n) {
                setTimeout(function () {
                    var heart = document.createElement('div');
                    heart.className = 'nv-cat-heart';
                    heart.textContent = n === 1 ? '💗' : '💖';
                    heart.style.left = (rect.left + 20 + n * 18) + 'px';
                    heart.style.top = (rect.top - 4) + 'px';
                    document.body.appendChild(heart);
                    setTimeout(function () { heart.remove(); }, 1200);
                }, n * 120);
            })(i);
        }
    };

    NvCat.prototype.look = function () {
        var cx = this.x + (this.facing > 0 ? 70 : 26);
        var cy = this.y + 22;
        var dx = this.pointer.x - cx;
        var dy = this.pointer.y - cy;
        var px = clamp(dx / 80, -1, 1) * 2.2;
        var py = clamp(dy / 80, -1, 1) * 2;
        if (this.facing < 0) px = -px;
        for (var i = 0; i < this.pupils.length; i++) {
            this.pupils[i].style.transform = 'translate(' + px + 'px,' + py + 'px)';
        }
        if (this.head && this.state !== 'walking') {
            var tilt = clamp(dx / 140, -1, 1) * 6;
            if (this.facing < 0) tilt = -tilt;
            this.head.style.transform = 'rotate(' + tilt + 'deg)';
        } else if (this.head) {
            this.head.style.transform = '';
        }
    };

    NvCat.prototype.tick = function (now) {
        var self = this;
        var dt = Math.min(0.05, (now - this.last) / 1000);
        this.last = now;
        if (this.visible && !this.dragging) this.update(dt, now);
        requestAnimationFrame(function (t) { self.tick(t); });
    };

    NvCat.prototype.update = function (dt, now) {
        this.look();
        this.startleCool = Math.max(0, this.startleCool - dt);
        this.stateMs -= dt * 1000;

        var distPtr = Math.hypot(this.pointer.x - (this.x + CAT_W / 2), this.pointer.y - (this.y + CAT_H / 2));

        if (!this.reduce && this.startleCool === 0 && distPtr < 36 && this.state !== 'sleeping') {
            this.root.classList.add('cat-startle');
            var self = this;
            setTimeout(function () { self.root.classList.remove('cat-startle'); }, 450);
            this.startleCool = 2.4;
            this.targetX = clamp(this.x + (this.pointer.x > this.x ? -90 : 90), 0, this.maxX());
            this.targetY = this.floor();
            this.y = this.floor();
            this.setFacing(this.targetX >= this.x ? 1 : -1);
            this.setState('walking');
        } else if (!this.reduce && this.state === 'sitting' && distPtr > 70 && distPtr < 170) {
            this.targetX = clamp(this.pointer.x - CAT_W / 2, 0, this.maxX());
            this.targetY = this.floor();
            this.setFacing(this.targetX >= this.x ? 1 : -1);
            this.setState('walking');
        }

        if (this.state === 'walking') {
            var dx = this.targetX - this.x;
            var dy = this.targetY - this.y;
            var dist = Math.hypot(dx, dy);
            if (dist < 2) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.applyPos();
                if (this.perchUntil > now) {
                    this.setState('sitting');
                } else if (Math.random() < 0.35) {
                    this.setState('sleeping');
                } else {
                    this.setState('sitting');
                }
            } else {
                var step = this.speed * dt;
                this.x += (dx / dist) * step;
                this.y += (dy / dist) * step;
                this.setFacing(dx >= 0 ? 1 : -1);
                this.applyPos();
            }
        }

        if (this.stateMs <= 0 && this.state !== 'walking') {
            if (this.reduce) {
                this.setState('sitting');
                return;
            }
            if (this.state === 'sleeping') {
                this.setState(Math.random() < 0.7 ? 'walking' : 'sitting');
                if (this.state === 'walking') this.pickWalkTarget();
            } else if (!this.maybePerch()) {
                if (Math.random() < 0.22) {
                    this.setState('sleeping');
                } else {
                    this.pickWalkTarget();
                    this.setState('walking');
                }
            }
        } else if (this.state === 'walking' && this.stateMs <= 0 && Math.hypot(this.targetX - this.x, this.targetY - this.y) > 4) {
            this.pickWalkTarget();
            this.setState('walking');
        }
    };

    NvCat.prototype.handleResize = function () {
        this.floorY = this.floor();
        this.x = clamp(this.x, 0, this.maxX());
        if (this.state !== 'sitting' || this.y > this.floorY - 4) {
            this.y = this.floorY;
            this.targetY = this.floorY;
        }
        this.applyPos();
    };

    function mount() {
        var root = document.getElementById('animatedCat');
        var toggle = document.getElementById('catToggle');
        if (!root || root.dataset.nvCatMounted) return;
        root.dataset.nvCatMounted = '1';
        window.nvCat = new NvCat(root, toggle);
    }

    mount();
    document.addEventListener('DOMContentLoaded', mount);
    window.addEventListener('load', mount);
})();

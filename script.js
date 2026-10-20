// Hero and Catalyzm Morph Scroll Controller
        function updateScrollZoom() {
            const wrapper = document.getElementById('heroScrollWrapper');
            if (wrapper) {
                const rect = wrapper.getBoundingClientRect();
                const totalScrollable = wrapper.offsetHeight - window.innerHeight;
                if (totalScrollable > 0) {
                    const currentScroll = -rect.top;
                    let progress = currentScroll / totalScrollable;
                    progress = Math.max(0, Math.min(1, progress));

                    const capsule = document.getElementById('capsuleVideo');
                    const leftCol = document.getElementById('heroLeftCol');
                    const rightCol = document.getElementById('heroRightCol');
                    const scrollIndicator = document.getElementById('scrollIndicator');
                    const capsuleFooter = document.getElementById('capsuleFooter');

                    let scaleProgress = 0;
                    let capsuleOpacity = 1;

                    if (progress < 0.22) {
                        scaleProgress = progress / 0.22;
                        capsuleOpacity = 1;
                    } else if (progress <= 0.75) {
                        scaleProgress = 1;
                        capsuleOpacity = 1;
                    } else {
                        const shrinkRatio = (progress - 0.75) / 0.25;
                        scaleProgress = 1 - shrinkRatio;
                        capsuleOpacity = Math.max(0, 1 - shrinkRatio);
                    }

                    const isMobile = window.innerWidth < 768;
                    const startW = isMobile ? 210 : 256;
                    const startH = isMobile ? 340 : 450;
                    const startRadius = isMobile ? 120 : 200;

                    const targetW = window.innerWidth;
                    const targetH = window.innerHeight;

                    const currentW = startW + (targetW - startW) * scaleProgress;
                    const currentH = startH + (targetH - startH) * scaleProgress;
                    const currentRadius = startRadius * (1 - scaleProgress);

                    if (capsule) {
                        capsule.style.width = `${currentW}px`;
                        capsule.style.height = `${currentH}px`;
                        capsule.style.borderRadius = `${currentRadius}px`;
                        capsule.style.opacity = capsuleOpacity;
                        capsule.style.transform = `scale(${0.85 + (scaleProgress * 0.15)})`;
                        capsule.style.pointerEvents = capsuleOpacity < 0.1 ? 'none' : 'auto';
                    }

                    const sideOpacity = Math.max(0, 1 - (progress / 0.18));
                    const leftTranslate = -(progress / 0.18) * 150;
                    const rightTranslate = (progress / 0.18) * 150;

                    if (leftCol) {
                        leftCol.style.opacity = sideOpacity;
                        leftCol.style.transform = `translateX(${leftTranslate}px)`;
                        leftCol.style.pointerEvents = sideOpacity < 0.1 ? 'none' : 'auto';
                    }

                    if (rightCol) {
                        rightCol.style.opacity = sideOpacity;
                        rightCol.style.transform = `translateX(${rightTranslate}px)`;
                        rightCol.style.pointerEvents = sideOpacity < 0.1 ? 'none' : 'auto';
                    }

                    if (scrollIndicator) scrollIndicator.style.opacity = sideOpacity;
                    if (capsuleFooter) capsuleFooter.style.opacity = Math.max(0, 1 - (scaleProgress * 2));
                }
            }

            // Calculate Catalyzm Section Morphing Capsule Scroll Progress
            updateCatalyzmScroll();
        }

        // Morphing Capsule Animation for Catalyzm section
        function updateCatalyzmScroll() {
            const section = document.getElementById('catalyzmSection');
            const capsule = document.getElementById('catalyzmCapsule');
            const content = document.getElementById('catalyzmContent');
            if (!section || !capsule) return;

            const rect = section.getBoundingClientRect();
            const windowH = window.innerHeight;
            const windowW = window.innerWidth;

            // Calculate entrance ratio (0 when entering bottom, 1 when centered/fully scrolled)
            let progress = (windowH - rect.top) / (windowH * 0.85);
            progress = Math.max(0, Math.min(1, progress));

            const isMobile = windowW < 768;
            
            // Starting stadium capsule dimensions
            const startW = isMobile ? 220 : 320;
            const startH = isMobile ? 260 : 340;
            const startRadius = isMobile ? 120 : 180;

            // Target expanded dimensions: 100% full screen width & height with 0 radius gap
            const targetW = windowW;
            const targetH = windowH;
            const targetRadius = 0;

            const currentW = startW + (targetW - startW) * progress;
            const currentH = startH + (targetH - startH) * progress;
            const currentRadius = startRadius * (1 - progress);

            capsule.style.width = `${currentW}px`;
            capsule.style.height = `${currentH}px`;
            capsule.style.borderRadius = `${currentRadius}px`;

            if (content) {
                content.style.opacity = Math.max(0, (progress - 0.15) / 0.85);
                content.style.transform = `scale(${0.9 + (progress * 0.1)})`;
            }
        }

        let heroVideo = null;
        let scrollScheduled = false;
        let scrollTargetProgress = 0;
        let currentHeroProgress = 0;
        let initialPageShown = false;
        const heroLerpFactor = 0.18;
        const scrollSyncThreshold = 0.05;

        function getHeroScrollProgress() {
            const wrapper = document.getElementById('heroScrollWrapper');
            if (!wrapper) return 0;
            const rect = wrapper.getBoundingClientRect();
            const totalScrollable = wrapper.offsetHeight - window.innerHeight;
            if (totalScrollable <= 0) return 0;
            return Math.max(0, Math.min(1, -rect.top / totalScrollable));
        }

        function updateHeroVideoProgress() {
            if (!heroVideo) {
                requestAnimationFrame(updateHeroVideoProgress);
                return;
            }

            if (heroVideo.duration && heroVideo.readyState >= 2) {
                scrollTargetProgress = getHeroScrollProgress();
                const progressDelta = scrollTargetProgress - currentHeroProgress;
                currentHeroProgress += progressDelta * heroLerpFactor;
                currentHeroProgress = Math.max(0, Math.min(1, currentHeroProgress));

                const targetTime = heroVideo.duration * currentHeroProgress;
                if (Math.abs(heroVideo.currentTime - targetTime) > scrollSyncThreshold) {
                    heroVideo.currentTime = Math.max(0, Math.min(heroVideo.duration, targetTime));
                }
            }

            requestAnimationFrame(updateHeroVideoProgress);
        }

        function onScrollUpdate() {
            updateScrollZoom();
            scrollScheduled = false;
        }

        function scheduleScrollUpdate() {
            if (scrollScheduled) return;
            scrollScheduled = true;
            requestAnimationFrame(onScrollUpdate);
        }

        window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
        window.addEventListener('resize', scheduleScrollUpdate);
        window.addEventListener('DOMContentLoaded', () => {
            heroVideo = document.getElementById('heroVideo');
            initHeroVideo();
            updateScrollZoom();
            updateHeroVideoProgress();
        });
        window.addEventListener('pageshow', () => {
            updateScrollZoom();
            if (initialPageShown) return;
            initialPageShown = true;
            document.fonts.ready.then(() => {
                updateScrollZoom();
                document.documentElement.classList.remove('scroll-state-initializing');
            });
        });

        function initHeroVideo() {
            if (!heroVideo) return;

            heroVideo.addEventListener('loadedmetadata', () => {
                scrollTargetProgress = getHeroScrollProgress();
                currentHeroProgress = scrollTargetProgress;
                heroVideo.currentTime = heroVideo.duration * currentHeroProgress;
                heroVideo.pause();
            });

            heroVideo.addEventListener('ended', () => {
                heroVideo.pause();
            });

            heroVideo.playbackRate = 1;
        }

        // Modal Handlers
        function toggleContactModal() {
            const modal = document.getElementById('contactModal');
            const card = document.getElementById('contactModalCard');
            if (modal.classList.contains('opacity-0')) {
                modal.classList.remove('opacity-0', 'pointer-events-none');
                card.classList.remove('scale-95');
                card.classList.add('scale-100');
            } else {
                modal.classList.add('opacity-0', 'pointer-events-none');
                card.classList.remove('scale-100');
                card.classList.add('scale-95');
            }
        }

        function handleContactSubmit(e) {
            e.preventDefault();
            const success = document.getElementById('contactSuccess');
            success.classList.remove('hidden');
            setTimeout(() => {
                toggleContactModal();
                success.classList.add('hidden');
                e.target.reset();
            }, 2000);
        }

        function openReelModal() {
            openProjectModal(
                'ARTEM SHCHERBAKOV — DIRECTORS REEL', 
                'CG Lead & Founder @ ZHEESHEE Studio', 
                'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-car-42934-large.mp4', 
                'A compilation of visual effects sequences, live action integrations, and world building concepts directed by Artem Shcherbakov.'
            );
        }

        function openProjectModal(title, category, videoSrc, description) {
            const modal = document.getElementById('videoModal');
            const video = document.getElementById('modalVideo');
            const src = document.getElementById('modalVideoSrc');
            
            document.getElementById('modalTitle').innerText = title;
            document.getElementById('modalCategory').innerText = category;
            document.getElementById('modalDesc').innerText = description;
            
            src.src = videoSrc;
            video.load();
            video.play().catch(e => console.log('Autoplay prevented'));

            modal.classList.remove('opacity-0', 'pointer-events-none');
        }

        function closeVideoModal() {
            const modal = document.getElementById('videoModal');
            const video = document.getElementById('modalVideo');
            video.pause();
            modal.classList.add('opacity-0', 'pointer-events-none');
        }

        function bounceFace(element) {
            element.classList.add('scale-125', 'rotate-12');
            setTimeout(() => {
                element.classList.remove('scale-125', 'rotate-12');
            }, 300);
        }

        document.querySelectorAll('[data-action="toggle-contact"]').forEach((button) => {
            button.addEventListener('click', toggleContactModal);
        });

        document.querySelectorAll('[data-action="close-video"]').forEach((button) => {
            button.addEventListener('click', closeVideoModal);
        });

        document.querySelectorAll('[data-action="bounce-face"]').forEach((element) => {
            element.addEventListener('click', () => bounceFace(element));
        });

        document.getElementById('contactForm').addEventListener('submit', handleContactSubmit);

        // Cursor Neon Trail Canvas Effect
        const canvas = document.getElementById('sketchCanvas');
        const ctx = canvas.getContext('2d');
        let points = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function addPoint(x, y) {
            points.push({
                x: x,
                y: y,
                life: 1.0,
                size: Math.random() * 2 + 3
            });
        }

        window.addEventListener('mousemove', (e) => {
            addPoint(e.clientX, e.clientY);
        });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                addPoint(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        function animateCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < points.length; i++) {
                points[i].life -= 0.035;
            }
            points = points.filter(p => p.life > 0);

            if (points.length > 1) {
                for (let i = 0; i < points.length - 1; i++) {
                    const p1 = points[i];
                    const p2 = points[i + 1];
                    const alpha = Math.min(p1.life, p2.life);
                    
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = '#FF0033';
                    ctx.lineWidth = Math.max(1, 3.5 * alpha);
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.shadowColor = '#FF0033';
                    ctx.shadowBlur = 10 * alpha;
                    ctx.globalAlpha = alpha * 0.75;
                    ctx.stroke();
                }
            }

            for (let i = 0; i < points.length; i++) {
                let p = points[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fillStyle = '#FF0033';
                ctx.shadowColor = '#FF0033';
                ctx.shadowBlur = 8;
                ctx.globalAlpha = p.life * 0.85;
                ctx.fill();
            }

            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();

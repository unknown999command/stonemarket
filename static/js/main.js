document.addEventListener('DOMContentLoaded', function() {
    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq__item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq__question');
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Form handling
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        // Блокируем кнопку, меняем текст и добавляем класс
        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...';

        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            message: 'Запрос звонка'
        };

        fetch('/api/callback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            formMessage.style.display = 'block';
            formMessage.style.padding = '10px';
            formMessage.style.borderRadius = '5px';
            formMessage.style.fontWeight = 'bold';
            if (data.status === 'success') {
                formMessage.style.color = '#155724';
                formMessage.style.backgroundColor = '#d4edda';
                formMessage.style.border = '1px solid #c3e6cb';
                formMessage.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
                contactForm.reset();
            } else {
                formMessage.style.color = '#721c24';
                formMessage.style.backgroundColor = '#f8d7da';
                formMessage.style.border = '1px solid #f5c6cb';
                formMessage.textContent = 'Произошла ошибка. Пожалуйста, попробуйте позже.';
            }
        })
        .catch(error => {
            formMessage.style.display = 'block';
            formMessage.style.padding = '10px';
            formMessage.style.borderRadius = '5px';
            formMessage.style.fontWeight = 'bold';
            formMessage.style.color = '#721c24';
            formMessage.style.backgroundColor = '#f8d7da';
            formMessage.style.border = '1px solid #f5c6cb';
            formMessage.textContent = 'Произошла ошибка. Пожалуйста, попробуйте позже.';
        })
        .finally(() => {
            // Разблокируем кнопку и возвращаем оригинальный текст
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        });
    });

    // Gallery functionality
    const slides = document.querySelector('.gallery__slides');
    const slideItems = document.querySelectorAll('.gallery__slide');
    const prevButton = document.querySelector('.gallery__button--prev');
    const nextButton = document.querySelector('.gallery__button--next');
    const dotsContainer = document.querySelector('.gallery__dots');
    
    let currentSlide = 0;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    // Create dots
    slideItems.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('gallery__dot');
        dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.gallery__dot');
    updateDots();

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function goToSlide(index) {
        currentSlide = index;
        updateSlidePosition();
        updateDots();
    }

    function updateSlidePosition() {
        const translateX = currentSlide * -100;
        slides.style.transform = `translateX(${translateX}%)`;
        
        // Добавляем/убираем класс active для текущего слайда
        slideItems.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
    }

    prevButton.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slideItems.length) % slideItems.length;
        updateSlidePosition();
        updateDots();
    });

    nextButton.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slideItems.length;
        updateSlidePosition();
        updateDots();
    });

    // Touch events
    slides.addEventListener('touchstart', touchStart);
    slides.addEventListener('touchmove', touchMove);
    slides.addEventListener('touchend', touchEnd);

    function touchStart(event) {
        isDragging = true;
        startPos = event.touches[0].clientX;
        slides.style.transition = 'none';
        // Сохраняем начальное положение для определения скорости свайпа
        currentTranslate = startPos;
        prevTranslate = startPos;
    }

    function touchMove(event) {
        if (!isDragging) return;
        event.preventDefault(); // Предотвращаем скролл страницы при свайпе
        const currentPosition = event.touches[0].clientX;
        const diff = currentPosition - startPos;
        const translateX = currentSlide * -100 + (diff / slides.offsetWidth) * 100;
        
        // Добавляем сопротивление при свайпе за пределы
        if (currentSlide === 0 && diff > 0 || 
            currentSlide === slideItems.length - 1 && diff < 0) {
            slides.style.transform = `translateX(${translateX * 0.3}%)`; // Уменьшаем смещение
        } else {
            slides.style.transform = `translateX(${translateX}%)`;
        }
        
        currentTranslate = currentPosition;
    }

    function touchEnd(event) {
        isDragging = false;
        slides.style.transition = 'transform 0.3s ease-out';
        const diff = event.changedTouches[0].clientX - startPos;
        const swipeThreshold = window.innerWidth * 0.15; // 15% от ширины экрана
        
        // Вычисляем скорость свайпа
        const swipeSpeed = Math.abs(currentTranslate - prevTranslate);
        
        if (Math.abs(diff) > swipeThreshold || swipeSpeed > 3) {
            if (diff > 0 && currentSlide > 0) {
                currentSlide--;
            } else if (diff < 0 && currentSlide < slideItems.length - 1) {
                currentSlide++;
            }
        }
        
        updateSlidePosition();
        updateDots();
    }

    // Add click functionality for mobile devices
    slideItems.forEach(slide => {
        slide.addEventListener('click', function(e) {
            // Проверяем, что мы на мобильном устройстве
            if (window.innerWidth <= 768) {
                // Игнорируем клик по навигационным элементам
                if (e.target.closest('.gallery__button')) return;
                
                // Если клик был по описанию, не закрываем его
                if (e.target.closest('.gallery__caption')) {
                    e.stopPropagation();
                    return;
                }
                
                // Закрываем описание на всех других слайдах
                slideItems.forEach(s => {
                    if (s !== this) s.classList.remove('caption-visible');
                });
                
                // Переключаем видимость описания текущего слайда
                this.classList.toggle('caption-visible');
            }
        });
    });

    // Закрываем описание при клике вне слайда
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.gallery__slide')) {
            slideItems.forEach(slide => slide.classList.remove('caption-visible'));
        }
    });

    // Закрываем описание при начале свайпа
    slides.addEventListener('touchstart', function() {
        slideItems.forEach(slide => slide.classList.remove('caption-visible'));
    });
});
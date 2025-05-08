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
});
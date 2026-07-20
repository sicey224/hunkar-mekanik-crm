import AOS from 'aos';
import 'aos/dist/aos.css';

// Initialize AOS (Animate On Scroll)
AOS.init({
  duration: 800,
  easing: 'ease-out',
  once: true,
  offset: 80,
  disable: window.innerWidth < 480 ? 'mobile' : false
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('active');
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      navLinks.classList.remove('active');
    }
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// FAQ Accordion functionality
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
  question.addEventListener('click', () => {
    // Close other open questions
    faqQuestions.forEach(otherQuestion => {
      if (otherQuestion !== question && otherQuestion.classList.contains('active')) {
        otherQuestion.classList.remove('active');
        otherQuestion.nextElementSibling.style.display = 'none';
        otherQuestion.querySelector('.toggle-icon').textContent = '+';
      }
    });

    // Toggle current question
    question.classList.toggle('active');
    const answer = question.nextElementSibling;
    const icon = question.querySelector('.toggle-icon');

    if (question.classList.contains('active')) {
      answer.style.display = 'block';
      icon.textContent = '-';
    } else {
      answer.style.display = 'none';
      icon.textContent = '+';
    }
  });
});

// Contact Form handling
const leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('submitBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Gönderiliyor...';
    btn.disabled = true;

    const leadData = {
      fullName: document.getElementById('leadName').value,
      phone: document.getElementById('leadPhone').value,
      service: document.getElementById('leadService').value,
      message: document.getElementById('leadMessage').value
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        alert('Talebiniz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.');
        leadForm.reset();
      } else {
        alert('Bir hata oluştu. Lütfen telefon ile bize ulaşın.');
      }
    } catch (error) {
      console.error('API Hatası:', error);
      alert('Sunucuya bağlanılamadı. Lütfen telefon numaramızdan bizi arayın.');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

console.log("Hünkar Havalandırma - AEO & SEO Optimizasyonlu Site Yüklendi.");

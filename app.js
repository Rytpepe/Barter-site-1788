import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCEaQXCFGLI2oL6ryiflVgYld3SVnu9iyc",
  authDomain: "bartersite1788.firebaseapp.com",
  projectId: "bartersite1788",
  storageBucket: "bartersite1788.firebasestorage.app",
  messagingSenderId: "657738917083",
  appId: "1:657738917083:web:59f2e24bb6071f1d15d8fe",
  measurementId: "G-KFKSPV5N91"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addBtn = document.getElementById('add-btn');
const modal = document.getElementById('add-modal');
const closeBtn = document.getElementById('close-modal');
const addForm = document.getElementById('add-form');
const itemsGrid = document.querySelector('.items-grid');
const searchInput = document.querySelector('.search-input');
const categoryBtns = document.querySelectorAll('.category-tag');

const contactModal = document.getElementById('contact-modal');
const closeContactBtn = document.getElementById('close-contact-modal');
const contactModalBody = document.getElementById('contact-modal-body');
const copyContactBtn = document.getElementById('copy-contact-btn');

let allItems = [];
let currentContactToCopy = '';
let currentCategory = 'Все'; // По умолчанию показываем всё

function openContactModal(item) {
    currentContactToCopy = item.contact || "Не указан";
    
    contactModalBody.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="contact-image-preview">
        <h2 class="contact-title">${item.title}</h2>
        <p class="contact-desc">${item.desc}</p>
        <div class="contact-exchange-box">
            ♻️ Владелец хочет взамен: ${item.exchange}
        </div>
        <div>
            <div class="contact-highlight-label">Свяжитесь для обмена:</div>
            <div class="contact-highlight">${currentContactToCopy}</div>
        </div>
    `;
    
    copyContactBtn.textContent = 'Скопировать контакт';
    copyContactBtn.style.background = ''; 
    contactModal.classList.add('active');
}

// Фильтрация элементов
function renderItems(filterText = '') {
    itemsGrid.innerHTML = '';
    
    const filteredItems = allItems.filter(item => {
        // Проверка по тексту
        const matchesText = item.title.toLowerCase().includes(filterText.toLowerCase()) || 
                            item.desc.toLowerCase().includes(filterText.toLowerCase());
        
        // Проверка по категории (старые вещи без категории считаем как "Другое")
        const itemCat = item.category || 'Другое';
        const matchesCategory = currentCategory === 'Все' || itemCat === currentCategory;

        return matchesText && matchesCategory;
    });

    filteredItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.style.animationDelay = `${index * 0.05}s`;
        
        // Добавил бейдж с категорией на карточку
        const catBadge = item.category ? `<span style="font-size:12px; color:var(--primary); font-weight:600; margin-bottom:8px;">${item.category}</span>` : '';

        card.innerHTML = `
            <div class="img-container">
                <img src="${item.image}" alt="${item.title}" class="item-img">
            </div>
            <div class="item-info">
                ${catBadge}
                <h3 class="item-title">${item.title}</h3>
                <p class="item-desc">${item.desc}</p>
                <span class="item-exchange">♻️ Меняю на: ${item.exchange}</span>
                <button class="btn-secondary contact-btn">Предложить обмен</button>
            </div>
        `;
        
        const btn = card.querySelector('.contact-btn');
        btn.addEventListener('click', () => openContactModal(item));
        
        itemsGrid.appendChild(card);
    });
}

// Слушаем кнопки категорий
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.textContent;
        renderItems(searchInput.value);
    });
});

const q = query(collection(db, "items"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
    allItems = [];
    snapshot.forEach((doc) => {
        allItems.push(doc.data());
    });
    renderItems(searchInput.value);
});

addBtn.addEventListener('click', () => modal.classList.add('active'));
closeBtn.addEventListener('click', () => modal.classList.remove('active'));
closeContactBtn.addEventListener('click', () => contactModal.classList.remove('active'));

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
    if (e.target === contactModal) contactModal.classList.remove('active');
});

copyContactBtn.addEventListener('click', () => {
    if (currentContactToCopy && currentContactToCopy !== "Не указан") {
        navigator.clipboard.writeText(currentContactToCopy).then(() => {
            copyContactBtn.textContent = '✅ Скопировано!';
            copyContactBtn.style.background = 'var(--accent)';
        });
    }
});

searchInput.addEventListener('input', (e) => {
    renderItems(e.target.value);
});

addForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('item-title').value;
    const exchange = document.getElementById('item-exchange').value;
    const desc = document.getElementById('item-desc').value;
    const contact = document.getElementById('item-contact').value;
    const category = document.getElementById('item-category').value; // Получаем категорию
    let image = document.getElementById('item-image').value;

    if (!image) {
        image = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Фото+отсутствует';
    }

    const submitBtn = addForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Публикация...';
    submitBtn.disabled = true;

    try {
        await addDoc(collection(db, "items"), {
            title: title,
            desc: desc,
            exchange: exchange,
            contact: contact,
            category: category, // Сохраняем в базу
            image: image,
            timestamp: Date.now()
        });
        
        addForm.reset();
        modal.classList.remove('active');
    } catch (error) {
        alert("Произошла ошибка при сохранении!");
    } finally {
        submitBtn.textContent = 'Опубликовать';
        submitBtn.disabled = false;
    }
});

const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});
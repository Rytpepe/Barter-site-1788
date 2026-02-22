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

let allItems = [];

function renderItems(filterText = '') {
    itemsGrid.innerHTML = '';
    
    const filteredItems = allItems.filter(item => 
        item.title.toLowerCase().includes(filterText.toLowerCase()) || 
        item.desc.toLowerCase().includes(filterText.toLowerCase())
    );

    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="item-img">
            <div class="item-info">
                <h3 class="item-title">${item.title}</h3>
                <p class="item-desc">${item.desc}</p>
                <span class="item-exchange">Меняю на: ${item.exchange}</span>
                <button class="btn-secondary" onclick="alert('Запрос на обмен отправлен!')">Предложить обмен</button>
            </div>
        `;
        itemsGrid.appendChild(card);
    });
}

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
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});

searchInput.addEventListener('input', (e) => {
    renderItems(e.target.value);
});

addForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('item-title').value;
    const exchange = document.getElementById('item-exchange').value;
    const desc = document.getElementById('item-desc').value;
    let image = document.getElementById('item-image').value;

    if (!image) {
        image = 'https://placehold.co/300x200?text=Новая+вещь';
    }

    const submitBtn = addForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Загрузка...';
    submitBtn.disabled = true;

    try {
        await addDoc(collection(db, "items"), {
            title: title,
            desc: desc,
            exchange: exchange,
            image: image,
            timestamp: Date.now()
        });
        
        addForm.reset();
        modal.classList.remove('active');
    } catch (error) {
        console.error(error);
        alert("Произошла ошибка при сохранении!");
    } finally {
        submitBtn.textContent = 'Опубликовать';
        submitBtn.disabled = false;
    }
});
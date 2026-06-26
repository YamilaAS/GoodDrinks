document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    console.log('este es el token:', token); 
    if (!token) {
        loadLogin(); 
    } else {
        console.log('va todo bien');
       let currentPage = 1; 
        fetchWines(currentPage, token); 
    }
});



function fetchWines(page, token) {
    const apiUrl = 'http://localhost:5003/api/wines'; 
    const limit = 10;
console.log('aca ando por el fech');
    fetch(`${apiUrl}?page=${page}&limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            console.log('fetchWine response',response);
            if (response.status === 401) {
                localStorage.removeItem('token');
                loadLogin(); 
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data:', data);
            const wineList = document.getElementById('wine-list');
            wineList.innerHTML = ''; 

            data.wines.forEach(wine => {
                const wineCard = document.createElement('div');
                wineCard.className = 'wine-card';
                wineCard.innerHTML = `
                    <img src="ruta/a/tu/imagen/${wine.id}.jpg" alt="${wine.name}">
                    <div class="wine-info">
                        <h3>${wine.name}</h3>
                        <p>Type: ${wine.type}</p>
                        <p>Winery: ${wine.winery}</p>
                        <p>Year: ${wine.year}</p>
                        <p>Region: ${wine.region}</p>
                        <p>Variety: ${wine.variety}</p>
                        <p>Average Rating: ${wine.averageRating}</p>
                    </div>
                `;
                wineList.appendChild(wineCard);
            });

            setupPagination(data.totalPages);
        })
        .catch(error => console.error('Error fetching wines:', error));
}

function setupPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; 

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.disabled = i === currentPage;
        button.addEventListener('click', () => {
            currentPage = i;
            const token = localStorage.getItem('token');
            fetchWines(currentPage, token);
        });
        pagination.appendChild(button);
    }
}

// Exponer funciones globalmente
window.fetchWines = fetchWines;
window.setupPagination = setupPagination;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        loadWineList();
    } else {
        loadLogin(); 
    }
});

function loadLogin() {
    loadCSS('css/login.css');
    fetch('html/login.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('app').innerHTML = data;
            const script = document.createElement('script');
            script.src = 'js/login.js';
            document.body.appendChild(script);
        })
        .catch(error => console.error('Error loading login page:', error));
}

function loadRegister() {
    loadCSS('css/register.css');
    fetch('html/register.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('app').innerHTML = data;
            const script = document.createElement('script');
            script.src = 'js/register.js';
            document.body.appendChild(script);
        })
        .catch(error => console.error('Error loading register page:', error));
}

function loadWineList() {
    const token = localStorage.getItem('token');
    console.log(' loadWineList Token:', token);
    if (!token) {
        loadLogin(); 
        return;
    }
    loadCSS('css/winesList.css');
    fetch('html/wineList.html')
        .then(response => {
            console.log('loadWineList Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
         })

        .then(data => {
            console.log('loadWineList data:',data);
            document.getElementById('app').innerHTML = data;
            const script = document.createElement('script');
            script.src = 'js/winesList.js';
          
            script.onload = function() {
                console.log('loadWineList',script);
            };
            document.body.appendChild(script);
        })
        .catch(error => console.error('Error loading wine list page:', error));
}

function loadCSS(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    console.log('loadWineList link', link);
    document.head.appendChild(link);
}
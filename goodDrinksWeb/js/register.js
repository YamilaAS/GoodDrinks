document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    fetch('http://localhost:5003/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Usuario registrado exitosamente') {
            alert('Registration successful! Please log in.');
            loadLogin(); 
        } else {
            alert('Registracion fallida: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error registering:', error)
        alert('Error: ' + error.message);
    });
});

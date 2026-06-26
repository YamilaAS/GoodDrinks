document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
   
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:5003/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            loadWineList(); 
        } else {
            alert('Login failed: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => console.error('Error logging in:', error));
});

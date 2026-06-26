document.addEventListener('DOMContentLoaded', () => {
    const profileButton = document.getElementById('profile-button');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const logoutButton = document.getElementById('logout');
    const editProfileButton = document.getElementById('edit-profile');
    const profileName = document.getElementById('profile-name');
    const profileImg = document.getElementById('profile-img');
    

   
    profileButton.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    //cerrar menu desplegable 
    window.addEventListener('click', (event) => {
        if (!profileButton.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    //cierre de sesion
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        
        loadLogin(); 
    });

    // Editar perfil
    editProfileButton.addEventListener('click', () => {
        // Load the edit profile view
        loadEditProfile();
    });

    // Check if user is logged in and update the profile name and image
    const token = localStorage.getItem('token');
    
    if (token) {
        fetch('http://localhost:5003/api/users/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.error(data.message);
            } else {
                console.log('User data:', data);
                document.getElementById('profile-username').textContent = data.username;
               
            }
    
            // Mostrar la información del usuario en el perfil
           // document.getElementById('username').innerText = data.username;
           // profileName.textContent = data.username;
           
            ///profileImg.src = data.profileImage || '../img/user-circle-regular-24.png';
        })
        .catch(error => console.error('Error fetching profile:', error));
    } else {
        loadLogin(); 
    }
});

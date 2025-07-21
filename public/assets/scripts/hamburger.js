document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger');
    const sideMenu = document.getElementById('sideMenu');
    
    let menuOpen = false;

    function toggleMenu() {
        menuOpen = !menuOpen;
        
        if (menuOpen) {
            openMenu();
        } else {
            closeMenu();
        }
    }

    function openMenu() {
        // Add classes for smooth animation
        sideMenu.classList.add('open');
        hamburger.classList.add('open');
        
        // Add outside click listener after animation starts
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
            if (menuOverlay) {
                menuOverlay.addEventListener('click', closeMenu);
            }
        }, 100);
    }

    function closeMenu() {
        // Remove classes for smooth animation
        sideMenu.classList.remove('open');
        hamburger.classList.remove('open');
        
        // Remove event listeners
        document.removeEventListener('click', handleOutsideClick);   
        menuOpen = false;
    }

    function handleOutsideClick(e) {
        // Check if click is outside menu and not on hamburger
        if (!sideMenu.contains(e.target) && 
            !hamburger.contains(e.target) && 
            menuOpen) {
            closeMenu();
        }
    }

    // Hamburger click handler
    hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menuOpen) {
            closeMenu();
        }
    });

    // Handle window resize - close menu on desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && menuOpen) {
            closeMenu();
        }
    });
});

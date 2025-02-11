document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.querySelector(".login");

  // Vérifier si l'utilisateur est connecté
  function checkLoginStatus() {
    if (!loginLink) return; // Évite une erreur sur login.html (car le lien login n'existe pas ici)

    if (sessionStorage.getItem("token")) {
      loginLink.textContent = "Logout";
      loginLink.href = "#";
      loginLink.removeEventListener("click", logout); // Empêche la duplication d'événements
      loginLink.addEventListener("click", logout);
    } else {
      loginLink.textContent = "Login";
      loginLink.href = "login.html";
    }
  }

  // Fonction pour la déconnexion
  function logout(event) {
    event.preventDefault();
    sessionStorage.removeItem("token");
    checkLoginStatus();
    window.location.href = "index.html"; // Redirige vers l'accueil après la déconnexion
  }

  // Gérer la soumission du formulaire de connexion
  const loginForm = document.getElementById("loginform");
  if (loginForm) {
    // Vérifie qu'on est bien sur la page login.html
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      let user = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
      };

      let response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (response.status !== 200) {
        const errorBox = document.createElement("div");
        errorBox.className = "error-login";
        errorBox.innerHTML = "Erreur de mail ou de mot de passe";
        document.querySelector("form").prepend(errorBox);
      } else {
        let result = await response.json();
        sessionStorage.setItem("token", result.token);
        window.location.href = "index.html"; // Redirection après connexion
      }
    });
  }

  // Vérifier le statut de connexion au chargement de la page
  checkLoginStatus();
});

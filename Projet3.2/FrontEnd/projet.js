async function afficherProjets(filter) {
  document.querySelector(".gallery").innerHTML = "";
  document.querySelector(".gallery-modal").innerHTML = "";
  const url = "http://localhost:5678/api/works";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    let works = await response.json();

    if (filter) {
      works = works.filter((data) => data.categoryId === filter); //filtrer les works
    }

    for (const work of works) {
      setFigure(work);
      setModalFigure(work);
    }
  } catch (error) {
    console.error(error.message);
  }
}

//afficherProjets();

function setFigure(data) {
  const figure = document.createElement("figure");
  figure.classList.add("image-container");
  const img = document.createElement("img");
  img.src = data.imageUrl;
  img.alt = data.title;
  figure.appendChild(img);
  const figcaption = document.createElement("figcaption");
  figcaption.innerText = data.title;
  figure.appendChild(figcaption);
  document.querySelector(".gallery").appendChild(figure);
}

function setModalFigure(data) {
  const figure = document.createElement("figure");
  figure.classList.add("image-container");
  const img = document.createElement("img");
  img.src = data.imageUrl;
  img.alt = data.title;
  figure.appendChild(img);
  const figcaption = document.createElement("figcaption");
  figcaption.innerText = data.title;
  figure.appendChild(figcaption);
  const trashIcon = document.createElement("i");
  trashIcon.classList.add("fa-solid", "fa-trash-can", "overlay-icon");
  trashIcon.dataset.id = data.id;
  trashIcon.addEventListener("click", deleteWork); // Ajout de l'écouteur pour la suppression
  figure.appendChild(trashIcon);
  document.querySelector(".gallery-modal").append(figure);
}

document.addEventListener("DOMContentLoaded", () => {
  //être sûr que toutes les images s'affichent au début
  afficherProjets();

  const tousButton = document.querySelector(".tous");
  tousButton.addEventListener("click", () => afficherProjets());
});

//afficherProjets();

async function getCategories() {
  const url = "http://localhost:5678/api/categories";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);

    for (let i = 0; i < json.length; i++) {
      setFilter(json[i]);
    }
  } catch (error) {
    console.error(error.message);
  }
}

getCategories();

function setFilter(data) {
  console.log(data);
  const div = document.createElement("div");
  div.className = data.id;
  div.addEventListener("click", () => afficherProjets(data.id));
  div.innerHTML = `${data.name}`;
  document.querySelector(".div-container").append(div);
}

function displayAdminMode() {
  if (sessionStorage.token) {
    const editBanner = document.createElement("div");
    editBanner.className = "edit";
    editBanner.innerHTML =
      '<p><a href="#modal1" class="js-modal"><i class="fa-regular fa-pen-to-square"></i>Mode édition</a></p>';
    document.body.prepend(editBanner);
  }
}

displayAdminMode();

// Modale

let modal = null;
const focusableSelector = "button, a, input, textarea";
let focusables = [];

const openModal = function (e) {
  e.preventDefault();
  modal = document.querySelector(e.target.getAttribute("href"));
  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  focusables[0].focus();
  modal.style.display = null;
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  modal.addEventListener("click", closeModal); // fermer la modale en cliquant n'importe ou dessus
  modal.querySelector(".js-modal-close").addEventListener("click", closeModal); // fermer la modale en cliquant sur le bouton close
  modal
    .querySelector(".js-modal-stop")
    .addEventListener("click", stopPropagation); //si on clique sur élémént parent de la modale, la modale ne se ferme pas (ne pas propager la fermeture)
};

const stopPropagation = function (e) {
  e.stopPropagation();
};

const closeModal = function (e) {
  if (modal === null) return;
  e.preventDefault();
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", true);
  modal.removeAttribute("aria-modal");
  modal.removeEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-close")
    .removeEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-stop")
    .removeEventListener("click", stopPropagation);
  modal = null;
};

const focusInModal = function (e) {
  e.preventDefault();
  let index = focusables.findIndex((f) => f === modal.querySelector(":focus"));
  if (e.shiftKey === true) {
    index--;
  } else index++;
  if (index >= focusables.length) {
    index = 0;
  }
  if (index < 0) {
    index = focusables.length - 1;
  }
  focusables[index].focus();
};

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModal(e);
  }
  if (e.key === "Tab" && modal !== null) {
    focusInModal(e);
  }
});

document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", openModal);
});

// fonction pour supprimer les éléments

async function deleteWork(event) {
  event.stopPropagation();
  // const id = event.srcElement.id;
  const id = event.target.dataset.id;
  const deleteApi = "http://localhost:5678/api/works/";
  const token = sessionStorage.getItem("token");

  try {
    let response = await fetch(deleteApi + id, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (response.status === 401 || response.status === 500) {
      const errorBox = document.createElement("div");
      errorBox.className = "error-login";
      errorBox.innerHTML = "Il y a eu une erreur";
      const modalContainer = document.querySelector(".modal-button-container");
      if (modalContainer) {
        modalContainer.prepend(errorBox);
      }
    } else {
      //window.location.reload(); // Rafraîchir la page après suppression réussie
      afficherProjets();
    }
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
  }
}

//BOUTON RETOUR FONCTIONNEL
document.addEventListener("DOMContentLoaded", () => {
  const backButton = document.getElementById("back-button");
  const galleryModalContainer = document.getElementById("gallery-modal");
  const formModalContainer = document.getElementById("form-modal");
  if (!backButton || !galleryModalContainer || !formModalContainer) {
    console.error(
      "Un ou plusieurs éléments nécessaires ('back-button', 'gallery-modal', 'form-modal') sont introuvables."
    );
    return;
  }
  backButton.addEventListener("click", () => {
    afficherGalleryModal();
  });
  function afficherGalleryModal() {
    galleryModalContainer.classList.remove("hidden");
    galleryModalContainer.style.display = "block";
    formModalContainer.classList.add("hidden");
    formModalContainer.style.display = "none";
    backButton.classList.add("hidden");
  }
  function afficherFormModal() {
    galleryModalContainer.classList.add("hidden");
    galleryModalContainer.style.display = "none";
    formModalContainer.classList.remove("hidden");
    formModalContainer.style.display = "block";
    backButton.classList.remove("hidden");
  }
  const addPhotoButton = document.querySelector(".add-photo-button");
  if (addPhotoButton) {
    addPhotoButton.addEventListener("click", () => {
      afficherFormModal();
    });
  } else {
    console.error("Le bouton 'Ajouter une photo' est introuvable.");
  }
});
// Fonction pour ajouter les écouteurs aux icônes poubelle dans la modale
function ajouterEcouteursSuppression() {
  const trashIcons = document.querySelectorAll(".gallery-modal .fa-trash-can");
  trashIcons.forEach((icon) => icon.addEventListener("click", deleteWork));
}

//écouteur du bouton ajouter photo

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("file-input");
  const addPhotoButton = document.querySelector(".add-photo-button");
  if (addPhotoButton) {
    addPhotoButton.addEventListener("click", switchModal);
  } else {
    console.error("Le bouton d'ajout de photo n'a pas été trouvé");
  }
});

//Ajouter une photo

const switchModal = function () {
  const galleryModalContainer = document.getElementById("gallery-modal");
  const formModalContainer = document.getElementById("form-modal");
  const backButton = document.getElementById("back-button");

  galleryModalContainer.classList.add("hidden");
  formModalContainer.classList.remove("hidden");
  backButton.classList.remove("hidden");

  document
    .getElementById("triggerFileUpload")
    .addEventListener("click", function (event) {
      event.preventDefault(); // --> Empêche le rechargement de la page
      document.getElementById("file").click(); // Déclenche le clic sur l'input caché pour mettre photo

      // Fonction pour afficher l'image sélectionnée

      document.getElementById("file").addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imagePreview = document.getElementById("image-preview");
            imagePreview.classList.add("image-preview");
            imagePreview.style.height = "210px";
            imagePreview.innerHTML = ""; // Supprime l'image précédente
            const img = document.createElement("img");
            img.src = e.target.result;
            imagePreview.style.display = "block";
            img.alt = "Image sélectionnée";
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "contain";
            imagePreview.appendChild(img);
            const photoContainer = document.getElementById("photo-container");
            photoContainer.classList.add("hidden");
          };
          reader.readAsDataURL(file);
        }
      });
    });
};

document
  .getElementById("picture-form")
  .addEventListener("submit", handlePictureSubmit);

const addPhotoButton = document.querySelector(".add-photo-button");
console.log(addPhotoButton);

// fonctionnement des boutons closes et back de la modale

document.addEventListener("DOMContentLoaded", () => {
  const closeButtons = document.querySelectorAll(".js-modal-close");
  closeButtons.forEach((button) =>
    button.addEventListener("click", closeModal)
  );
  const pictureForm = document.getElementById("picture-form");
  if (pictureForm) {
    pictureForm.addEventListener("submit", handlePictureSubmit);
  } else {
    console.error(
      "Le formulaire d'ajout de photo (#picture-form) est introuvable."
    );
  }
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("picture-form")
    .addEventListener("submit", handlePictureSubmit);
});

function toggleModal() {
  const galleryModalContainer = document.getElementById("gallery-modal");
  const formModalContainer = document.getElementById("form-modal");
  const backButton = document.getElementById("back-button");

  if (galleryModalContainer.classList.contains("hidden")) {
    galleryModalContainer.classList.remove("hidden");
    formModalContainer.classList.add("hidden");
    //backButton.classList.add("hidden");
  } else {
    galleryModalContainer.classList.add("hidden");
    formModalContainer.classList.remove("hidden");
    backButton.classList.remove("hidden");
  }
}

// Gestion de l'ajout d'une nouvelle photo

async function handlePictureSubmit(event) {
  event.preventDefault(); // Empêche le rechargement de la page

  const formData = new FormData(event.target); // Récupération des données du formulaire
  const token = sessionStorage.getItem("token"); // Récupération du token

  try {
    const response = await fetch(`http://localhost:5678/api/works`, {
      // Envoi des données du formulaire
      method: "POST", // Méthode POST pour ajouter un nouvel élément
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    });

    if (!response.ok) {
      //throw new Error(`Erreur lors de l'ajout : ${response.statusText}`);
      const errorBox = document.createElement("div");
      errorBox.className = "error-add";
      errorBox.innerHTML = "Erreur dans le remplissage du formulaire";
      document.querySelector("form").prepend(errorBox);
      return;
    }

    const data = await response.json();

    // Ajoute le nouvel élément à la galerie principale + modale
    setFigure(data); // Appelle la fonction existante pour ajouter à la galerie principale
    setModalFigure(data); // Appelle la fonction existante pour ajouter à la galerie de la modale

    // ⚡️ Réactualiser la galerie modale
    await afficherProjets(); // Recharge la galerie avec le nouvel élément ajouté

    // Réinitialise le formulaire

    document.getElementById("picture-form").reset(); // Réinitialise les champs
    document.getElementById("image-preview").innerHTML = ""; // Supprime la prévisualisation
    document.getElementById("photo-container").classList.remove("hidden");

    // Affiche la galerie après l'ajout réussi
    document.getElementById("gallery-modal").classList.remove("hidden");
    document.getElementById("gallery-modal").style.display = "block";

    document.getElementById("form-modal").classList.add("hidden");
    document.getElementById("form-modal").style.display = "none";

    document.getElementById("back-button").classList.add("hidden"); // Cache le bouton retour
    document.getElementById("back-button").style.display = "none";

    // Ferme la modale après l'ajout réussi
    toggleModal();
  } catch (error) {
    console.error("Erreur :", error.message);
    alert("Une erreur est survenue lors de l'ajout du work.");
  }
}

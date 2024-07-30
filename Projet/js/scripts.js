document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // Charger les lieux et les afficher
  fetch("/places")
    .then((response) => response.json())
    .then((places) => {
      console.log("Places récupérées:", places);
      window.places = places; // Stocker les lieux dans une variable globale
      displayPlaces(places);
      generateCountryFilter(places);
    })
    .catch((error) =>
      console.error("Erreur lors du chargement des lieux:", error)
    );

  // Charge les détails du lieu si on est sur place.html
  const placeId = new URLSearchParams(window.location.search).get("id");
  if (placeId) {
    fetch(`/places/${placeId}`)
      .then((response) => response.json())
      .then((place) => {
        console.log("Place détails:", place);
        document.getElementById("place-title").textContent = place.description;
        const placeDetails = document.getElementById("place-details");
        placeDetails.innerHTML = `
          <img src="${place.image || "images/default-image.jpg"}" alt="${
          place.description
        }" class="place-image-large">
          <p><strong>Hôte :</strong> ${place.host_name}</p>
          <p><strong>Prix par nuit :</strong> ${place.price_per_night}€</p>
          <p><strong>Lieu :</strong> ${place.city_name}, ${
          place.country_name
        }</p>
          <p><strong>Description :</strong> ${place.description}</p>
          <p><strong>Équipements :</strong> ${place.amenities.join(", ")}</p>
        `;

        const reviewsSection = document.getElementById("reviews");
        place.reviews.forEach((review) => {
          const reviewCard = document.createElement("div");
          reviewCard.className = "review-card";
          reviewCard.innerHTML = `
            <p><strong>${review.user_name} :</strong> ${review.comment}</p>
            <p>Note : ${"★".repeat(review.rating)}${"☆".repeat(
            5 - review.rating
          )}</p>
          `;
          reviewsSection.appendChild(reviewCard);
        });
      })
      .catch((error) =>
        console.error("Erreur lors du chargement des détails du lieu:", error)
      );

    // Gestion du formulaire d'ajout d'avis
    const reviewForm = document.getElementById("review-form");
    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newReview = {
        placeId: placeId,
        user_name: "Utilisateur actuel", 
        comment: document.getElementById("review-text").value,
        rating: parseInt(document.getElementById("rating").value),
      };
      // Envoie l'avis au serveur (simulé ici par un console.log)
      console.log("Nouvel avis :", newReview);
    });
  }
});

function viewDetails(id) {
  console.log("Viewing details for place:", id);
  window.location.href = `place.html?id=${id}`;
}

function displayPlaces(places) {
  const placesList = document.getElementById("places-list");
  placesList.innerHTML = ""; // Vider la liste des lieux
  places.forEach((place) => {
    console.log("Processing place:", place);
    const placeCard = document.createElement("div");
    placeCard.className = "place-card";
    placeCard.innerHTML = `
      <img src="${place.image || "images/default-image.jpg"}" alt="${
      place.description
    }" class="place-image">
      <h2>${place.description}</h2>
      <p>Prix par nuit : ${place.price_per_night}€</p>
      <p>Lieu : ${place.city_name}, ${place.country_name}</p>
      <button class="details-button" onclick="viewDetails('${
        place.id
      }')">Voir les détails</button>
    `;
    placesList.appendChild(placeCard);
  });
}

function generateCountryFilter(places) {
  const uniqueCountries = [
    ...new Set(places.map((place) => place.country_code)),
  ];
  const countryFilter = document.getElementById("country-filter");
  uniqueCountries.forEach((countryCode) => {
    const countryName = places.find(
      (place) => place.country_code === countryCode
    ).country_name;
    const option = document.createElement("option");
    option.value = countryCode;
    option.textContent = countryName;
    countryFilter.appendChild(option);
  });

  // Ajouter un écouteur d'événement pour le filtre
  countryFilter.addEventListener("change", filterPlaces);
}

function filterPlaces() {
  const countryFilter = document.getElementById("country-filter").value;
  const filteredPlaces = window.places.filter((place) => {
    return countryFilter === "" || place.country_code === countryFilter;
  });
  displayPlaces(filteredPlaces);
}

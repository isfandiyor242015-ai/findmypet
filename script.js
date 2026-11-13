
// ==========================================
// FINDMYPET - SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL = "https://gxvhsebjxgilcuowtygg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_54Gx40NLwDRtDuUDQhqm0Q_8jp_2pa2";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// ==========================================
// ELEMENTS
// ==========================================

const petSearch = document.getElementById("petSearch");
const petLocation = document.getElementById("petLocation");
const petType = document.getElementById("petType");
const searchButton = document.getElementById("searchButton");

const petGrid = document.getElementById("petGrid");
const filterButtons = document.querySelectorAll(".filter-btn");
const noResults = document.getElementById("noResults");

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

let allPets = [];
let currentFilter = "all";
let currentUserId = null;

// ==========================================
// GET CURRENT USER
// ==========================================

async function getCurrentUser() {
  const { data, error } = await db.auth.getUser();

  if (error) {
    console.log("User session not found:", error.message);
    currentUserId = null;
    return;
  }

  currentUserId = data.user ? data.user.id : null;
}

// ==========================================
// MOBILE MENU
// ==========================================

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });

  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });
}

// ==========================================
// LOAD PETS FROM SUPABASE
// ==========================================

async function loadPets() {
  petGrid.innerHTML = "<p>Loading announcements...</p>";

  await getCurrentUser();

  const { data, error } = await db
    .from("pets")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading pets:", error.message);

    petGrid.innerHTML = "";
    noResults.hidden = false;
    noResults.textContent =
      "Could not load announcements. Please try again later.";

    return;
  }

  allPets = data || [];

  renderPets(allPets);
  filterPets();

  console.log("FindMyPet database connected successfully!");
}

// ==========================================
// DELETE PET
// ==========================================

async function deletePet(pet, button) {
  const confirmed = confirm(
    `Are you sure you want to delete the announcement for ${pet.pet_name || "this pet"}?`
  );

  if (!confirmed) return;

  button.disabled = true;
  button.textContent = "Deleting...";

  const { error } = await db
    .from("pets")
    .delete()
    .eq("id", pet.id)
    .eq("user_id", currentUserId);

  if (error) {
    console.error("Delete error:", error.message);

    alert("Could not delete the announcement. Please try again.");

    button.disabled = false;
    button.textContent = "🗑 Delete";

    return;
  }

  allPets = allPets.filter(item => item.id !== pet.id);

  renderPets(allPets);
  filterPets();

  alert("Announcement deleted successfully!");
}

// ==========================================
// CREATE PET CARD
// ==========================================

function createPetCard(pet) {
  const card = document.createElement("article");
  card.className = "pet-card";

  const status = pet.status || "lost";
  const type = pet.pet_type || "other";
  const name = pet.pet_name || "Unnamed pet";

  const location = [pet.city, pet.country]
    .filter(Boolean)
    .join(", ");

  card.dataset.status = status;
  card.dataset.type = type;

  card.dataset.name = (
    name + " " +
    (pet.breed || "") + " " +
    (pet.description || "")
  ).toLowerCase();

  card.dataset.location = location.toLowerCase();

  // PHOTO

  const photo = document.createElement("div");
  photo.className = "pet-photo";

  if (pet.photo_url) {
    const img = document.createElement("img");
    img.src = pet.photo_url;
    img.alt = name;
    img.loading = "lazy";

    photo.appendChild(img);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "pet-placeholder";

    placeholder.textContent =
      type === "dog" ? "🐕" :
      type === "cat" ? "🐈" : "🐾";

    photo.appendChild(placeholder);
  }

  const statusBadge = document.createElement("span");

  statusBadge.className =
    status === "lost"
      ? "status lost-status"
      : "status found-status";

  statusBadge.textContent =
    status === "lost" ? "LOST PET" : "FOUND PET";

  photo.appendChild(statusBadge);

  // PET INFORMATION

  const info = document.createElement("div");
  info.className = "pet-info";

  const title = document.createElement("div");
  title.className = "pet-title";

  const heading = document.createElement("h3");
  heading.textContent = name;

  const emoji = document.createElement("span");

  emoji.textContent =
    type === "dog" ? "🐕" :
    type === "cat" ? "🐈" : "🐾";

  title.appendChild(heading);
  title.appendChild(emoji);

  const breed = document.createElement("p");
  breed.textContent = pet.breed || "Breed not specified";

  const description = document.createElement("p");
  description.textContent = pet.description || "";

  const place = document.createElement("div");
  place.className = "pet-location";
  place.textContent =
    "📍 " + (location || "Location not provided");

  // DATE

  const date = document.createElement("p");

  if (pet.last_seen_at) {
    const dateValue = new Date(
      pet.last_seen_at + "T00:00:00"
    );

    date.textContent =
      "📅 " + dateValue.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
  } else {
    date.textContent = "📅 Date not provided";
  }

  // ADD INFORMATION

  info.appendChild(title);
  info.appendChild(breed);
  info.appendChild(description);
  info.appendChild(place);
  info.appendChild(date);

  // DELETE BUTTON - ONLY OWNER

  if (currentUserId && pet.user_id === currentUserId) {
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "pet-delete-btn";
    deleteButton.textContent = "🗑 Delete";

    deleteButton.style.marginTop = "15px";
    deleteButton.style.padding = "10px 16px";
    deleteButton.style.border = "none";
    deleteButton.style.borderRadius = "8px";
    deleteButton.style.background = "#dc3545";
    deleteButton.style.color = "#ffffff";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.fontWeight = "bold";

    deleteButton.addEventListener("click", () => {
      deletePet(pet, deleteButton);
    });

    info.appendChild(deleteButton);
  }

  card.appendChild(photo);
  card.appendChild(info);

  return card;
}

// ==========================================
// DISPLAY PETS
// ==========================================

function renderPets(pets) {
  petGrid.innerHTML = "";

  pets.forEach(pet => {
    petGrid.appendChild(createPetCard(pet));
  });
}

// ==========================================
// FILTER PETS
// ==========================================

function filterPets() {
  const searchText = petSearch.value.trim().toLowerCase();
  const locationText = petLocation.value.trim().toLowerCase();
  const selectedType = petType.value;

  let visibleCount = 0;

  const cards = petGrid.querySelectorAll(".pet-card");

  cards.forEach(card => {
    const name = card.dataset.name || "";
    const location = card.dataset.location || "";
    const type = card.dataset.type;
    const status = card.dataset.status;

    const matchesSearch = name.includes(searchText);
    const matchesLocation = location.includes(locationText);

    const matchesType =
      selectedType === "all" || type === selectedType;

    const matchesFilter =
      currentFilter === "all" || status === currentFilter;

    const visible =
      matchesSearch &&
      matchesLocation &&
      matchesType &&
      matchesFilter;

    card.hidden = !visible;

    if (visible) {
      visibleCount++;
    }
  });

  noResults.hidden = visibleCount !== 0;

  if (visibleCount === 0) {
    noResults.textContent =
      "No matching pet announcements found.";
  }
}

// ==========================================
// FILTER BUTTONS
// ==========================================

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    currentFilter = button.dataset.filter;

    filterPets();
  });
});

// ==========================================
// SEARCH EVENTS
// ==========================================

searchButton.addEventListener("click", filterPets);

petSearch.addEventListener("input", filterPets);
petLocation.addEventListener("input", filterPets);
petType.addEventListener("change", filterPets);

// ==========================================
// START WEBSITE
// ==========================================

loadPets();

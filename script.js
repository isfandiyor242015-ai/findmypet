
// FINDMYPET - SUPABASE CONNECTION

const SUPABASE_URL = "YOUR_PROJECT_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_PUBLISHABLE_KEY";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// TEST DATABASE CONNECTION

async function testConnection() {
  const { data, error } = await db
    .from("pets")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Supabase connection error:", error.message);
    return;
  }

  console.log("FindMyPet database connected successfully!");
}

testConnection();

// FINDMYPET - MAIN JAVASCRIPT

const petSearch = document.getElementById("petSearch");
const petLocation = document.getElementById("petLocation");
const petType = document.getElementById("petType");
const searchButton = document.getElementById("searchButton");

const petCards = document.querySelectorAll(".pet-card");
const filterButtons = document.querySelectorAll(".filter-btn");
const noResults = document.getElementById("noResults");

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

let currentFilter = "all";

// MOBILE MENU

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

// FILTER BUTTONS

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(item => item.classList.remove("active"));

    button.classList.add("active");
    currentFilter = button.dataset.filter;

    filterPets();
  });
});

// PET SEARCH

function filterPets() {
  const searchText = petSearch.value.trim().toLowerCase();
  const locationText = petLocation.value.trim().toLowerCase();
  const selectedType = petType.value;

  let visibleCount = 0;

  petCards.forEach(card => {
    const name = card.dataset.name.toLowerCase();
    const location = card.dataset.location.toLowerCase();
    const type = card.dataset.type;
    const status = card.dataset.status;

    const matchesSearch = name.includes(searchText);
    const matchesLocation = location.includes(locationText);
    const matchesType = selectedType === "all" || type === selectedType;
    const matchesFilter = currentFilter === "all" || status === currentFilter;

    const isVisible =
      matchesSearch &&
      matchesLocation &&
      matchesType &&
      matchesFilter;

    card.hidden = !isVisible;

    if (isVisible) {
      visibleCount++;
    }
  });

  noResults.hidden = visibleCount !== 0;
}

searchButton.addEventListener("click", filterPets);

petSearch.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    filterPets();
  }
});

petLocation.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    filterPets();
  }
});

petType.addEventListener("change", filterPets);

// INITIALIZE

filterPets();

console.log("FindMyPet is ready!");

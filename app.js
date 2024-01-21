// HTML elements
const searchInput = document.querySelector(".search__input");
const searchButton = document.querySelector(".search__button");
const mainSection = document.querySelector(".main__section");
const user = document.querySelector(".user");
const searchError = document.querySelector(".error");
const githubImage = document.querySelector(".github__image");
const userName = document.querySelector(".user__name");
const userName2 = document.querySelector(".user__name2");
const userBio = document.querySelector(".user__bio");
const userLocation = document.querySelector(".user__location");
const userWebsite = document.querySelector(".user__website");
const firstStatNumber = document.querySelector(".firstStatNumber");
const firstStatTitle = document.querySelector(".firstStatTitle");
const secondStatNumber = document.querySelector(".secondStatNumber");
const secondStatTitle = document.querySelector(".secondStatTitle");
const thirdStatNumber = document.querySelector(".thirdStatNumber");
const thirdStatTitle = document.querySelector(".thirdStatTitle");
const userRepositories = document.querySelector(".user__repositories");
const userFollowers = document.querySelector(".user__followers");
const mainLoader = document.getElementById("mainLoader");

const perPageSelect = document.getElementById("perPageSelect");
const paginationContainer = document.getElementById("paginationContainer");
const userRepositoriesContainer = document.getElementById("userRepositories");

let currentPage = 1;
let repositoriesPerPage = 10; // Default value

const GITHUB_API_URL = "https://api.github.com";

const fetchUserData = async (userName) => {
  try {
    mainLoader.style.display = "block";

    const response = await fetch(`https://api.github.com/users/${userName}`);
    const data = await response.json();

    if (data.login !== undefined) {
      renderProfile(data);
      renderUserRepositories(userName);
      renderUserFollowers(userName);
    } else {
      userNotFound();
    }
  } catch (error) {
    console.log(error);
  } finally {
    // Hide main loader after API call completes
    mainLoader.style.display = "none";
  }
};

const renderProfile = (userData) => {
  user.style.display = "flex";
  searchError.style.display = "none";
  githubImage.src = userData.avatar_url;
  userName.textContent = userData.name;
  userName2.textContent = `@${userData.login}`;
  userName2.setAttribute("href", userData.html_url);
  userBio.textContent = userData.bio;
  userBio.style =
    "font-weight: bold; color: hsl(26, 82%, 57%); font-size: 1.8rem;";

  userLocation.innerHTML = `
        <i class="fa-solid fa-location-dot"></i>
        <p style = "font-weight: bold; color: rgb(255, 255, 255); font-size: 2rem;">${userData.location}</p>
    `;

  userWebsite.innerHTML = `
        <i class="fa-solid fa-link"></i>
		<a href="${userData.blog}" class="website__link" target="_blank">${userData.blog}</a>
    `;

  style = "font-weight: bold; color: rgb(255, 255, 255); font-size: 1.8rem; ";
  styletwo =
    "font-weight: bold; color: hsl(160, 100%, 65%); font-size: 1.8rem; ";
  firstStatTitle.textContent = "Followers";
  firstStatNumber.textContent = userData.followers;

  firstStatTitle.style = style;
  secondStatTitle.style = style;
  thirdStatTitle.style = style;

  firstStatNumber.style = styletwo;
  secondStatNumber.style = styletwo;
  thirdStatNumber.style = styletwo;

  secondStatTitle.textContent = "Following";
  secondStatNumber.textContent = userData.following;
  thirdStatTitle.textContent = "Repositories";
  thirdStatNumber.textContent = userData.public_repos;
};

const renderUserRepositories = async (userName, page = 1) => {
  try {
    const response = await fetch(
      `${GITHUB_API_URL}/users/${userName}/repos?page=${page}&per_page=${repositoriesPerPage}`
    );
    const repositories = await response.json();
    let HTMLContentToAppend = "";
    // hsl(160, 100%, 65%);
    for (const repository of repositories) {
      HTMLContentToAppend += `
				<div class="repository">
					<a style="font-weight: bold; color: hsl(160, 100%, 65%); font-size: 1.8rem; "  href="${
            repository.html_url
          }" class="repository__name" target="_blank">${repository.name}</a>
					<p  style="font-weight: bold; color: white;" class="repository__description">${
            repository.description
          }</p>
					<div class="repository__info">
						<p style="color: red;" class="repository__languages">${repository.language}</p>
						<p class="repository__lastUpdate">Last Update: ${String(
              repository.updated_at
            ).substring(0, 10)}</p>
					</div>
				</div>
		`;
    }

    userRepositoriesContainer.innerHTML = `
      <h1 class="user__repositories__title">Repositories</h1>
      ${HTMLContentToAppend}
    `;

    renderPagination(response.headers.get("Link"));
  } catch (error) {
    console.log(error);
  }
};

const renderUserFollowers = async (userName) => {
  try {
    const response = await fetch(
      `https://api.github.com/users/${userName}/followers`
    );
    const followers = await response.json();
    let HTMLContentToAppend = "";

    let maxfollower = 0;

    for (const follower of followers) {
      maxfollower++;

      HTMLContentToAppend += `
				<a href="${follower.html_url}" class="follower" target="_blank">
					<div class="follower__img">
						<img src="${follower.avatar_url}" alt="${follower.login}" />
					</div>
					<p style="font-weight: bold; color: hsl(160, 100%, 65%); font-size: 1.8rem; " class="follower__username">${follower.login}</p>
				</a>
			`;

      if (maxfollower >= 10) break;
    }

    userFollowers.innerHTML = `
			<h1 class="user__followers__title">Top Followers</h1>
			${HTMLContentToAppend}
		`;
  } catch (error) {
    console.log(error);
  }
};

const renderPagination = (linkHeader) => {
  paginationContainer.innerHTML = "";

  if (linkHeader) {
    const links = linkHeader.split(", ");
    const pageInfo = {};

    links.forEach((link) => {
      const [url, rel] = link.split("; ");
      const page = parseInt(url.match(/page=(\d+)/)[1]);

      pageInfo[rel] = page;
    });

    const { prev, next, last } = pageInfo;

    if (prev) {
      const prevButton = createPaginationButton("Prev", prev);
      paginationContainer.appendChild(prevButton);
    }

    if (next) {
      const nextButton = createPaginationButton("Next", next);
      paginationContainer.appendChild(nextButton);
    }

    if (last) {
      const lastButton = createPaginationButton("Last", last);
      paginationContainer.appendChild(lastButton);
    }
  }
};

// Add this function for creating pagination buttons
const createPaginationButton = (label, page) => {
  const button = document.createElement("button");
  button.textContent = label;
  button.addEventListener("click", () => {
    currentPage = page;
    renderUserRepositories(searchInput.value, currentPage);
  });

  return button;
};

// Add event listener to perPageSelect for handling changes
perPageSelect.addEventListener("change", () => {
  repositoriesPerPage = parseInt(perPageSelect.value);
  renderUserRepositories(searchInput.value, currentPage);
});

const userNotFound = () => {
  user.style.display = "none";
  searchError.style.display = "block";
  userRepositories.innerHTML = "";
  userFollowers.innerHTML = "";
};

// Event Listeners
searchButton.addEventListener("click", () => {
  fetchUserData(searchInput.value);
});

searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    fetchUserData(searchInput.value);
  }
});

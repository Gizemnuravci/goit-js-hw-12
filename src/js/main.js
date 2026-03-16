import { fetchImages } from './api.js';
import iziToast from 'izitoast';
import SimpleLightbox from 'simplelightbox';
import 'izitoast/dist/css/iziToast.min.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loader = document.getElementById('loader');
const loadMoreBtn = document.querySelector('.load-more');

let lightbox = new SimpleLightbox('.gallery a');

let page = 1;
let query = '';
let totalHits = 0;

form.addEventListener('submit', async e => {
  e.preventDefault();
  query = e.target.searchQuery.value.trim();
  if (!query) return;

  page = 1;
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('hidden');
  loader.classList.remove('hidden');

  try {
    const data = await fetchImages(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    renderImages(data.hits);
    loadMoreBtn.classList.remove('hidden');
    checkEnd();
  } catch (error) {
    iziToast.error({
      message: 'Error loading images',
      position: 'topRight',
    });
  } finally {
    loader.classList.add('hidden');
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page++;
  loader.classList.remove('hidden');

  try {
    const data = await fetchImages(query, page);
    renderImages(data.hits);
    lightbox.refresh();
    smoothScroll();
    checkEnd();
  } catch (error) {
    iziToast.error({
      message: 'Error loading images',
      position: 'topRight',
    });
  } finally {
    loader.classList.add('hidden');
  }
});

function renderImages(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
<li class="gallery-item">
  <a href="${largeImageURL}">
    <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
  </a>
  <div class="info">
    <p>Likes: ${likes}</p>
    <p>Views: ${views}</p>
    <p>Comments: ${comments}</p>
    <p>Downloads: ${downloads}</p>
  </div>
</li>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

function checkEnd() {
  const maxTotalHits = 500; // Pixabay free limit
  const limitedTotalHits = totalHits > maxTotalHits ? maxTotalHits : totalHits;
  const totalPages = Math.ceil(limitedTotalHits / 40);

  if (page >= totalPages) {
    loadMoreBtn.classList.add('hidden');
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight',
    });
  }
}

function smoothScroll() {
  const cards = document.querySelectorAll('.gallery-item');
  const lastCard = cards[cards.length - 1];
  const { height: cardHeight } = lastCard.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

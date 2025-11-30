
// Handle block control buttons
function handleBlockControl(block, action) {
    const type = block.getAttribute('data-type');
    switch (action) {
        case 'hstyle':
        case 'headEdit': {
            // Find existing heading
            let currentHeading = block.querySelector('h1,h2,h3,h4,h5,h6');
            let currentLevel = currentHeading ? currentHeading.tagName.toLowerCase() : 'h2';

            const headModalEl = document.getElementById('headModal');
            const headModal = new bootstrap.Modal(headModalEl);

            // Pre-fill select with current heading level
            document.getElementById('headLevel').value = currentLevel;



            // Show modal
            headModal.show();

            const saveBtn = document.getElementById('saveHead');
            saveBtn.replaceWith(saveBtn.cloneNode(true));
            const newSaveBtn = document.getElementById('saveHead');

            newSaveBtn.addEventListener('click', () => {
                const newLevel = document.getElementById('headLevel').value || 'h2';

                if (currentHeading) {
                    // Create new heading with same text
                    const newHeading = document.createElement(newLevel);
                    newHeading.className = currentHeading.className; // keep classes
                    newHeading.innerHTML = currentHeading.innerHTML; // keep text
                    currentHeading.replaceWith(newHeading);
                }

                headModal.hide();
                document.getElementById('headForm').reset();
            });
            break;
        }
        case 'edit':
        case 'settings':
            // focus first editable area
            const ed = block.querySelector('[contenteditable="true"], pre, textarea, input');
            if (ed) {
                if (ed.getAttribute('contenteditable') === 'true') {
                    ed.focus();
                    placeCaretAtEnd(ed);
                } else {
                    ed.focus();
                }
            }
            break;

        case 'imgUpload': {

            const img = block.querySelector('img');
            const figcaption = block.querySelector('figcaption');
            const imgInput = block.querySelector('#imageUploadInput');
            imgInput.click();
            imgInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    //preview
                    const reader = new FileReader();
                    reader.onload = function (evt) {
                        const image = evt.target.result;
                        if (img) {
                            img.src = image;
                        } else {
                            const newImg = document.createElement('img');
                            newImg.src = image;
                            block.querySelector('.block-content').appendChild(newImg);
                        }
                    };
                    reader.readAsDataURL(file);

                    const caption = prompt('Enter image caption (optional):', figcaption?.textContent || '');
                    if (figcaption) figcaption.textContent = caption || 'Caption';
                    else if (caption) {
                        const cap = document.createElement('figcaption');
                        cap.contentEditable = 'true'; cap.className = 'small muted'; cap.textContent = caption;
                        img.insertAdjacentElement('afterend', cap);
                    }
                }
            }
        }
            break;
        case 'vidUpload': {

            const source = block.querySelector('video source');
            const video = block.querySelector('video');
            const vidInput = block.querySelector('#videoUploadInput');
            vidInput.click();
            vidInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    //preview
                    const url = URL.createObjectURL(file);
                    if (source) {
                        source.src = url;
                        video.load();
                    }
                }
            }
        }
            break;
        // media edits via prompts
        case 'imgEdit': {
            const img = block.querySelector('img');
            const figcaption = block.querySelector('figcaption');
            const image = prompt('Enter image URL:', img ? img.src : '');
            const caption = prompt('Enter image caption (optional):', figcaption?.textContent || '');

            if (image !== null && image.trim() !== '') {
                if (img) {
                    img.src = image;
                } else {
                    const newImg = document.createElement('img');
                    newImg.src = image;
                    block.querySelector('.block-content').appendChild(newImg);
                }

                if (figcaption) figcaption.textContent = caption || 'Caption';
                else if (caption) {
                    const cap = document.createElement('figcaption');
                    cap.contentEditable = 'true'; cap.className = 'small muted'; cap.textContent = caption;
                    img.insertAdjacentElement('afterend', cap);
                }
            }
            break;
        }
        case 'videoEdit': {
            const source = block.querySelector('video source');
            const url = prompt('Enter video file URL:', source ? source.src : '');
            if (url !== null) {
                if (source) {
                    source.src = url;
                    const video = block.querySelector('video');
                    video.load();
                }
            }
            break;
        }
        case 'audioEdit': {
            const audio = block.querySelector('audio');
            const url = prompt('Enter audio file URL:', audio ? audio.src : '');
            if (url !== null) {
                if (audio) audio.src = url;
            }
            break;
        }
        case 'embedEdit': {
            const data = block.dataset.embedData ? JSON.parse(block.dataset.embedData) : {};

            const embedModalEl = document.getElementById('embedModal');
            const embedModal = new bootstrap.Modal(embedModalEl);

            // Pre-fill form
            document.getElementById('embedUrl').value = data.url || '';
            document.getElementById('embedCaption').value = data.caption || '';

            // Show modal

            embedModal.show();

            const saveBtn = document.getElementById('saveEmbed');
            saveBtn.replaceWith(saveBtn.cloneNode(true));
            const newSaveBtn = document.getElementById('saveEmbed');

            newSaveBtn.addEventListener('click', async () => {
                const url = document.getElementById('embedUrl').value;
                const caption = document.getElementById('embedCaption').value || '';


                let options = {};

                if (url) {
                    options.embed = await generateEmbedHTML({
                        url,
                        caption,
                        align: 'mx-auto'
                    });

                    options.data = {
                        url,
                        caption,
                        align: 'mx-auto'
                    };

                } else {
                    options.embed = '<p class="text-danger">No URL provided.</p>';
                    options.data = {
                        url: '',
                        caption,
                        align: 'mx-auto'
                    };
                }

                const embed = block.querySelector('.embedFrame');
                if (embed) embed.innerHTML = options.embed;
                //store options.data for saving
                block.dataset.embedData = JSON.stringify(options.data || {});

                embedModal.hide();
                document.getElementById('embedForm').reset();
            });
            break;
        }
        case 'carouselEdit': {
            // Manage carousel slides via prompt; comma-separated URLs
            const carousel = block.querySelector('[data-carousel]');
            const current = Array.from(carousel.querySelectorAll('img')).map(i => i.src).join(',');
            const urls = prompt('Enter slide image URLs (comma separated):', current);
            if (urls !== null) {
                carousel.innerHTML = '';
                urls.split(',').map(s => s.trim()).filter(Boolean).forEach(u => {
                    const slide = document.createElement('div'); slide.className = 'slide';
                    const img = document.createElement('img'); img.src = u;
                    slide.appendChild(img);
                    carousel.appendChild(slide);
                });
            }
            break;
        }
        case 'galleryEdit': {
            const gallery = block.querySelector('.gallery');
            const current = Array.from(gallery.querySelectorAll('img')).map(i => i.src).join(',');
            const urls = prompt('Enter gallery image URLs (comma separated):', current);
            if (urls !== null) {
                gallery.innerHTML = '';
                urls.split(',').map(s => s.trim()).filter(Boolean).forEach(u => {
                    const fig = document.createElement('figure');
                    fig.style.width = 'calc(50% - 8px)';
                    const img = document.createElement('img'); img.src = u;
                    const cap = document.createElement('figcaption'); cap.contentEditable = 'true'; cap.className = 'small muted'; cap.textContent = 'Caption';
                    fig.appendChild(img); fig.appendChild(cap);
                    gallery.appendChild(fig);
                });
            }
            break;
        }
        case 'mapEdit': {
            const coords = prompt('Enter lat,lng or place name:', block.querySelector('.map')?.getAttribute('data-coords') || '');
            if (coords !== null) {
                const map = block.querySelector('.map');
                map.setAttribute('data-coords', coords);
                map.innerHTML = `<div class="muted">Map set to: ${coords}</div>`;
            }
            break;
        }
        case 'tableEdit': {
            // Make table cells editable
            const t = block.querySelector('table');
            if (t) {
                t.querySelectorAll('td,th').forEach(cell => cell.setAttribute('contenteditable', 'true'));
            }
            break;
        }
        case 'countEdit': {
            const target = prompt('Set countdown target (ISO datetime):', block.querySelector('[data-countdown]')?.textContent || '');
            if (target !== null) {
                block.querySelector('[data-countdown]').textContent = target;
                updateCountdownBlock(block);
            }
            break;
        }
        case 'liststyle': {
            const ul = block.querySelector('ul');
            if (ul) {
                const ol = document.createElement('ol');
                ol.classList = ul.classList;
                ol.innerHTML = ul.innerHTML;
                ul.remove();
                block.querySelector('.block-content').appendChild(ol);
            } else {
                const ol = block.querySelector('ol');
                if (ol) {
                    const ul = document.createElement('ul');
                    ul.classList = ol.classList;
                    ul.innerHTML = ol.innerHTML;
                    ol.remove();
                    block.querySelector('.block-content').appendChild(ul);
                }
            }

        }
        default:
        //console.log('Control action', action, block, type);
    }
}

const textareas = document.querySelectorAll('.autosize-textarea');
const tagContainer = document.getElementById('tagContainer');
const suggestionBox = document.getElementById("hashtagSuggestions");
const subCategoriesHidden = document.getElementById('subcategoryIds');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const hashTagInput = document.getElementById('hashTagInput');
const data = {};
let selectedCategories = [];

// --- CATEGORY LOADING (simulate fetch) ---
let categories = [];
let originalArticle = {};

function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('d-none');
    document.getElementById('loadingOverlay').classList.add('d-flex');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('d-flex');
    document.getElementById('loadingOverlay').classList.add('d-none');
}

function createTagInput(text = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'tag-wrapper';

    const span = document.createElement('span');
    span.className = 'position-absolute start-0 ps-2 text-muted';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tag';
    input.placeholder = 'Add tag';
    input.style.paddingLeft = '1.2em';
    input.value = text

    //attachAutoGrow(input);
    wrapper.style.position = 'relative';
    wrapper.appendChild(span);
    wrapper.appendChild(input);
    return wrapper;
}

document.getElementById('hashTagInput')
// Load categories and subcategories
async function loadCategories() {
    try {
        const response = await fetch('/categories/all');
        const categories = await response.json();
        return categories;
    } catch (err) {
        console.error('Failed to load categories', err);
        return [];
    }
}

function loadSubcategories(category) {
    const subs = data[category];
    const subcategoryContainer = document.getElementById("subcategoryContainer");
    subcategoryContainer.innerHTML = `
            <h6>${category} Subcategories</h6>
            <form id="subcategoryForm" class="mt-2">
                ${subs.map(sub => `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="sub-${sub.id}" value="${sub.id}" data-name="${sub.name}"
                            ${selectedCategories.some(cat => parseInt(cat.id) === parseInt(sub.id)) ? 'checked' : ''}>
                        <label class="form-check-label" for="sub-${sub.id}">${sub.name}</label>
                    </div>
                `).join('')}
            </form>
         `;

    subcategoryContainer.querySelector('#subcategoryForm').addEventListener('change', () => {
        const checkboxes = subcategoryContainer.querySelectorAll('.form-check-input');
        const selected = Array.from(checkboxes).filter(i => i.checked).map(i => ({ id: +i.value, name: i.dataset.name }));
        const unselected = Array.from(checkboxes).filter(i => !i.checked).map(i => ({ id: +i.value }));

        // Remove unselected
        selectedCategories = selectedCategories.filter(cat => !unselected.some(un => cat.id === un.id));

        // Add selected
        selected.forEach(sub => {
            if (!selectedCategories.some(cat => cat.id === sub.id)) {
                selectedCategories.push(sub);
            }
        });

        document.getElementById("allSelectedCategories").innerHTML = `
                <ul class="list-inline mt-2">
                    ${selectedCategories.map(cat => `<li class="list-inline-item"><span class="badge bg-secondary">${cat.name}</span></li>`).join('')}
                </ul>
             `;
        subCategoriesHidden.value = JSON.stringify(selectedCategories.map(cat => cat.id));
    });
}

function attachAutoGrow(input) {
    const wrapper = input.closest('.tag-wrapper');
    let mirror = wrapper.querySelector('.input-mirror');

    function resize() {
        mirror.textContent = input.value || input.placeholder || '';
        input.style.width = mirror.offsetWidth + 2 + 'px'; // add a tiny buffer
    }

    input.addEventListener('input', resize);
    resize(); // Initial size
}


async function initCategories() {
    const categories = await loadCategories();
    categories.forEach(c => data[c.name] = c.subcategories || []);
    const categoryList = document.getElementById("categoryList");
    Object.keys(data).forEach((category, i) => {
        const btn = document.createElement('button');
        btn.className = `list-group-item list-group-item-action ${i === 0 ? 'active' : ''}`;
        btn.textContent = category;
        btn.dataset.category = category;
        categoryList.appendChild(btn);
        if (i === 0) loadSubcategories(category);
    });

    categoryList.addEventListener('click', e => {
        if (e.target.matches('.list-group-item')) {
            document.querySelectorAll("#categoryList .list-group-item").forEach(btn => btn.classList.remove("active"));
            e.target.classList.add("active");
            loadSubcategories(e.target.dataset.category);
        }
    });
}

// Image preview
imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return imagePreview.classList.add('d-none');

    const reader = new FileReader();
    reader.onload = e => {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
});

// Responsive sidebar
function handleResize() {
}
window.addEventListener('resize', handleResize);
handleResize();

// Tags logic

tagContainer.addEventListener('input', async (e) => {
    if (!e.target.classList.contains('tag')) return;
    e.target.value = e.target.value.replace(/^#+/, '');
    const inputs = tagContainer.querySelectorAll('input.tag');
    const last = inputs[inputs.length - 1];
    if (last.value.trim() !== '') tagContainer.appendChild(createTagInput());

    // Hashtag suggestions
    const value = e.target.value.trim().toLowerCase();
    if (value.length < 2) {
        suggestionBox.style.display = "none";
        return;
    }

    try {
        const res = await fetch(`/categories/hashtags?q=${value}`);
        const tags = await res.json();
        if (!tags.length) {
            suggestionBox.style.display = "none";
            return;
        }

        suggestionBox.innerHTML = tags.map(tag =>
            `<a href="#" class="list-group-item list-group-item-action">#${tag}</a>`
        ).join('');

        const rect = e.target.getBoundingClientRect();
        suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;
        suggestionBox.style.left = `${rect.left + window.scrollX}px`;
        suggestionBox.style.width = `${rect.width}px`;
        suggestionBox.style.display = 'block';

        suggestionBox.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', ev => {
                ev.preventDefault();
                e.target.value = a.textContent.replace(/^#+/, '');
                suggestionBox.style.display = 'none';

                const last = tagContainer.querySelectorAll('input.tag').length;
                if (e.target === tagContainer.querySelectorAll('input.tag')[last - 1]) {
                    tagContainer.appendChild(createTagInput());
                }
            });
        });

    } catch (err) {
        console.error('Hashtag suggestion error:', err);
    }
});

tagContainer.addEventListener('keydown', (e) => {
    if (!e.target.classList.contains('tag')) return;
    if ((e.key === 'Backspace' || e.key === 'Delete') && e.target.selectionStart === 0) {
        e.preventDefault();
    }
});

document.addEventListener('click', (e) => {
    if (!suggestionBox.contains(e.target)) {
        suggestionBox.style.display = "none";
    }
});

const articleId = getArticleId();
document.addEventListener('DOMContentLoaded', async () => {
    showLoading();
    await initCategories();

    if (!articleId) {
        showAlert('No article ID provided.', 'danger');
        return;
    }

    const article = await loadArticle(articleId);
    if (!article) return;
    originalArticle = article;
    setFormValues(article);

    // Render existing sections
    if (Array.isArray(article.sections)) {
        article.sections.forEach((section, idx) => {
            let preview = '';
            if (Array.isArray(section.contents) && section.contents.length > 0) {
                preview = section.contents
                    .map((c, i) => {
                        const type = c?.type || 'unknown';
                        return `<div><strong>Content ${i + 1}:</strong> ${type}</div>`;
                    })
                    .join('');
            }

            renderSection({ ...section, preview }, true);
        });
    }

    makeSectionsSortable();
    // Auto-grow textarea
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        textarea.dispatchEvent(new Event('input'));
    });
    hideLoading();
});

document.getElementById('articleForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    e.stopPropagation();

    const form = this;
    form.classList.add('was-validated');

    if (!form.checkValidity()) return;

    const changed = {};

    // Detect which submit button was clicked (e.submitter is supported in modern browsers)
    const submitter = e.submitter;
    const action = submitter?.value || 'draft';

    if (action !== (originalArticle.status || 'draft')) changed.status = action;
    // Title
    const title = form.title.value.trim();
    if (title !== (originalArticle.title || '')) {
        changed.title = title;
    }

    // Excerpt
    const excerpt = form.excerpt.value.trim();
    if (excerpt !== (originalArticle.excerpt || '')) {
        changed.excerpt = excerpt;
    }

    // Read duration
    const readDuration = form.read_duration.value || '0';
    if (readDuration !== String(originalArticle.read_duration || '')) {
        changed.read_duration = readDuration;
    }

    // Published at
    const publishedAt = form.published_at.value;
    const origPublishedAt = (originalArticle.published_at || '').slice(0, 16);
    if (publishedAt !== origPublishedAt) {
        changed.published_at = publishedAt;
    }

    // Subcategories
    let newSubs = [];
    try {
        newSubs = JSON.parse(subCategoriesHidden.value).map(Number).sort();
    } catch (err) {
        console.error('Invalid subcategory data');
    }
    const origSubs = (originalArticle.subcategories || []).map(sub => sub.id).sort();
    if (JSON.stringify(origSubs) !== JSON.stringify(newSubs)) {
        changed.subcategories = JSON.stringify(newSubs);
    }

    // Hashtags
    const newTags = Array.from(document.querySelectorAll('.tag'))
        .map(t => t.value.trim())
        .filter(tag => tag !== '')
        .sort();
    const origTags = (originalArticle.hashtags || []).map(tag => tag.name).sort();
    if (JSON.stringify(origTags) !== JSON.stringify(newTags)) {
        changed.hashtags = JSON.stringify(newTags);
    }

    // Image
    if (form.image.files && form.image.files[0]) {
        changed.image = form.image.files[0];
    }

    // No changes
    if (Object.keys(changed).length === 0) {
        showAlert('No changes detected.', 'info');
        return;
    }

    // Prepare FormData
    const formData = new FormData();
    for (const key in changed) {
        formData.append(key, changed[key]);
    }

    showAlert('Updating article...', 'info');
    showLoading();

    try {
        const res = await fetch(`/article/${getArticleId()}`, {
            method: 'PUT',
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            showAlert('Article updated successfully!', 'success');
            // originalArticle = { ...originalArticle, ...changed };

            const article = await loadArticle(articleId);
            originalArticle = article || { ...originalArticle, ...changed };
            setFormValues(article);
            // Auto-grow textarea
            textareas.forEach(textarea => {
                textarea.addEventListener('input', function () {
                    this.style.height = 'auto';
                    this.style.height = this.scrollHeight + 'px';
                });
                textarea.dispatchEvent(new Event('input'));
            });
            hideLoading();
        } else {
            showAlert(data.error || 'Failed to update article.', 'danger');
        }
    } catch (err) {
        console.error(err);
        showAlert('Network error. Please try again.', 'danger');
        hideLoading();
    }
});

async function loadArticle(id) {
    try {
        const response = await fetch(`/article/id/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        showAlert('Failed to load article.', 'danger');
        return null;
    }
}

function getArticleId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function setFormValues(article) {
    if (article.status === 'draft') {
        document.getElementById('saveDraft').textContent = 'Save';
        document.getElementById('savePublish').textContent = 'Publish';
    } else {
        document.getElementById('savePublish').textContent = 'Save';
        document.getElementById('saveDraft').textContent = 'Move To Draft';
    }
    document.getElementById('title').value = article.title || '';
    document.getElementById('excerpt').value = article.excerpt || '';
    document.getElementById('published_at').value = article.published_at ? article.published_at.slice(0, 16) : '';
    document.getElementById('read_duration').value = article.read_duration || '';

    hideLoading();
    // Image preview
    if (article.image) {
        imagePreview.src = article.image;
        imagePreview.classList.remove('d-none');
    }
    // Subcategories
    selectedCategories = (article.subcategories || []).map(sub => ({ id: sub.id, name: sub.name }));
    console.log(selectedCategories);
    document.getElementById("allSelectedCategories").innerHTML = `
                <ul class="list-inline mt-2">
                  ${selectedCategories.map(cat => `<li class="list-inline-item"><span class="badge bg-secondary">${cat.name}</span></li>`).join('')}
                </ul>
            `;
    subCategoriesHidden.value = JSON.stringify(selectedCategories.map(cat => cat.id));
    // Hashtags
    const hashtags = (article.hashtags || []).map(tag => tag.name);

    renderHashtags(hashtags);
}

function renderHashtags(hashtags = []) {
    // Clear existing inputs
    tagContainer.innerHTML = '';

    hashtags.forEach(tag => {
        tagContainer.appendChild(createTagInput(tag));
    });

    // Always keep one empty input at the end
    tagContainer.appendChild(createTagInput());
}

// --- SECTION HANDLING ---
let sectionIndex = 0;
let newSections = [];
const sectionsContainer = document.getElementById('sectionsContainer');

async function renderSection(section, isExisting = false) {
    const tmpl = document.getElementById('sectionTemplate').content.cloneNode(true);
    const sectionCard = tmpl.querySelector('.section-card');
    sectionCard.dataset.sectionId = section.id || section._uuid;
    sectionCard.querySelector('.section-number').textContent = sectionIndex + 1;

    // Remove section (enabled for all, with confirm)
    const removeBtn = sectionCard.querySelector('.remove-section');
    removeBtn.onclick = async () => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        const sectionId = section.id || section._uuid;
        // Remove from DOM immediately
        sectionCard.remove();
        // Remove from local newSections if present
        newSections = newSections.filter(s => s._uuid !== section._uuid);
        // If existing, call API to delete
        if (section.id) {
            try {
                const res = await fetch(`/article/sections/${section.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error();
                showAlert('Section deleted.', 'success');
            } catch {
                showAlert('Failed to delete section.', 'danger');
            }
        }
        updateSectionNumbers();
        await saveSectionOrder();
    };

    const data = await fetchContents(section.id);
    const contents = data["SectionContents"]
    const container = sectionCard.querySelector('#contentsContainer');
    container.innerHTML = '';
    contents.forEach(content => {
        const card = renderContentCard(content.content, section.id);
        container.appendChild(card);
    });
    sectionCard.querySelector('#addContentBtn').onclick = () => addNewContentCard(section.id);


    sectionsContainer.appendChild(sectionCard);
    sectionIndex++;
    updateSectionNumbers();
}
        async function fetchContents(sectionId) {
            try {
                const res = await fetch(`/article/section/${sectionId}`);
                if (!res.ok) throw new Error('Failed to load contents');
                return await res.json();
            } catch (e) {
                showAlert('Failed to load contents.', 'danger');
                return [];
            }
        }

function updateSectionNumbers() {
    Array.from(sectionsContainer.children).forEach((section, i) => {
        section.querySelector('.section-number').textContent = i + 1;
    });
}

function getSectionOrderPayload() {
    // Collect all section ids in order
    return Array.from(sectionsContainer.children).map((section, idx) => ({
        id: section.dataset.sectionId,
        order: idx + 1
    }));
}

async function saveSectionOrder() {
    const orderedSections = getSectionOrderPayload();
    try {
        const res = await fetch(`/article/sections/reorder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId, sections: orderedSections })
        });
        if (!res.ok) throw new Error();
        showAlert('Section order updated.', 'success');
    } catch {
        showAlert('Failed to update section order.', 'danger');
    }
}

function makeSectionsSortable() {
    if (sectionsContainer.sortable) return;
    sectionsContainer.sortable = Sortable.create(sectionsContainer, {
        handle: '.drag-handle',
        animation: 150,
        onEnd: async () => {
            updateSectionNumbers();
            await saveSectionOrder();
        }
    });
}

// --- ADD NEW SECTION ---
document.getElementById('addSectionBtn').addEventListener('click', async () => {
    const section = await createNewSection(sectionIndex + 1);
    if (section) {
        newSections.push(section);
        renderSection(section, false);
        await saveSectionOrder();
    }
});

// --- CREATE NEW SECTION (POST) ---
async function createNewSection(order) {
    showAlert('Creating new section...', 'info');
    try {
        const res = await fetch(`/article/sections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order, articleId })
        });
        if (!res.ok) throw new Error('Failed to save section');
        const data = await res.json();
        showAlert('Section created successfully!', 'success');
        return { _uuid: data.id, order };
    } catch (err) {
        console.error(err);
        showAlert('Failed to save section.', 'danger');
    }
}


        function renderContentCard(content, sectionId) {
            const tmpl = document.getElementById('contentCardTemplate').content.cloneNode(true);
            const card = tmpl.querySelector('.content-card');
            card.dataset.contentId = content.id || '';
            // Content type select

            const enumTypes = ["head", "list", "text", "image", "video", "carousel", "quote", "embed", 'table'];
            let firstKey = Object.keys(content)[0];
            let firstValue = content[firstKey];

            // Ensure firstKey is a valid enum type; if not, find the next valid one
            if (!enumTypes.includes(firstKey)) {
                firstKey = Object.keys(content).find(k => enumTypes.includes(k)) || '';
                firstValue = content[firstKey];
            }

            const typeSelectTmpl = document.getElementById('contentTypeSelectTemplate').content.cloneNode(true);
            const typeSelect = typeSelectTmpl.querySelector('select');
            typeSelect.value = firstKey || '';
            card.querySelector('.content-type-label').appendChild(typeSelect);
            // Render fields
            renderContentFields(card, typeSelect.value, content);
            typeSelect.onchange = () => renderContentFields(card, typeSelect.value, {});
            // Save
            card.querySelector('.save-content').onclick = () => saveContent(card, sectionId);
            // Delete
            card.querySelector('.delete-content').onclick = () => deleteContent(card, sectionId);
            return card;
        }

        function renderContentFields(card, type, content) {
            const fieldsContainer = card.querySelector('.content-fields');
            fieldsContainer.innerHTML = '';
            if (!type) return;
            const tmpl = document.getElementById('contentFields-' + type);
            if (!tmpl) return;
            const fields = tmpl.content.cloneNode(true);
            // Populate fields if editing
            if (type === 'text' && content) {
                fields.querySelector('.content-text').value = content.text || '';
            }

            if (type === 'table' && content) {

                const table = fields.querySelector('.content-table');

                // Add headers
                if (content.headers && content.headers.length) {
                    content.headers.forEach(header => createHeaderInput(table, header));
                }

                createHeaderInput(table); // extra empty for dynamic add

                // Add rows

                if (content.rows && content.rows.length) {
                    content.rows.forEach(row => createRow(table, row));
                }
                createRow(table); // extra empty for dynamic add

                updateTableContent(table);
            }
            if (type === 'image' && content) {
                fields.querySelector('.content-caption').value = content.caption || '';
                // No file, but can show preview if image_url exists
                if (content.image) {
                    const imgPreview = fields.querySelector('.img-preview');
                    imgPreview.src = content.image;
                    imgPreview.classList.remove('d-none');
                }
            }
            if (type === 'video' && content) {
                fields.querySelector('.content-caption').value = content.caption || '';
            }
            if (type === 'carousel' && content) {
                fields.querySelector('.content-carousel-captions').value = (content["captions"] || []).join('\n');

                const previewDiv = fields.querySelector('.carousel-preview');

                previewDiv.innerHTML = '';
                content.carousel = [];
                content.carousel = Array.from(content["images"]);
                previewDiv.dataset.carousel = JSON.stringify(content.carousel);
                Array.from(content["images"]).forEach(imgxx => {
                    // Image wrapper
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'relative';
                    wrapper.style.display = 'inline-block';
                    wrapper.style.marginRight = '0.5rem';
                    wrapper.style.marginBottom = '0.5rem';

                    // Image element
                    const img = document.createElement('img');
                    img.className = 'rounded';
                    img.style.maxHeight = '80px';
                    img.src = imgxx;
                    img.dataset.status = 'active';

                    // Cancel icon (×)
                    const cancelIcon = document.createElement('span');
                    cancelIcon.innerHTML = '&times;';
                    cancelIcon.style.position = 'absolute';
                    cancelIcon.style.top = '2px';
                    cancelIcon.style.right = '6px';
                    cancelIcon.style.cursor = 'pointer';
                    cancelIcon.style.color = '#fff';
                    cancelIcon.style.fontSize = '18px';
                    cancelIcon.style.background = 'rgba(0, 0, 0, 0.6)';
                    cancelIcon.style.borderRadius = '50%';
                    cancelIcon.style.width = '20px';
                    cancelIcon.style.height = '20px';
                    cancelIcon.style.textAlign = 'center';
                    cancelIcon.style.lineHeight = '18px';
                    cancelIcon.title = 'Remove image';

                    // Undo button
                    const undoBtn = document.createElement('button');
                    undoBtn.textContent = 'Undo';
                    undoBtn.className = 'btn btn-sm btn-light btn-undo';
                    undoBtn.style.position = 'absolute';
                    undoBtn.style.bottom = '4px';
                    undoBtn.style.left = '4px';
                    undoBtn.style.display = 'none'; // Hidden by default
                    undoBtn.style.padding = '0 6px';
                    undoBtn.style.fontSize = '12px';

                    // Cancel logic
                    cancelIcon.addEventListener('click', () => {
                        img.dataset.status = 'deleted';
                        img.style.opacity = '0.3';
                        cancelIcon.style.display = 'none';
                        undoBtn.style.display = 'inline-block';
                        content.carousel = content.carousel.filter(item => item !== imgxx);
                        previewDiv.dataset.carousel = JSON.stringify(content.carousel);
                    });

                    // Undo logic
                    undoBtn.addEventListener('click', () => {
                        img.dataset.status = 'active';
                        img.style.opacity = '1';
                        cancelIcon.style.display = 'inline-block';
                        undoBtn.style.display = 'none';
                        content.carousel.push(imgxx);
                        previewDiv.dataset.carousel = JSON.stringify(content.carousel);
                    });

                    wrapper.appendChild(img);
                    wrapper.appendChild(cancelIcon);
                    wrapper.appendChild(undoBtn);
                    previewDiv.appendChild(wrapper);

                });


            }
            if (type === 'quote' && content) {
                fields.querySelector('.content-quote').value = content.quote || '';
                fields.querySelector('.content-attribution').value = content.attribution || '';
            }
            if (type === 'head' && content) {
                fields.querySelector('.content-head').value = content.head || '';
                fields.querySelector('.content-level').value = content.level || '';
            }
            if (type === 'list' && content) {
                fields.querySelector('.content-list').value = (content.items || []).join('\n');
                fields.querySelector('.content-is-ordered').checked = content.is_ordered || false;
            }
            if (type === 'embed' && content) {
                fields.querySelector('.content-embed-url').value = content.url || '';
                fields.querySelector('.content-embed-caption').value = content.caption || '';
                fields.querySelector('.content-embed-align').value = content.align || 'mx-auto';
            }

            // Image preview for image
            if (type === 'image') {
                const imgInput = fields.querySelector('.content-image');
                const imgPreview = fields.querySelector('.img-preview');
                imgInput.addEventListener('change', function () {
                    const file = this.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = e => {
                            imgPreview.src = e.target.result;
                            imgPreview.classList.remove('d-none');
                        };
                        reader.readAsDataURL(file);
                    } else {
                        imgPreview.classList.add('d-none');
                    }
                });
            }


            // Carousel preview
            if (type === 'carousel') {
                const mediaInput = fields.querySelector('.content-carousel-media');
                const previewDiv = fields.querySelector('.carousel-preview');
                mediaInput.addEventListener('change', function () {
                    Array.from(this.files).forEach(file => {
                        if (file.type.startsWith('image/')) {
                            const img = document.createElement('img');
                            img.className = 'rounded me-2 mb-2';
                            img.style.maxHeight = '80px';
                            const reader = new FileReader();
                            reader.onload = e => img.src = e.target.result;
                            reader.readAsDataURL(file);
                            previewDiv.appendChild(img);
                        } else if (file.type.startsWith('video/')) {
                            const vid = document.createElement('video');
                            vid.className = 'rounded me-2 mb-2';
                            vid.style.maxHeight = '80px';
                            vid.controls = true;
                            const reader = new FileReader();
                            reader.onload = e => vid.src = e.target.result;
                            reader.readAsDataURL(file);
                            previewDiv.appendChild(vid);
                        }
                    });
                });
            }
            fieldsContainer.appendChild(fields);
        }

        async function saveContent(card, sectionId) {
            const contentId = card.dataset.contentId;
            const type = card.querySelector('.content-type-select').value;
            if (!type) {
                showAlert('Please select a content type.', 'warning');
                return;
            }
            let content = {};
            const fields = card.querySelector('.content-fields');
            if (type === 'text') {
                content = { text: fields.querySelector('.content-text').value };
            } else if (type === 'table') {
                const table = fields.querySelector('.content-table');

                const headersRow = table.querySelector('.table-headers-row');
                const tableBody = table.querySelector('.table-body');

                const headers = [...headersRow.querySelectorAll('input')]
                    .map(input => input.value.trim())
                    .filter((h, i, arr) => i < arr.length - 1);

                const rows = [...tableBody.querySelectorAll('tr')]
                    .map(tr => {
                        return [...tr.querySelectorAll('input')]
                            .map(input => input.value.trim())
                            .filter((d, i, arr) => i < arr.length - 1); // remove last cell of each row
                    })
                    .filter(row => row.some(cell => cell !== '')); // keep only non-empty rows


                content = { table: {}, headers, rows };

            } else if (type === 'image') {
                content = { caption: fields.querySelector('.content-caption').value };
            } else if (type === 'video') {
                content = { caption: fields.querySelector('.content-caption').value };
            } else if (type === 'carousel') {
                content = { captions: fields.querySelector('.content-carousel-captions').value.split('\n').map(s => s.trim()) };
            } else if (type === 'quote') {
                content = {
                    quote: fields.querySelector('.content-quote').value,
                    attribution: fields.querySelector('.content-attribution').value
                };
            } else if (type === 'head') {
                content = {
                    head: fields.querySelector('.content-head').value,
                    level: fields.querySelector('.content-level').value
                };
            } else if (type === 'list') {
                content = {
                    items: fields.querySelector('.content-list').value.split('\n').map(s => s.trim()),
                    is_ordered: fields.querySelector('.content-is-ordered').checked
                };
            } else if (type === 'embed') {
                content = {
                    url: fields.querySelector('.content-embed-url')?.value || '',
                    caption: fields.querySelector('.content-embed-caption')?.value || '',
                    align: fields.querySelector('.content-embed-align')?.value || 'mx-auto'
                };
            }

            // Prepare FormData for file uploads
            const formData = new FormData();
            formData.append('type', type);
            formData.append('content', JSON.stringify(content));
            // Handle file fields
            if (type === 'image') {
                const imgInput = fields.querySelector('.content-image');
                if (imgInput.files[0]) formData.append('image', imgInput.files[0]);
            }
            if (type === 'video') {
                const vidInput = fields.querySelector('.content-video');
                if (vidInput.files[0]) formData.append('video', vidInput.files[0]);
            }
            if (type === 'carousel') {
                const previewDiv = fields.querySelector('.carousel-preview');
                formData.append('carousel_links', previewDiv.dataset.carousel);

                const mediaInput = fields.querySelector('.content-carousel-media');
                Array.from(mediaInput.files).forEach((file, i) => {
                    formData.append('carousel_media', file);
                });
            }
            // Save (POST for new, PUT for update)
            try {
                let url = `/article/sections/${sectionId}/contents`;
                let method = 'POST';
                if (contentId) {
                    url += `/${contentId}`;
                    method = 'PUT';
                }
                const res = await fetch(url, { method, body: formData });
                if (!res.ok) throw new Error('Save failed');
                showAlert('Content saved!', 'success');
                // Reload contents
                loadContents(sectionId);
            } catch (e) {
                showAlert('Failed to save content.', 'danger');
            }
        }

        async function deleteContent(card, sectionId) {
            const contentId = card.dataset.contentId;
            if (!contentId) {
                card.remove();
                return;
            }
            if (!confirm('Delete this content?')) return;
            try {
                const res = await fetch(`/article/contents/${contentId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Delete failed');
                showAlert('Content deleted.', 'success');
                loadContents(sectionId);
            } catch (e) {
                showAlert('Failed to delete content.', 'danger');
            }
        }

        function addNewContentCard(sectionId) {
            const card = renderContentCard({ type: '', content: {} }, sectionId);
            document.getElementById('contentsContainer').appendChild(card);
        }
        function updateTableContent(table) {
            const headersRow = table.querySelector('.table-headers-row');
            const tableBody = table.querySelector('.table-body');

            const headers = [...headersRow.querySelectorAll('input')].map(input => input.value.trim());
            const rows = [...tableBody.querySelectorAll('tr')].map(tr => {
                return [...tr.querySelectorAll('input')].map(input => input.value.trim());
            });

            const data = { headers, rows };
            table.setAttribute('data-content', JSON.stringify(data));
        }

        function createHeaderInput(table, value = '') {
            const headersRow = table.querySelector('.table-headers-row');
            const tableBody = table.querySelector('.table-body');
            const th = document.createElement('th');
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control header-text';
            input.value = value;

            input.addEventListener('input', () => {
                updateTableContent(table);

                const inputs = headersRow.querySelectorAll('input');
                if (input === inputs[inputs.length - 1] && input.value.trim() !== '') {
                    createHeaderInput(table);
                    updateAllRowsOnHeaderChange(table);
                }
            });

            th.classList.add('bg-primary', 'text-white');
            th.appendChild(input);
            headersRow.appendChild(th);

            tableBody.querySelectorAll('tr').forEach(row => {
                const td = document.createElement('td');
                const tdInput = createCellInput(table);
                td.appendChild(tdInput);
                row.appendChild(td);
            });

            updateTableContent(table);
        }

        function createCellInput(table, value = '') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control td-text';
            input.value = value;

            input.addEventListener('input', () => {
                updateTableContent(table);
                const row = input.closest('tr');
                const inputs = row.querySelectorAll('input');
                const isLastRow = row === table.querySelector('.table-body').lastElementChild;
                const anyFilled = [...inputs].some(inp => inp.value.trim() !== '');
                if (isLastRow && anyFilled) {
                    createRow(table);
                }
            });

            return input;
        }

        function createRow(table, rowData = []) {
            const headersRow = table.querySelector('.table-headers-row');
            const tableBody = table.querySelector('.table-body');
            const headerCount = headersRow.querySelectorAll('input').length;

            const tr = document.createElement('tr');
            for (let i = 0; i < headerCount; i++) {
                const td = document.createElement('td');
                const tdInput = createCellInput(table, rowData[i] || '');
                td.appendChild(tdInput);
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
            updateTableContent(table);
        }

        function updateAllRowsOnHeaderChange(table) {
            const tableBody = table.querySelector('.table-body');
            const headersCount = table.querySelectorAll('.table-headers-row input').length;

            tableBody.querySelectorAll('tr').forEach(row => {
                while (row.children.length < headersCount) {
                    const td = document.createElement('td');
                    const tdInput = createCellInput(table);
                    td.appendChild(tdInput);
                    row.appendChild(td);
                }
            });
        }

// --- ALERTS ---
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = `
                <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
}


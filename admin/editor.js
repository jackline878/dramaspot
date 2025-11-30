
// Utility helpers
const byId = id => document.getElementById(id);
const q = (sel, ctx = document) => ctx.querySelector(sel);
const qa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Elements
const blocksEl = byId('blocks');
const templates = byId('templates');
const addAtEnd = byId('addAtEnd');
const addBlockBtn = byId('addBlockBtn');
const emptyHint = byId('emptyHint');
const saveBtn = byId('saveBtn');
const previewBtn = byId('previewBtn');
const articleTitleEl = byId('articleTitle');
const articleDateEl = byId('articleDate');
const toolbar = byId('toolbar');
const formData = new FormData();
// State
let dragSrcEl = null;
let currentSelectionRange = null;
let isEditing = true;

// Initialize date
function setDateNow() {
    const d = new Date();
    articleDateEl.textContent = d.toLocaleString();
}

// Parse URL params to check for id for editing existing article
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');

// Block registry: maps type => factory function
const registry = {};

// Register block types from templates
(function registerTemplates() {
    const children = templates.content.children;
    for (const node of children) {
        const type = node.getAttribute('data-type');
        if (!type) continue;
        registry[type] = node.cloneNode(true);
    }
})();

// Helpers to create Add-Between UI
function makeAddBetween() {
    const tpl = document.getElementById('addBetweenTemplate');
    return tpl.content.firstElementChild.cloneNode(true);
}
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
// Add a block to the DOM
function addBlock(type, options = {}, beforeNode = null) {
    if (!registry[type]) {
        console.warn('Unknown type', type);
        return;
    }
    const block = registry[type].cloneNode(true);
    // apply options such as setting srcs, captions, etc.
    if (options.content) {

        if (type === 'text') {
            const editable = block.querySelector('[contenteditable="true"]');
            if (editable) {
                editable.innerHTML = String(options.content);
                placeCaretAtEnd(editable);
            }
        }

        if (type === 'head') {
            const editable = block.querySelector('[contenteditable="true"]');
            if (editable) {
                editable.innerHTML = String(options.content);
                placeCaretAtEnd(editable);
            }
        }
        if (type === 'table') {
            const temp = document.createElement('div');
            temp.innerHTML = options.content;
            const wrapper = temp.querySelector('.table-wrapper');
            wrapper.querySelectorAll('td, th').forEach(cell => {
                cell.setAttribute('contenteditable', 'true');
            });
            if (wrapper) {
                block.querySelector('table').replaceWith(wrapper);
                placeCaretAtEnd(wrapper);
            }
        }
        if (type === 'list') {
            const temp = document.createElement('div');
            temp.innerHTML = options.content;
            // find ul or ol
            const list = temp.querySelector('ul, ol');
            if (list) {
                block.querySelector('ul, ol').replaceWith(list);
                // make list contenteditable
                list.setAttribute('contenteditable', 'true');

                // place caret at end
                placeCaretAtEnd(list);
            }
        }

        if (type === 'quote') {
            const temp = document.createElement('div');
            temp.innerHTML = options.content;
            // find blockquote
            const blockquote = temp.querySelector('blockquote');
            if (blockquote) {
                block.querySelector('blockquote').replaceWith(blockquote);
                // make blockquote contenteditable
                blockquote.setAttribute('contenteditable', 'true');

                // place caret at end
                placeCaretAtEnd(blockquote);
            }
        }
    }
    //embed
    if (options.embed) {
        const embed = block.querySelector('.embedFrame');
        if (embed) embed.innerHTML = options.embed;
        //store options.data for saving
        block.dataset.embedData = JSON.stringify(options.data || {});
    }

    if (options.table) {
        const temp = document.createElement('div');
        temp.innerHTML = options.table;
        console.log(options.table);

        let table = temp.querySelector('table');
        if (table) {
            // enforce min/max width per cell
            table.querySelectorAll('td, th').forEach(cell => {
                cell.style.minWidth = "100px";
                cell.style.maxWidth = "200px";
                cell.style.wordBreak = "break-word";
            });

            // wrap the table inside a scrollable container
            const wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper'
            wrapper.style.overflowX = "auto";
            wrapper.style.display = "block";
            wrapper.style.width = "100%";
            wrapper.style.maxHeight = "400px";      // ⬅ keep wrapper inside page
            wrapper.style.maxWidth = "100%";    // ⬅ prevent pushing body
            wrapper.style.boxSizing = "border-box";

            // make table only as wide as needed
            table.style.width = "max-content";  // ⬅ table takes natural width
            table.style.maxWidth = "100%";      // ⬅ don’t exceed wrapper width

            wrapper.appendChild(table);

            // replace old table with scrollable wrapper
            block.querySelector('table').replaceWith(wrapper);

            // lock editing on table
            table.setAttribute('contenteditable', 'false');

            // place caret after wrapper
            placeCaretAtEnd(wrapper);
        }
    }


    // apply image src if provided, else leave placeholders
    if (options.image) {
        const img = block.querySelector('img');
        if (img) img.src = options.image.image;
        const a = block.querySelector('a.img-link');
        if (a) {
            a.href = options.href || options.image.image;
        }
        const caption = block.querySelector('figcaption');
        caption.textContent = options.image.caption
    }
    // audio / video / iframe src
    if (options.video) {
        console.log('Setting video src', options.video);
        const source = block.querySelector('source');
        if (source) source.src = options.video.video || options.video.src;
    }
    if (options.map) {
        const map = block.querySelector('.map');
        if (map) {
            map.innerHTML = '<div class="muted">Map: ' + options.map + '</div>';
            map.setAttribute('data-coords', options.map);
        }
    }

    // headings
    if (options.head) {
        if (options.level) {
            const editable = block.querySelector('[contenteditable="true"]');
            let h = document.createElement(`h${options.level}`);
            if (!h) h = document.createElement(`h3`);
            if (h) h.textContent = options.head;
            editable.innerHTML = h.outerHTML;
        } else {
            const h = block.querySelector('h3');
            if (h) h.textContent = options.head;
        }
    }
    // text
    if (options.text) {
        const p = block.querySelector('p');
        if (p) p.textContent = options.text;
    }

    if (options.list) {
        if (options.list.isOrdered) {
            const ol = document.createElement('ol');
            (options.list.items || []).forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ol.appendChild(li);
            });
            //make li contenteditable
            ol.setAttribute('contenteditable', 'true');
            block.querySelector('ul').replaceWith(ol);
        } else {
            (options.list || []).forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                block.querySelector('ul').appendChild(li);
            });
        };
    }

    if (options.quote) {
        block.querySelector('blockquote').innerHTML = `
                  <p class="mb-0">${options.quote.quote}</p>
          <footer class="blockquote-footer">${options.quote.attribution}</footer>
        `
    }

    if (options.id) {
        block.setAttribute('data-id', options.id);
    }


    // add between buttons before block
    const between = makeAddBetween();


    // remove empty hint
    if (emptyHint) emptyHint.style.display = 'none';

    const widget = document.createElement('div');
    widget.className = 'widget';

    between.querySelector('[data-add]').addEventListener('click', () => openAddMenu(widget));

    widget.appendChild(block);
    widget.appendChild(between);


    if (beforeNode) {
        insertAfter(widget, beforeNode);
    } else {
        blocksEl.prepend(widget);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-light-outline float-end ms-2 text-danger block-delete';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this block?')) {
            widget.remove();
            // if no blocks left, show empty hint
            if (!blocksEl.querySelector('.widget')) {
                emptyHint.style.display = 'block';
            }
        }
    });
    const controls = block.querySelector('.block-controls');
    if (controls) controls.prepend(deleteBtn);


    attachBlockEvents(block);
    return block;
}

// Attach per-block events: drag handlers, controls, contenteditable focus handling
function attachBlockEvents(block) {
    // drag start / end
    block.addEventListener('dragstart', (e) => {
        dragSrcEl = block;
        block.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', '') } catch (e) { }
    });
    block.addEventListener('dragend', () => {
        block.classList.remove('dragging');
        dragSrcEl = null;
    });

    // dragover on block to reorder
    block.addEventListener('dragover', (e) => {
        e.preventDefault();
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const insertBefore = y < rect.height / 2;
        // show placeholder indicator
        const existingBetween = target.previousSibling && target.previousSibling.classList && target.previousSibling.classList.contains('add-between') ? target.previousSibling : null;
        if (insertBefore) {
            if (existingBetween) {
                // fine
            } else {
                const b = makeAddBetween();
                b.querySelector('[data-add]').addEventListener('click', () => openAddMenu(target));
                blocksEl.insertBefore(b, target);
            }
        } else {
            // after: ensure next between exists
            const nextBetween = target.nextSibling && target.nextSibling.classList && target.nextSibling.classList.contains('add-between') ? target.nextSibling : null;
            if (!nextBetween) {
                const b = makeAddBetween();
                b.querySelector('[data-add]').addEventListener('click', () => openAddMenu(target.nextSibling));
                blocksEl.insertBefore(b, target.nextSibling);
            }
        }
    });

    // Insert contextual toolbar on text selection
    block.addEventListener('mouseup', () => {
        setTimeout(() => {
            const sel = window.getSelection();
            if (sel && sel.toString().trim()) {
                currentSelectionRange = sel.getRangeAt(0).cloneRange();
                toolbar.style.display = 'flex';
            } else {
                currentSelectionRange = null;
                toolbar.style.display = 'none';
            }
        }, 50);
    });

    // Controls buttons (edit/settings)
    const controls = block.querySelectorAll('.block-controls [data-type]');
    controls.forEach(btn => {
        btn.addEventListener('click', (ev) => {
            const t = btn.getAttribute('data-type');
            handleBlockControl(block, t);
        });
    });

    // Make editable placeholders nicer
    const editables = block.querySelectorAll('[contenteditable="true"]');
    editables.forEach(el => {
        el.addEventListener('focus', () => {
            el.classList.add('focused');
        });
        el.addEventListener('blur', () => {
            el.classList.remove('focused');
        });
    });

    // allow linking images by clicking them with Ctrl
    const imgs = block.querySelectorAll('img');
    imgs.forEach(img => {
        img.addEventListener('dblclick', (e) => {
            // double click to add link (prompt)
            const url = prompt('Enter URL to link this image (leave blank to remove):', img.closest('a') ? img.closest('a').href : '');
            if (url === null) return;
            let a = img.closest('a');
            if (!a) {
                a = document.createElement('a');
                a.className = 'img-link';
                a.target = '_blank';
                img.parentNode.insertBefore(a, img);
                a.appendChild(img);
            }
            if (url.trim() === '') {
                // remove link
                const parent = a.parentNode;
                parent.insertBefore(img, a);
                parent.removeChild(a);
            } else {
                a.href = url;
            }
        });
    });

    // attach click to whole block to allow editing
    block.addEventListener('click', (e) => {
        // do not steal clicks from controls
        if (e.target.closest('.block-controls')) return;
        // If it's a media block, allow editing via prompt
        const type = block.getAttribute('data-type');
        if (type === 'image') {
            // click the image to edit via prompt
            const img = block.querySelector('img');
            if (img && e.target === img) {
                const url = prompt('Image URL:', img.src);
                if (url !== null && url.trim() !== '') img.src = url;
            }
        }
    });
}


// Insert block menu: shows list of types (we use prompt to choose so no inputs on main UI)
function openAddMenu(beforeNode = null) {
    const modalEl = document.getElementById('blockTypeModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    const confirmBtn = document.getElementById('confirmAddBlock');

    // Clean up old listener
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    const newConfirmBtn = document.getElementById('confirmAddBlock');

    newConfirmBtn.addEventListener('click', () => {
        const select = document.getElementById('blockTypeSelect');
        const choice = (select.value || '').toLowerCase().trim();

        if (!choice) {
            alert('Please select a block type.');
            return;
        }
        if (choice === 'cancel') return;
        if (!registry[choice]) {
            alert('Unknown type: ' + choice);
            return;
        }

        const mediaTypes = ['image', 'video', 'audio', 'embed', 'carousel', 'gallery', 'map'];
        const options = {};

        if (mediaTypes.includes(choice)) {
            if (choice === 'carousel' || choice === 'gallery') {
                const urls = prompt('Enter comma-separated image URLs:');
                if (urls) {
                    options.src = urls.split(',')[0].trim();
                    options.content = urls;
                }
                addBlock(choice, options, beforeNode);

            } else if (choice === 'image') {
                const image = prompt('Enter image URL:');
                const caption = prompt('Enter image caption (optional):', '');
                if (image) options.image = { image, caption };
                addBlock(choice, options, beforeNode);

            } else if (choice === 'video') {
                const video = prompt('Enter embed URL (iframe src):', 'https://www.youtube.com/embed/');
                if (video) options.video = { video };
                addBlock(choice, options, beforeNode);

            } else if (choice === 'embed') {
                // Open embed modal
                const embedModalEl = document.getElementById('embedModal');
                const embedModal = new bootstrap.Modal(embedModalEl);
                embedModal.show();

                const saveBtn = document.getElementById('saveEmbed');
                saveBtn.replaceWith(saveBtn.cloneNode(true));
                const newSaveBtn = document.getElementById('saveEmbed');

                newSaveBtn.addEventListener('click', async () => {
                    const url = document.getElementById('embedUrl').value;
                    const caption = document.getElementById('embedCaption').value || '';

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

                    addBlock(choice, options, beforeNode);

                    embedModal.hide();
                    document.getElementById('embedForm').reset();

                    // Close the block type modal
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    modalInstance.hide();
                });

                return; // 🚨 stop here, wait for embed modal
            } else if (choice === 'audio') {
                const url = prompt('Enter audio URL:');
                if (url) options.audio = url;
                addBlock(choice, options, beforeNode);

            } else if (choice === 'map') {
                const coords = prompt('Enter coordinates or place name:');
                if (coords) options.map = coords;
                addBlock(choice, options, beforeNode);

            }
        } else {
            if (choice === 'table') {
                const rowCount = prompt('Enter number of rows:');
                const columnCount = prompt('Enter number of columns:');

                let rows = [];
                let columns = [];


                while (rows.length < rowCount) {
                    rows.push(rows.length);
                }

                while (columns.length < columnCount) {
                    columns.push(columns.length);
                }

                console.log(rows);

                const table = document.createElement('table');
                table.className = 'table table-bordered table-striped table-hover align-middle text-center'
                table.innerHTML = `

          <thead>
            <tr>${columns.map(c => `<th contenteditable="true"></th>`).join('')}</tr>
          </thead>
          <tbody>
          ${rows.map(r => `<tr>${columns.map(c =>
                    `<td contenteditable="true"></td>`).join('')}</tr>`
                ).join('')
                    }
          </tbody>
        
                `;

                options.table = table.outerHTML;
            }


            // Non-media block types
            addBlock(choice, options, beforeNode);
        }

        // Close the block type modal
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();
    });
}

// Place caret at end helper
function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    }
}

// Toggle edit mode
function setEditing(on) {
    isEditing = !!on;
    // toggle contenteditable attributes across page
    qa('[contenteditable]').forEach(e => {
        if (e.closest('.block')) {
            // Keep block editing state as-is (we do not want to disable figure captions)
            if (on) e.setAttribute('contenteditable', 'true');
            else e.setAttribute('contenteditable', 'false');
        }
    });
    // visual cue
    if (on) toolbar.style.display = 'flex'; else toolbar.style.display = 'none';
}

function removeEdit(el) {

    if (el) {
        el.removeAttribute("contenteditable");     // removes only "m-0" but keeps other classes
        el.removeAttribute("data-placeholder");
    }
    return;
}

function addEdit(el, placeholder = "Type here...") {
    if (el) {
        el.setAttribute("contenteditable", "true");
    }
    return;
}

// Save article: collect title, date, author, blocks content -> JSON
async function collectArticle() {

    const blocks = [];

    let order = 1;

    // iterate blocks in order; skip add-between divs
    const children = Array.from(blocksEl.children);
    for (const widget of children) {

        if (!widget.classList || !widget.classList.contains('widget')) continue;
        let node = widget.querySelector('.block');
        if (!node.classList || !node.classList.contains('block')) continue;
        let type = node.getAttribute('data-type');
        const blockData = { type, data: {} };


        let content = {};
        const id = node.getAttribute('data-id');
        // collect different types
        switch (type) {
            case 'text':
                type = 'text';
                content = { html: node.querySelector('[contenteditable="true"]').innerHTML };
                break;
            case 'head':
                type = 'head';
                content = { html: node.querySelector('[contenteditable="true"]').innerHTML };
                break;
            case 'list':
                type = 'list';

                content = {
                    html: '',
                };
                let listData = node.querySelector('ul');
                if (!listData) {
                    listData = node.querySelector('ol');
                }

                removeEdit(listData);
                content.html = listData.outerHTML;
                break;
            case 'quote':
                type = 'quote';
                const quoteData = node.querySelector('blockquote');
                removeEdit(quoteData);
                content = {
                    html: quoteData ? quoteData.outerHTML : '',
                };
                break;
            case 'carousel':
                blockData.data.slides = Array.from(node.querySelectorAll('.carousel img')).map(i => i.src);
                break;
            case 'image':
                const imgInput = node.querySelector('#imageUploadInput');
                if (imgInput) {
                    formData.append(`image-${order}`, imgInput.files[0]);
                }
                content = {
                    caption: node.querySelector('figcaption')?.innerText,
                    image: node.querySelector('img')?.src,
                    link: node.querySelector('a')?.href || ''
                };
                break;
            case 'video':
                const vidInput = node.querySelector('#videoUploadInput');
                if (vidInput) {
                    formData.append(`video-${order}`, vidInput.files[0]);
                }
                content = {
                    caption: '',
                    video: node.querySelector('source')?.src
                };
                break;
            case 'audio':
                blockData.data.src = node.querySelector('audio')?.src;
                break;
            case 'embed':
                content = JSON.parse(node.dataset.embedData || '{}') || {};
                break;
            case 'drop-button':
                const html = node.querySelector('[contenteditable="true"]');
                removeEdit(html);
                content = {
                    html: html ? html.outerHTML : '',
                };
                break;
            case 'html':
                blockData.data.html = node.querySelector('pre, iframe, .embedFrame')?.outerHTML || node.querySelector('.block-content')?.innerHTML;
                break;
            case 'table':

                const wrapper = node.querySelector('.table-wrapper');
                wrapper.querySelectorAll('[contenteditable="true"]').forEach(cell => {
                    removeEdit(cell);
                });
                content = {
                    html: wrapper ? wrapper.outerHTML : '',
                };
                break;
            case 'code':
                blockData.data.code = node.querySelector('.code-block')?.textContent;
                break;
            case 'button':
                blockData.data.text = node.querySelector('.btn')?.innerText;
                blockData.data.href = node.querySelector('.btn')?.href;
                break;
            case 'form':
                blockData.data.html = node.querySelector('.block-content')?.innerHTML;
                break;
            case 'gallery':
                blockData.data.images = Array.from(node.querySelectorAll('.gallery img')).map(i => ({ src: i.src, caption: i.nextElementSibling ? i.nextElementSibling.innerText : '' }));
                break;
            case 'map':
                blockData.data.coords = node.querySelector('.map')?.getAttribute('data-coords') || '';
                break;
            case 'poll':
            case 'slider':
            case 'ad':
                content = {
                    html: '',
                };
                break;
            case 'countdown':
                blockData.data.target = node.querySelector('[data-countdown]')?.textContent || '';
                break;
            case 'faq':
                blockData.data.html = node.querySelector('.faq-item')?.innerHTML || '';
                break;
            case 'testimonial':
                blockData.data.html = node.querySelector('blockquote')?.innerHTML || '';
                break;
            case 'timeline':
                blockData.data.items = Array.from(node.querySelectorAll('.timeline-item')).map(i => i.innerText);
                break;
            case 'stat':
                blockData.data.value = node.querySelector('.h3')?.innerText;
                blockData.data.label = node.querySelector('.muted')?.innerText;
                break;
            case 'cta':
                blockData.data.html = node.querySelector('.cta-block')?.innerHTML;
                break;
            case 'announcement':
                blockData.data.html = node.querySelector('.announcement')?.innerHTML;
                break;
            case 'infobox':
                blockData.data.html = node.querySelector('.announcement')?.innerHTML;
                break;
            default:
                blockData.data.html = node.querySelector('.block-content')?.innerHTML;
                break;
        }

        blocks.push({ type, content, order, id });
        order++;
    }

    const article = {
        blocks
    };
    return article;
}

function showPleaseWait() {
    document.getElementById("pleaseWaitOverlay").classList.remove("d-none");
}

function hidePleaseWait() {
    document.getElementById("pleaseWaitOverlay").classList.add("d-none");
}

// Save to server or download fallback
async function saveArticle() {
    const article = await collectArticle();

    console.log('Collected article:', article);

    formData.append('article', JSON.stringify(article));

    showPleaseWait();
    try {
        const res = await fetch(`/article/content/update?articleId=${articleId}`, {
            method: 'PUT',
            body: formData
        });
        if (res.ok) {
            const data = await res.json();
            alert(data.message || 'Article saved successfully.');
            window.location.reload();
        }
    } catch (e) {
        alert('Error saving article: ' + e.message);
        console.error(e);
    } finally {
        hidePleaseWait();
    }
}
function htmlToText(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
}

async function generateEmbedHTML(contentData) {
    const link = contentData.url || '';
    const caption = contentData.caption || '';
    const align = contentData.align || 'mx-auto';
    const captionHTML = caption ? `<p class="text-muted small text-center">${caption}</p>` : '';

    if (link && link.startsWith('https://dramaspots.com/music/')) {
        return link;
    }

    if (link && link.startsWith('https://dramaspots.com/article/')) {
        return link;
    }


    if (/youtube\.com|youtu\.be/.test(link)) {
        const videoIdMatch = link.match(
            /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        const videoId = videoIdMatch?.[1];

        if (!videoId) return `<p class="text-danger">Invalid YouTube link.</p>`;


        return `
      <div class="ratio ratio-16x9 mb-3 ${align}">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          title="${caption || 'YouTube video'}"
          allowfullscreen 
          frameborder="0"
          loading="lazy"
          class="rounded shadow-sm">
        </iframe>
      </div>
      ${captionHTML}
    `;
    }

    // Twitter Embed
    if (/twitter\.com\/[^/]+\/status\/\d+/.test(link)) {
        return `
      <blockquote class="twitter-tweet">
        <a href="${link}"></a>
      </blockquote>
      <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      ${captionHTML}
    `;
    }

    // Instagram Embed
    if (/instagram\.com\/p\/[a-zA-Z0-9_-]+/.test(link)) {
        return `
      <blockquote class="instagram-media" 
                  data-instgrm-permalink="${link}" 
                  data-instgrm-version="14" 
                  style="background:#FFF; border:0; margin: 1rem auto;">
      </blockquote>
      <script async src="//www.instagram.com/embed.js"></script>
      ${captionHTML}
    `;
    }

    // Facebook Embed
    // Facebook Embed
    if (/facebook\.com/.test(link)) {
        // Case 1: raw iframe HTML string
        if (/<iframe\s[^>]*src=["']([^"']+)["']/i.test(link)) {
            const src = link.match(/<iframe\s[^>]*src=["']([^"']+)["']/i)?.[1];
            return `
      <div class="ratio ratio-16x9 mb-3 ${align}">
        <iframe 
          src="${src}" 
          width="100%" 
          height="400" 
          frameborder="0" 
          allowfullscreen 
          scrolling="no"
          class="rounded shadow-sm border"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
        </iframe>
      </div>
      ${captionHTML}
    `;
        }

        // Case 2: Regular Facebook post URL
        if (/facebook\.com\/[^/]+\/posts\/\d+/.test(link)) {
            return `
      <div id="fb-root"></div>
      <script async defer crossorigin="anonymous" 
        src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0">
      </script>
      <div class="fb-post" data-href="${link}" data-width="500"></div>
      ${captionHTML}
    `;
        }

        // ✅ Case 3: fb.watch short URL — convert to embeddable video
        if (/fb\.watch\/[a-zA-Z0-9_-]+/i.test(link)) {
            const encodedUrl = encodeURIComponent(link);
            return `
      <div class="mb-3 ${align}" style="max-width: 100%; overflow: hidden;">
        <iframe 
          src="https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=500" 
          width="100%" height="300"
          style="border:none;overflow:hidden" 
          scrolling="no" frameborder="0" 
          allowfullscreen="true" 
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          class="rounded shadow-sm">
        </iframe>
      </div>
      ${captionHTML}
    `;
        }


        if (/<[a-z][\s\S]*>/i.test(contentData.url)) {
            const captionHTML = contentData.caption ? `<p class="text-muted small text-center">${contentData.caption}</p>` : '';
            return `
    <div class="mb-3 ${contentData.align || 'mx-auto'}" style="max-width: 100%; overflow: hidden;">
      <div class="ratio ratio-16x9">
        ${contentData.url}
      </div>
    </div>
    ${captionHTML}
  `;
        }

    }


    return `<p class="text-danger">Unsupported embed link.</p>`;
}
// Render article object to editor
async function renderArticle(article) {
    // set title
    if (article.title) articleTitleEl.innerText = article.title;
    if (article.author) byId('authorName').innerText = article.author.username || article.author.name || 'Unknown';
    if (article.published_at) articleDateEl.innerText = article.published_at ? new Date(article.published_at).toLocaleString() : '';
    if (article.author) byId('authorPic').innerHTML = `
    <picture>
    <source srcset="/image/convert?url=${article.author.profile_pic}&format=avif" type="image/avif">
    <source srcset="/image/convert?url=${article.author.profile_pic}&format=webp" type="image/webp">
    <img src="${article.author.profile_pic}" alt="author" class="author-img me-2">
    </picture>
    `;
    if (article.read_duration) byId('readDuration').innerText = article.read_duration + ' min read';
    if (article.hashtags && article.hashtags.length) {
        article.hashtags.forEach(tag => {
            const tagEl = document.createElement('a');
            tagEl.className = 'text-decoration-none';
            tagEl.href = `/hashtag/${tag.name}`;
            tagEl.innerHTML = `<span class="tag m-1 px-1">#${tag.name}</span>`;
            byId('articleTags').appendChild(tagEl);
        });
    }
    // clear blocks
    blocksEl.innerHTML = '';
    if (article.contents && article.contents.length) {

        article.contents.sort((a, b) => b.order - a.order);
        for (const b of article.contents) {
            const type = b.type;
            const options = {};
            b.contents = JSON.parse(b.content || '{}');
            if (b.contents) {
                options.id = b.id;
                if (b.contents.src) options.src = b.contents.src;
                if (b.contents.html) options.content = b.contents.html;
                if (b.contents.head) options.head = htmlToText(b.contents.head);
                if (b.contents.text) options.text = htmlToText(b.contents.text);
                if (b.contents.image) options.image = b.contents;
                if (b.contents.video || b.type === 'video') options.video = b.contents;
                if (type === 'embed' && b.contents.url) {
                    options.embed = await generateEmbedHTML(b.contents);
                    options.data = b.contents
                }
                if (b.contents.slides) options.content = (b.contents.slides || []).join(',');
                if (b.contents.images) options.content = (b.contents.images || []).map(x => x.src).join(',');
                if (b.contents.target) options.content = b.contents.target;
                if (b.contents.coords) options.map = b.contents.coords;
            }
            addBlock(type, options);
        }
    } else if (article.sections && article.sections.length) {

        article.sections.sort((a, b) => b.order - a.order);
        for (const s of article.sections) {
            s.contents.sort((a, b) => b.id - a.id);
            for (const b of s.contents) {
                const type = b.type;
                const options = {};
                b.contents = JSON.parse(b.content || '{}');
                if (b.contents) {
                    // console.log(b.contents);

                    if (b.contents.src) options.src = b.contents.src;
                    if (b.contents.html) options.content = b.contents.html;
                    if (b.contents.quote) options.quote = b.contents;
                    if (b.type === 'list') options.list = b.contents;
                    if (b.type === 'table') {


                        const table = document.createElement('table');
                        table.className = 'table table-bordered table-striped table-hover align-middle text-center'
                        table.innerHTML = `

                            <thead>
                                <tr>${(Array.isArray(b.contents.headers) || ['new']).map(h => `<th contenteditable="true">${h}</th>`).join('')}</tr>
                            </thead>
                            <tbody>
                            ${Array.isArray(b.contents.rows) ? b.contents.rows.map(row => `<tr>${row.map(cell =>
                            `<td contenteditable="true">${cell}</td>`).join('')}</tr>`
                        ).join('') : ''}
                            </tbody>
        
                `;

                        options.table = table.outerHTML;
                    }
                    if (b.contents.head) {
                        options.head = htmlToText(b.contents.head);
                        options.level = b.contents.level;
                    }
                    if (b.contents.text) options.text = htmlToText(b.contents.text);
                    if (b.contents.image) options.image = b.contents;
                    if (b.contents.video) options.video = b.contents;
                    if (type === 'embed' && b.contents.url) {
                        options.embed = await generateEmbedHTML(b.contents);
                        options.data = b.contents
                    }
                    if (b.contents.slides) options.content = (b.contents.slides || []).join(',');
                    if (b.contents.images) options.content = (b.contents.images || []).map(x => x.src).join(',');
                    if (b.contents.target) options.content = b.contents.target;
                    if (b.contents.coords) options.map = b.contents.coords;
                }
                addBlock(type, options);
            }
        }
    } else {

        blocksEl.appendChild(emptyHint);
        emptyHint.style.display = 'block';
        hidePleaseWait();
        return;
    }
    hidePleaseWait();
    return;
}

// Load article by id: attempt to GET /articles.json and search id
async function loadArticleById(id) {
    try {
        const articleRes = await fetch(`/article/id/edit/${id}`);
        if (!articleRes.ok) throw new Error('Failed to fetch article');
        const article = await articleRes.json();

        if (article) {
            renderArticle(article);
        } else {
            alert('Article id not found in /articles.json. You may still create a new article.');
        }
    } catch (err) {
        console.warn('Failed to load articles.json', err);
        alert('Unable to load /articles.json. If you are offline, create article locally.');
    }
}

// Basic toolbar actions
function execCommand(cmd, value = null) {
    document.execCommand(cmd, false, value);
}

// toolbar buttons
byId('boldBtn').addEventListener('click', () => execCommand('bold'));
byId('italicBtn').addEventListener('click', () => execCommand('italic'));
byId('underlineBtn').addEventListener('click', () => execCommand('underline'));
byId('highlightBtn').addEventListener('click', () => {
    const color = prompt('Highlight color (CSS):', 'yellow');
    if (!color) return;
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    span.appendChild(currentSelectionRange.cloneContents());
    // replace selection with span
    const sel = window.getSelection();
    if (sel.rangeCount) {
        sel.deleteFromDocument();
        sel.getRangeAt(0).insertNode(span);
    }
});
byId('linkBtn').addEventListener('click', () => {
    const url = prompt('Enter URL:', 'https://');
    if (!url) return;
    execCommand('createLink', url);
});
byId('codeWrapBtn').addEventListener('click', () => {
    const sel = window.getSelection();
    if (!sel || !sel.toString()) return;
    const pre = document.createElement('pre');
    pre.className = 'code-block';
    pre.textContent = sel.toString();
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(pre);
});
byId('deleteSelectionBtn').addEventListener('click', () => {
    const sel = window.getSelection();
    if (sel && sel.toString()) {
        execCommand('delete');
    } else {
        // if no selection, delete nearest block
        const active = document.activeElement;
        const block = active && active.closest ? active.closest('.block') : null;
        if (block) {
            const between = block.previousSibling && block.previousSibling.classList && block.previousSibling.classList.contains('add-between') ? block.previousSibling : null;
            if (between) between.remove();
            block.remove();
        }
    }
});
byId('insertHrBtn').addEventListener('click', () => {
    const hr = document.createElement('hr');
    if (currentSelectionRange) {
        currentSelectionRange.insertNode(hr);
    } else {
        blocksEl.appendChild(hr);
    }
});

// Add block top / end
addBlockBtn.addEventListener('click', () => openAddMenu());
addAtEnd.addEventListener('click', () => openAddMenu(null));

// Toggle edit mode
byId('toggleEditView').addEventListener('click', () => {
    setEditing(!isEditing);
    alert('Edit mode ' + (isEditing ? 'on' : 'off'));
});

// Clear blocks
byId('clearBlocks').addEventListener('click', () => {
    if (!confirm('Clear all blocks?')) return;
    blocksEl.innerHTML = '';
    blocksEl.appendChild(emptyHint);
    emptyHint.style.display = 'block';
});

// Save button
saveBtn.addEventListener('click', async () => {
    await saveArticle();
});

// Escape HTML for preview
function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); execCommand('bold'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); execCommand('italic'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveArticle(); }
    if (e.key === 'Escape') { toolbar.style.display = 'none'; currentSelectionRange = null; }
});

// Drag and drop reorder finalizer
blocksEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.block');
    if (!dragSrcEl) return;
    if (target && target !== dragSrcEl) {
        // insert before or after depending on mouse position
        const rect = target.getBoundingClientRect();
        const insertBefore = e.clientY - rect.top < rect.height / 2;
        // remove old between markers
        const betweenPrev = dragSrcEl.previousSibling && dragSrcEl.previousSibling.classList && dragSrcEl.previousSibling.classList.contains('add-between') ? dragSrcEl.previousSibling : null;
        const betweenNext = dragSrcEl.nextSibling && dragSrcEl.nextSibling.classList && dragSrcEl.nextSibling.classList.contains('add-between') ? dragSrcEl.nextSibling : null;
        if (betweenPrev) betweenPrev.remove();
        if (betweenNext) betweenNext.remove();

        if (insertBefore) {
            blocksEl.insertBefore(dragSrcEl, target);
        } else {
            blocksEl.insertBefore(dragSrcEl, target.nextSibling);
        }
        // tidy: ensure there is an add-between after each block
        tidyBetweenButtons();
    }
});

function tidyBetweenButtons() {
    // remove all existing add-betweens and re-insert between every block
    qa('.add-between', blocksEl).forEach(n => n.remove());
    const blockNodes = Array.from(blocksEl.querySelectorAll('.block'));
    if (blockNodes.length === 0) {
        blocksEl.appendChild(emptyHint);
        emptyHint.style.display = 'block';
    } else {
        emptyHint.style.display = 'none';
        for (const b of blockNodes) {
            const between = makeAddBetween();
            between.querySelector('[data-add]').addEventListener('click', () => openAddMenu(b));
            blocksEl.insertBefore(between, b);
        }
        // move existing blocks into final order: remove duplicates
        // this function assumes blocks are already in order
    }
}

// initialize default empty editor with an example paragraph
function initEditor() {
    // if articleId passed -> try load article
    if (articleId) {

        showPleaseWait();
        loadArticleById(articleId);
    } else {
        // initial example content
        blocksEl.appendChild(emptyHint);
        emptyHint.style.display = 'block';
    }

    // global clicks to hide toolbar if clicked outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.floating-toolbar')) {
            // if click outside toolbar AND selection is empty hide
            const sel = window.getSelection();
            if (!sel || !sel.toString()) {
                toolbar.style.display = 'none';
            }
        }
    });

    // periodic update countdown blocks
    setInterval(() => {
        qa('[data-countdown]').forEach(el => {
            const block = el.closest('.block');
            updateCountdownBlock(block);
        });
    }, 1000);
}

function updateCountdownBlock(block) {
    try {
        const target = block.querySelector('[data-countdown]').textContent.trim();
        if (!target) return;
        const t = new Date(target);
        const now = new Date();
        const diff = t - now;
        const disp = block.querySelector('[data-countdown-display]');
        if (!disp) return;
        if (diff <= 0) {
            disp.textContent = 'Event passed';
            return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        disp.textContent = `${d}d ${h}h ${m}m ${s}s`;
    } catch (e) { }
}

// expose simple API for importing JSON quickly (paste)
window.importArticleJSON = function (json) {
    try {
        const parsed = typeof json === 'string' ? JSON.parse(json) : json;
        renderArticle(parsed);
    } catch (e) {
        alert('Invalid JSON');
    }
};

// Initialize editor
initEditor();

// ensure contenteditable isolation for preview / focus
setEditing(true);

// small helper to ensure empty placeholders visually distinct
document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (el && el.getAttribute && el.getAttribute('contenteditable') === 'true') {
        el.classList.add('focus-editable');
    }
});
document.addEventListener('focusout', (e) => {
    const el = e.target;
    if (el && el.getAttribute && el.getAttribute('contenteditable') === 'true') {
        el.classList.remove('focus-editable');
    }
});

// Expose function to add block programmatically
window.addBlockByType = addBlock;


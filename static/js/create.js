/**
 * CalShare - Create Calendar Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // State
    let events = [];
    let eventCounter = 0;
    
    // DOM Elements
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const processingStatus = document.getElementById('processing-status');
    const statusText = document.getElementById('status-text');
    const pasteText = document.getElementById('paste-text');
    const parseTextBtn = document.getElementById('parse-text-btn');
    const eventsContainer = document.getElementById('events-container');
    const addEventBtn = document.getElementById('add-event-btn');
    const eventsPreview = document.getElementById('events-preview');
    const eventsList = document.getElementById('events-list');
    const eventCount = document.getElementById('event-count');
    const clearEventsBtn = document.getElementById('clear-events-btn');
    const createBtn = document.getElementById('create-btn');
    const successModal = document.getElementById('success-modal');
    const calendarNameInput = document.getElementById('calendar-name');
    const calendarDescInput = document.getElementById('calendar-description');
    const customSlugInput = document.getElementById('custom-slug');
    
    /**
     * File Upload Handling
     */
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    async function handleFileUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Show processing state
        uploadArea.classList.remove('success', 'error');
        uploadArea.innerHTML = `
            <div class="upload-content">
                <div class="upload-icon">📄</div>
                <p class="upload-text">${escapeHtml(file.name)}</p>
                <p class="upload-subtext">Uploading...</p>
            </div>
        `;
        
        processingStatus.style.display = 'flex';
        statusText.textContent = 'Processing with AI...';
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (data.events && data.events.length > 0) {
                    // Add events
                    events = data.events.map(evt => ({
                        ...evt,
                        uid: evt.uid || generateUID()
                    }));
                    
                    uploadArea.classList.add('success');
                    uploadArea.innerHTML = `
                        <div class="upload-content">
                            <div class="upload-icon">✅</div>
                            <p class="upload-text">${events.length} events extracted from ${escapeHtml(file.name)}</p>
                            <p class="upload-subtext">Click to upload a different file</p>
                        </div>
                    `;
                    
                    // Try to set calendar name from filename
                    if (!calendarNameInput.value) {
                        const nameFromFile = file.name.replace(/\.[^/.]+$/, '');
                        calendarNameInput.value = nameFromFile;
                    }
                } else {
                    uploadArea.classList.add('error');
                    uploadArea.innerHTML = `
                        <div class="upload-content">
                            <div class="upload-icon">⚠️</div>
                            <p class="upload-text">No events found in ${escapeHtml(file.name)}</p>
                            <p class="upload-subtext">${data.message || 'Try a different file or enter events manually'}</p>
                        </div>
                    `;
                }
                
                updateEventsPreview();
                updateCreateButton();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            uploadArea.classList.add('error');
            uploadArea.innerHTML = `
                <div class="upload-content">
                    <div class="upload-icon">❌</div>
                    <p class="upload-text">Error processing file</p>
                    <p class="upload-subtext">${escapeHtml(error.message)}</p>
                </div>
            `;
        } finally {
            processingStatus.style.display = 'none';
        }
    }
    
    /**
     * Text Parsing
     */
    parseTextBtn.addEventListener('click', async function() {
        const text = pasteText.value.trim();
        if (!text) {
            alert('Please paste some schedule text first.');
            return;
        }
        
        parseTextBtn.disabled = true;
        parseTextBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;margin-right:0.5rem;"></span> Processing...';
        
        try {
            const response = await fetch('/parse-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            
            const data = await response.json();
            
            if (data.success && data.events.length > 0) {
                events = data.events.map(evt => ({
                    ...evt,
                    uid: evt.uid || generateUID()
                }));
                
                pasteText.value = '';
                updateEventsPreview();
                updateCreateButton();
            } else if (data.events.length === 0) {
                alert('No events could be extracted from the text. Please try reformatting or enter events manually.');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Parse error:', error);
            alert('Error parsing text: ' + error.message);
        } finally {
            parseTextBtn.disabled = false;
            parseTextBtn.innerHTML = '<span>🤖</span> Extract Events with AI';
        }
    });
    
    /**
     * Manual Event Entry
     */
    addEventBtn.addEventListener('click', addNewEvent);
    
    function addNewEvent(eventData = null) {
        eventCounter++;
        
        const template = document.getElementById('event-template');
        const clone = template.content.cloneNode(true);
        const eventCard = clone.querySelector('.event-card');
        
        eventCard.dataset.eventIndex = eventCounter;
        eventCard.querySelector('.event-number').textContent = `Event #${eventCounter}`;
        
        // Set default or provided values
        const now = new Date();
        now.setMinutes(0, 0, 0);
        now.setHours(now.getHours() + 1);
        
        const startInput = eventCard.querySelector('.event-start');
        const endInput = eventCard.querySelector('.event-end');
        
        if (eventData) {
            eventCard.querySelector('.event-title').value = eventData.title || '';
            eventCard.querySelector('.event-category').value = eventData.category || 'general';
            eventCard.querySelector('.event-location').value = eventData.location || '';
            eventCard.querySelector('.event-description').value = eventData.description || '';
            eventCard.querySelector('.event-allday').checked = eventData.all_day || false;
            
            if (eventData.start_time) {
                startInput.value = formatDateTimeLocal(new Date(eventData.start_time));
            }
            if (eventData.end_time) {
                endInput.value = formatDateTimeLocal(new Date(eventData.end_time));
            }
        } else {
            startInput.value = formatDateTimeLocal(now);
            const endTime = new Date(now);
            endTime.setHours(endTime.getHours() + 1);
            endInput.value = formatDateTimeLocal(endTime);
        }
        
        // All-day checkbox handler
        const allDayCheckbox = eventCard.querySelector('.event-allday');
        allDayCheckbox.addEventListener('change', function() {
            if (this.checked) {
                startInput.type = 'date';
                endInput.type = 'date';
                startInput.value = startInput.value.split('T')[0];
                endInput.value = endInput.value.split('T')[0];
            } else {
                startInput.type = 'datetime-local';
                endInput.type = 'datetime-local';
            }
        });
        
        // Remove button
        eventCard.querySelector('.remove-event-btn').addEventListener('click', function() {
            eventCard.remove();
            updateEventsFromCards();
        });
        
        // Update on change
        eventCard.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('change', updateEventsFromCards);
            input.addEventListener('input', updateEventsFromCards);
        });
        
        eventsContainer.appendChild(eventCard);
        eventCard.querySelector('.event-title').focus();
        
        updateEventsFromCards();
    }
    
    function updateEventsFromCards() {
        const cardEvents = [];
        
        document.querySelectorAll('.event-card').forEach(card => {
            const title = card.querySelector('.event-title').value.trim();
            const startInput = card.querySelector('.event-start');
            const endInput = card.querySelector('.event-end');
            const allDay = card.querySelector('.event-allday').checked;
            
            if (title && startInput.value && endInput.value) {
                let startTime, endTime;
                
                if (allDay) {
                    startTime = startInput.value + 'T00:00:00';
                    endTime = endInput.value + 'T23:59:59';
                } else {
                    startTime = startInput.value;
                    endTime = endInput.value;
                }
                
                cardEvents.push({
                    uid: generateUID(),
                    title: title,
                    description: card.querySelector('.event-description').value.trim(),
                    location: card.querySelector('.event-location').value.trim(),
                    category: card.querySelector('.event-category').value,
                    start_time: startTime,
                    end_time: endTime,
                    all_day: allDay
                });
            }
        });
        
        // If we have manual cards, use those
        if (document.querySelectorAll('.event-card').length > 0) {
            events = cardEvents;
        }
        
        updateEventsPreview();
        updateCreateButton();
    }
    
    /**
     * Events Preview
     */
    function updateEventsPreview() {
        if (events.length === 0) {
            eventsPreview.style.display = 'none';
            return;
        }
        
        eventsPreview.style.display = 'block';
        eventCount.textContent = events.length;
        
        // Sort by date
        const sortedEvents = [...events].sort((a, b) => 
            new Date(a.start_time) - new Date(b.start_time)
        );
        
        eventsList.innerHTML = sortedEvents.map((event, idx) => {
            const startDate = new Date(event.start_time);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const month = monthNames[startDate.getMonth()];
            const day = startDate.getDate();
            
            let timeStr = 'All Day';
            if (!event.all_day) {
                timeStr = startDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }
            
            const categoryClass = event.category || 'general';
            
            return `
                <div class="preview-event" data-event-uid="${escapeHtml(event.uid)}">
                    <div class="preview-event-main">
                        <div class="preview-date">
                            <span class="preview-month">${month}</span>
                            <span class="preview-day">${day}</span>
                            <span class="preview-time">${timeStr}</span>
                        </div>
                        <div class="preview-details">
                            <div class="preview-title-row">
                                <span class="preview-title">${escapeHtml(event.title)}</span>
                                <span class="preview-category ${categoryClass}">${event.category || 'general'}</span>
                            </div>
                            ${event.location ? `<div class="preview-location">📍 ${escapeHtml(event.location)}</div>` : ''}
                            ${event.description ? `<div class="preview-description">${escapeHtml(event.description)}</div>` : ''}
                        </div>
                    </div>
                    <div class="preview-actions">
                        <button type="button" class="delete-event-btn" data-idx="${idx}" title="Delete">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add delete handlers
        eventsList.querySelectorAll('.delete-event-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.idx);
                events.splice(idx, 1);
                updateEventsPreview();
                updateCreateButton();
            });
        });
    }
    
    /**
     * Clear Events
     */
    clearEventsBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all events?')) {
            events = [];
            eventsContainer.innerHTML = '';
            eventCounter = 0;
            updateEventsPreview();
            updateCreateButton();
            
            // Reset upload area
            uploadArea.classList.remove('success', 'error');
            uploadArea.innerHTML = `
                <div class="upload-content">
                    <div class="upload-icon">📁</div>
                    <p class="upload-text">Drag & drop any file here</p>
                    <p class="upload-subtext">Images (PNG, JPG) • PDFs • Excel • Word • Text • ICS</p>
                </div>
            `;
        }
    });
    
    /**
     * Create Button State
     */
    function updateCreateButton() {
        const hasName = calendarNameInput.value.trim().length > 0;
        const hasEvents = events.length > 0;
        createBtn.disabled = !(hasName && hasEvents);
    }
    
    calendarNameInput.addEventListener('input', updateCreateButton);
    
    /**
     * Create Calendar
     */
    createBtn.addEventListener('click', createCalendar);
    
    async function createCalendar() {
        const name = calendarNameInput.value.trim();
        const description = calendarDescInput.value.trim();
        const customSlug = customSlugInput.value.trim();
        
        if (!name || events.length === 0) {
            alert('Please enter a calendar name and add at least one event.');
            return;
        }
        
        createBtn.disabled = true;
        createBtn.textContent = 'Creating...';
        
        try {
            const response = await fetch('/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    custom_slug: customSlug,
                    events
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccessModal(data.url, data.slug);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Create error:', error);
            alert('Error creating calendar: ' + error.message);
        } finally {
            createBtn.disabled = false;
            createBtn.textContent = 'Create Shareable Calendar';
            updateCreateButton();
        }
    }
    
    /**
     * Success Modal
     */
    function showSuccessModal(url, slug) {
        const shareUrlInput = document.getElementById('share-url');
        const qrCodeDisplay = document.getElementById('qr-code-display');
        const viewCalendarBtn = document.getElementById('view-calendar-btn');
        
        shareUrlInput.value = url;
        viewCalendarBtn.href = url;
        qrCodeDisplay.innerHTML = `<img src="/c/${slug}/qr" alt="QR Code">`;
        
        successModal.classList.add('active');
        
        document.getElementById('copy-url-btn').onclick = function() {
            shareUrlInput.select();
            document.execCommand('copy');
            this.textContent = 'Copied!';
            setTimeout(() => this.textContent = 'Copy', 2000);
        };
        
        document.getElementById('create-another-btn').onclick = function() {
            window.location.reload();
        };
    }
    
    /**
     * Utilities
     */
    function formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    function generateUID() {
        return 'evt-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Initialize
    updateCreateButton();
});

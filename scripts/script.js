// DOM Elements
const steps = document.querySelectorAll('.step');
const stepContents = document.querySelectorAll('.step-content');
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const cropPreview = document.getElementById('cropPreview');
const photoGrid = document.getElementById('photoGrid');
const finalGrid = document.getElementById('finalGrid');

// Buttons
const nextStep1 = document.getElementById('nextStep1');
const nextStep2 = document.getElementById('nextStep2');
const nextStep3 = document.getElementById('nextStep3');
const backStep2 = document.getElementById('backStep2');
const backStep3 = document.getElementById('backStep3');
const backStep4 = document.getElementById('backStep4');
const printBtn = document.getElementById('printBtn');

// Sliders
const brightnessSlider = document.getElementById('brightnessSlider');
const contrastSlider = document.getElementById('contrastSlider');
const saturationSlider = document.getElementById('saturationSlider');

// State
let currentStep = 1;
let originalImage = null;
let processedImage = null;
let selectedQuality = 'standard';
let selectedBorder = 'grey'; // Default to grey border

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    // Upload area events
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // File input event
    fileInput.addEventListener('change', handleFileInput);
    
    // Navigation events
    nextStep1.addEventListener('click', () => navigateToStep(2));
    nextStep2.addEventListener('click', () => navigateToStep(3));
    nextStep3.addEventListener('click', () => navigateToStep(4));
    backStep2.addEventListener('click', () => navigateToStep(1));
    backStep3.addEventListener('click', () => navigateToStep(2));
    backStep4.addEventListener('click', () => navigateToStep(3));
    printBtn.addEventListener('click', handlePrint);
    
    // Enhancement sliders with debouncing
    const debouncedUpdate = debounce(updateImageEnhancements, 100);
    brightnessSlider.addEventListener('input', debouncedUpdate);
    contrastSlider.addEventListener('input', debouncedUpdate);
    saturationSlider.addEventListener('input', debouncedUpdate);
    
    // Initialize options
    setupPrintOptions();
    setupBorderOptions();
    
    // Initialize photo grid
    initializePhotoGrid();
    
    console.log('🚀 Passport Photo App initialized successfully!');
}

// File Handling Functions
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.style.backgroundColor = '#f0f7ff';
    uploadArea.style.borderColor = '#1a68e8';
}

function handleDragLeave() {
    uploadArea.style.backgroundColor = '';
    uploadArea.style.borderColor = 'rgba(37, 117, 252, 1)';
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.style.backgroundColor = '';
    uploadArea.style.borderColor = 'rgba(37, 117, 252, 1)';
    
    if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
}

function handleFileInput(e) {
    if (e.target.files.length) {
        handleFileSelect(e.target.files[0]);
    }
}

function handleFileSelect(file) {
    if (!validateFile(file)) {
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.onload = () => {
            previewImage.src = e.target.result;
            cropPreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            nextStep1.disabled = false;
            
            // Initialize the photo grid with the new image
            initializePhotoGrid();
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function validateFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, WEBP)');
        return false;
    }
    
    if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return false;
    }
    
    return true;
}

// Navigation Functions
function navigateToStep(step) {
    // Update steps UI
    updateStepIndicators(step);
    
    // Update content UI
    updateStepContent(step);
    
    currentStep = step;
    
    // Perform step-specific actions
    if (step === 3) {
        updatePhotoGrid();
    } else if (step === 4) {
        updateFinalGrid();
    }
}

function updateStepIndicators(step) {
    steps.forEach((s, index) => {
        if (index + 1 === step) {
            s.classList.add('active');
        } else if (index + 1 < step) {
            s.classList.remove('active');
            s.classList.add('completed');
        } else {
            s.classList.remove('active', 'completed');
        }
    });
}

function updateStepContent(step) {
    stepContents.forEach((content, index) => {
        if (index + 1 === step) {
            content.classList.add('active');
            content.hidden = false;
        } else {
            content.classList.remove('active');
            content.hidden = true;
        }
    });
}

// Grid Functions
function initializePhotoGrid() {
    photoGrid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'photo-cell';
        const img = document.createElement('img');
        img.src = cropPreview.src || '';
        img.alt = `Passport photo ${i + 1}`;
        applyBorderToImage(img, selectedBorder);
        cell.appendChild(img);
        photoGrid.appendChild(cell);
    }
}

function updatePhotoGrid() {
    const cells = photoGrid.querySelectorAll('.photo-cell img');
    const brightness = 100 + parseInt(brightnessSlider.value);
    const contrast = 100 + parseInt(contrastSlider.value);
    const saturation = 100 + parseInt(saturationSlider.value);
    
    cells.forEach(cell => {
        cell.src = cropPreview.src;
        applyEnhancements(cell, brightness, contrast, saturation);
        applyBorderToImage(cell, selectedBorder);
    });
}

function updateFinalGrid() {
    finalGrid.innerHTML = '';
    const brightness = 100 + parseInt(brightnessSlider.value);
    const contrast = 100 + parseInt(contrastSlider.value);
    const saturation = 100 + parseInt(saturationSlider.value);
    
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'photo-cell';
        const img = document.createElement('img');
        img.src = cropPreview.src;
        img.alt = `Passport photo ${i + 1}`;
        applyEnhancements(img, brightness, contrast, saturation);
        applyBorderToImage(img, selectedBorder);
        cell.appendChild(img);
        finalGrid.appendChild(cell);
    }
}

// Enhancement Functions
function updateImageEnhancements() {
    // Update slider value displays
    document.getElementById('brightnessValue').textContent = brightnessSlider.value;
    document.getElementById('contrastValue').textContent = contrastSlider.value;
    document.getElementById('saturationValue').textContent = saturationSlider.value;
    
    // Convert values for CSS filter (0-200% range)
    const brightness = 100 + parseInt(brightnessSlider.value);
    const contrast = 100 + parseInt(contrastSlider.value);
    const saturation = 100 + parseInt(saturationSlider.value);
    
    applyEnhancements(cropPreview, brightness, contrast, saturation);
    
    // If we're on step 3, update the grid as well
    if (currentStep === 3) {
        updatePhotoGrid();
    }
}

function applyEnhancements(imageElement, brightness = null, contrast = null, saturation = null) {
    // Use provided values or calculate from sliders
    const bright = brightness !== null ? brightness : (100 + parseInt(brightnessSlider.value));
    const cont = contrast !== null ? contrast : (100 + parseInt(contrastSlider.value));
    const sat = saturation !== null ? saturation : (100 + parseInt(saturationSlider.value));
    
    imageElement.style.filter = `
        brightness(${bright}%) 
        contrast(${cont}%) 
        saturate(${sat}%)
    `;
}

// Border Options Functions
function setupBorderOptions() {
    const borderButtons = document.querySelectorAll('.border-btn');
    
    borderButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            borderButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            selectedBorder = this.getAttribute('data-color');
            applyBorderToAllImages(selectedBorder);
        });
    });
}

function applyBorderToAllImages(borderColor) {
    const allImages = document.querySelectorAll('.photo-cell img');
    
    allImages.forEach(img => {
        applyBorderToImage(img, borderColor);
    });
}

function applyBorderToImage(img, borderColor) {
    // Remove all border classes
    img.classList.remove('border-grey', 'border-black', 'border-none');
    
    // Apply selected border class
    img.classList.add(`border-${borderColor}`);
}

// Print Options Functions
function setupPrintOptions() {
    const optionCards = document.querySelectorAll('.option-card');
    
    optionCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            optionCards.forEach(c => c.classList.remove('selected'));
            // Add active class to clicked card
            this.classList.add('selected');
            
            // Store selected quality
            selectedQuality = this.getAttribute('data-quality');
            console.log('Selected quality:', selectedQuality);
        });
    });
}

// Print Functions
function handlePrint() {
    const originalText = printBtn.innerHTML;
    printBtn.innerHTML = '⏳ Preparing for Print...';
    printBtn.disabled = true;

    try {
        const printContent = createPrintVersion();
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        if (!printWindow) {
            alert('Please allow popups for this site to print.');
            resetPrintButton(originalText);
            return;
        }

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Flag to prevent multiple triggers
        let hasHandledPrint = false;

        printWindow.onload = function () {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
        };

        // Handle both print and cancel
        printWindow.onafterprint = function () {
            if (!hasHandledPrint) {
                hasHandledPrint = true;
                printWindow.close();
                resetPrintButton(originalText);
            }
        };
    } catch (error) {
        console.error('Print preparation error:', error);
        alert('Error preparing print. Please try again.');
        resetPrintButton(originalText);
    }
}

function resetPrintButton(originalText) {
    printBtn.innerHTML = originalText;
    printBtn.disabled = false;
}

function createPrintVersion() {
    // Create a deep clone of the final grid
    const a4Sheet = document.getElementById('finalGrid').cloneNode(true);
    
    // Force black borders for all images in print version
    const images = a4Sheet.querySelectorAll('img');
    images.forEach(img => {
        // Remove all existing border classes
        img.classList.remove('border-grey', 'border-black', 'border-none');
        // Add black border class
        img.classList.add('border-black');
        // Set inline styles as primary method (more reliable for print)
        img.style.border = '1px solid #000000';
        img.style.boxSizing = 'border-box';
        img.style.webkitPrintColorAdjust = 'exact';
        img.style.colorAdjust = 'exact';
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Passport Photos - A4 Sheet</title>
    <meta charset="UTF-8">
    <style>
        * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        body { 
            margin: 0 !important; 
            padding: 0 !important; 
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            width: 210mm !important;
            height: 297mm !important;
        }
        
        .photo-grid {
            display: grid !important;
            grid-template-columns: repeat(5, 1fr) !important;
            grid-template-rows: repeat(5, 1fr) !important;
            gap: 2mm !important;
            width: 210mm !important;
            height: 297mm !important;
            padding: 10mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            border: 1px solid #ccc !important;
            margin: 0 auto !important;
            background: white !important;
        }
        
        .photo-cell {
            background-color: white !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            position: relative !important;
            border: none !important;
        }
        
        .photo-cell img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border: 1px solid #000000 !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        @page {
            margin: 0 !important;
            size: A4 !important;
        }
        
        @media print {
            html, body {
                width: 210mm !important;
                height: 297mm !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .photo-grid {
                width: 210mm !important;
                height: 297mm !important;
                margin: 0 !important;
                border: 1px solid #000 !important;
            }
            
            .photo-cell img {
                border: 1px solid #000000 !important;
            }
        }
    </style>
</head>
<body>
    ${a4Sheet.outerHTML}
    <script>
        // Force apply styles and wait for everything to load
        document.addEventListener('DOMContentLoaded', function() {
            // Double-check all images have borders
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.style.border = '1px solid #000000';
                img.style.boxSizing = 'border-box';
            });
            
            // Small delay to ensure all styles are applied
            setTimeout(function() {
                window.print();
            }, 500);
        });
        
        // Fallback in case DOMContentLoaded already fired
        setTimeout(function() {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.style.border = '1px solid #000000';
                img.style.boxSizing = 'border-box';
            });
            window.print();
        }, 1000);
    </script>
</body>
</html>`;
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Reset enhancement sliders to default
function resetEnhancements() {
    brightnessSlider.value = 0;
    contrastSlider.value = 0;
    saturationSlider.value = 0;
    updateImageEnhancements();
}

// Export functions for global access if needed
window.resetEnhancements = resetEnhancements;

console.log('🚀 Passport Photo App loaded successfully!');
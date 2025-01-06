const loadImages = async () => {
    const images = document.querySelectorAll('img[id]');
    try {
        const response = await fetch('images.b64.json');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const imageData = await response.json();
        images.forEach(img => {
            if (imageData[img.id]) {
                img.src = imageData[img.id];
                img.loading = 'lazy';
            }
        });
    } catch (error) {
        console.error('Image loading failed:', error);
        images.forEach(img => img.alt = 'Image failed to load');
    }
};

document.addEventListener('DOMContentLoaded', loadImages);
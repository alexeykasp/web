document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    let activeContent = null;

    const toggleAccordion = (content) => {
        if (activeContent === content) {
            content.style.maxHeight = null;
            content.style.padding = null;
            activeContent = null;
        } else {
            if (activeContent) {
                activeContent.style.maxHeight = null;
                activeContent.style.padding = null;
            }
            content.style.maxHeight = `${content.scrollHeight}px`;
            content.style.padding = '10px 20px';
            activeContent = content;
        }
    };

    accordionHeaders.forEach(header => 
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAccordion(header.nextElementSibling);y
        })
    );

    document.addEventListener('click', () => activeContent && toggleAccordion(activeContent));
});
// Utility functions for handling scroll navigation and positioning

/**
 * Scrolls to a specific element on the page with smooth animation
 * @param targetId - The ID of the element to scroll to
 * @param offset - Additional offset from the top (default: 80px for fixed header)
 */
export const scrollToElement = (targetId: string, offset: number = 80): void => {
  const element = document.getElementById(targetId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Highlight the element briefly
    highlightElement(element);
  }
};

/**
 * Highlights an element with a temporary visual effect
 * @param element - The DOM element to highlight
 */
const highlightElement = (element: HTMLElement): void => {
  // Add highlight class
  element.classList.add('notification-highlight');
  
  // Remove highlight after animation
  setTimeout(() => {
    element.classList.remove('notification-highlight');
  }, 2000);
};

/**
 * Checks if URL has a hash and scrolls to it after page load
 */
export const handleHashNavigation = (): void => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash;
    if (hash) {
      // Wait for page to render, then scroll
      setTimeout(() => {
        const targetId = hash.substring(1); // Remove the # symbol
        scrollToElement(targetId);
      }, 100);
    }
  }
};

/**
 * Generates proper anchor IDs for different content types
 */
export const generateAnchorId = (type: 'answer' | 'comment' | 'question', id: string | number): string => {
  return `${type}-${id}`;
};

/**
 * Creates a URL with hash for sharing specific content
 */
export const createContentUrl = (baseUrl: string, type: 'answer' | 'comment' | 'question', id: string | number): string => {
  const anchorId = generateAnchorId(type, id);
  return `${baseUrl}#${anchorId}`;
};

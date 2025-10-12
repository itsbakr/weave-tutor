/**
 * Format strategy markdown into beautiful HTML for TipTap editor
 * with proper spacing and structure
 */
export function formatStrategyToHTML(content: string): string {
  // Convert markdown to clean HTML with proper spacing
  let html = content;
  
  // Normalize line breaks first
  html = html.replace(/\n\n\n+/g, '\n\n');
  
  // Convert markdown to HTML structure
  const lines = html.split('\n');
  let formattedHtml = '';
  let inList = false;
  let listItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      if (inList) {
        // End the list
        formattedHtml += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>';
        listItems = [];
        inList = false;
      }
      formattedHtml += '<br>';
      continue;
    }
    
    // Headers
    if (line.startsWith('# ')) {
      if (inList) {
        formattedHtml += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>';
        listItems = [];
        inList = false;
      }
      formattedHtml += `<h1>${line.substring(2)}</h1>`;
    } else if (line.startsWith('## ')) {
      if (inList) {
        formattedHtml += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>';
        listItems = [];
        inList = false;
      }
      formattedHtml += `<h2>${line.substring(3)}</h2>`;
    } else if (line.startsWith('### ')) {
      if (inList) {
        formattedHtml += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>';
        listItems = [];
        inList = false;
      }
      formattedHtml += `<h3>${line.substring(4)}</h3>`;
    }
    // List items
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      inList = true;
      listItems.push(line.substring(2));
    }
    // Bold text
    else if (line.includes('**')) {
      if (inList) {
        formattedHtml += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>';
        listItems = [];
        inList = false;
      }
      const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formattedHtml += `<p>${formatted}</p>`;
    }
    // Regular paragraph
    else {
      if (inList) {
        formattedHtml += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>';
        listItems = [];
        inList = false;
      }
      formattedHtml += `<p>${line}</p>`;
    }
  }
  
  // Close any remaining list
  if (inList) {
    formattedHtml += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>';
  }
  
  return formattedHtml;
}


// Create PWA icons for different sizes
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const sizes = [16, 32, 64, 128, 192, 512];

// Set canvas size for the largest icon
canvas.width = 512;
canvas.height = 512;

// Draw background
ctx.fillStyle = '#3b82f6'; // Blue background
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Draw timer circle
ctx.beginPath();
ctx.arc(canvas.width/2, canvas.height/2, canvas.width/3, 0, 2 * Math.PI);
ctx.fillStyle = 'white';
ctx.fill();

// Draw timer hands
ctx.lineWidth = canvas.width/25;
ctx.lineCap = 'round';

// Minute hand
ctx.strokeStyle = '#ef4444'; // Red
ctx.beginPath();
ctx.moveTo(canvas.width/2, canvas.height/2);
ctx.lineTo(canvas.width/2, canvas.height/2 - canvas.width/4);
ctx.stroke();

// Hour hand
ctx.strokeStyle = '#10b981'; // Green
ctx.beginPath();
ctx.moveTo(canvas.width/2, canvas.height/2);
ctx.lineTo(canvas.width/2 + canvas.width/6, canvas.height/2);
ctx.stroke();

// Draw checkmark for todo list
ctx.strokeStyle = '#8b5cf6'; // Purple
ctx.lineWidth = canvas.width/25;
ctx.beginPath();
ctx.moveTo(canvas.width/2 - canvas.width/5, canvas.height/2 + canvas.width/6);
ctx.lineTo(canvas.width/2 - canvas.width/10, canvas.height/2 + canvas.width/4);
ctx.lineTo(canvas.width/2 + canvas.width/6, canvas.height/2 - canvas.width/10);
ctx.stroke();

// Function to download icons
function downloadIcons() {
  sizes.forEach(size => {
    // Create a temporary canvas for each size
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    
    // Draw the icon scaled to the current size
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0, size, size);
    
    // Create download link
    const link = document.createElement('a');
    link.download = `icon-${size}x${size}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  });
}

// Call the function to download all icons
downloadIcons();

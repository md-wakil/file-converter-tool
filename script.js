// File upload functionality
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');
        const convertBtn = document.getElementById('convertBtn');
        
        // Click on dropzone to trigger file input
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Drag and drop functionality
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#4361ee';
            dropZone.style.backgroundColor = '#f0f4ff';
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = '#ddd';
            dropZone.style.backgroundColor = 'transparent';
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#ddd';
            dropZone.style.backgroundColor = 'transparent';
            
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                updateFileInfo();
            }
        });
        
        // File input change
        fileInput.addEventListener('change', updateFileInfo);
        
        function updateFileInfo() {
            if (fileInput.files.length) {
                const file = fileInput.files[0];
                const fileSize = (file.size / (1024 * 1024)).toFixed(2);
                fileInfo.textContent = `${file.name} (${fileSize} MB)`;
                
                // Try to auto-detect file type
                const extension = file.name.split('.').pop().toLowerCase();
                const formatMap = {
                    'pdf': 'pdf',
                    'docx': 'docx',
                    'doc': 'docx',
                    'xlsx': 'xlsx',
                    'xls': 'xlsx',
                    'pptx': 'pptx',
                    'ppt': 'pptx',
                    'jpg': 'jpg',
                    'jpeg': 'jpg',
                    'png': 'png',
                    'txt': 'txt'
                };
                
                if (formatMap[extension]) {
                    document.getElementById('formatFrom').value = formatMap[extension];
                }
            } else {
                fileInfo.textContent = 'No file selected';
            }
        }
        
        // Convert button click
        convertBtn.addEventListener('click', async () => {
            // 1. Check if a file is selected
            if (!fileInput.files.length) {
                alert('Please select a file to convert first.');
                return;
            }

            const file = fileInput.files[0];
            const formatTo = document.getElementById('formatTo').value;
            const fileName = file.name.split('.')[0]; // Get filename without extension

            // 2. UI Update: Show loading state
            convertBtn.textContent = 'Converting...';
            convertBtn.disabled = true;
            fileInfo.textContent = 'Converting, please wait...';
            fileInfo.style.color = 'var(--primary)';

            // 3. Simulate a realistic delay (3 seconds)
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 4. UI Update: Show success
            fileInfo.textContent = 'Conversion complete! Downloading your file...';
            fileInfo.style.color = 'var(--success)';

            // 5. Create a fake download
            // This creates a dummy blob (a piece of fake data) with the correct filename
            const blob = new Blob(["This is a simulated file download. In the real version, this would be your converted file data."], { type: 'application/octet-stream' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${fileName}.${formatTo}`; // e.g., "MyDocument.docx"
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);

            // 6. Reset the button after a short delay
            setTimeout(() => {
                convertBtn.textContent = 'Convert Now';
                convertBtn.disabled = false;
                fileInfo.textContent = `Ready to convert again! (${file.name})`;
                fileInfo.style.color = 'inherit';
            }, 3000);

        });
        
        // FAQ accordion functionality
        function toggleAccordion(element) {
            const content = element.nextElementSibling;
            const isActive = content.classList.contains('active');
            
            // Close all accordions
            document.querySelectorAll('.accordion-content').forEach(item => {
                item.classList.remove('active');
            });
            
            document.querySelectorAll('.accordion-header span').forEach(item => {
                item.textContent = '+';
            });
            
            // Open clicked accordion if it was closed
            if (!isActive) {
                content.classList.add('active');
                element.querySelector('span').textContent = '-';
            }
        }
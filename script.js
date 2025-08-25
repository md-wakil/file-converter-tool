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
            if (!fileInput.files.length) {
                alert('Please select a file to convert first.');
                return;
            }

            const file = fileInput.files[0];
            const formatTo = document.getElementById('formatTo').value;

            // 1. UI Update: Show loading state
            convertBtn.textContent = 'Converting...';
            convertBtn.disabled = true;
            fileInfo.textContent = 'Uploading & Converting, please wait...';
            fileInfo.style.color = 'var(--primary)';

            // 2. Create a temporary download link for the file to get a URL
            // (In a real-world scenario, you'd upload this to a temporary storage first)
            const fileUrl = URL.createObjectURL(file);

            // 3. Prepare the data to send to our Vercel Function
            const payload = {
                fileName: file.name,
                fileUrl: fileUrl, // This is a simplified approach for demo purposes
                formatTo: formatTo
            };

            try {
                // 4. Call our secure Vercel API endpoint
                const response = await fetch('/api/convert', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Something went wrong');
                }

                // 5. If successful, download the file!
                fileInfo.textContent = 'Conversion complete! Downloading your file...';
                fileInfo.style.color = 'var(--success)';

                // Create a hidden link and click it to trigger the download
                const a = document.createElement('a');
                a.href = data.downloadUrl;
                a.download = file.name.split('.')[0] + '.' + formatTo;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

            } catch (error) {
                // 6. If anything fails, show the error
                console.error('Error:', error);
                fileInfo.textContent = 'Error: ' + error.message;
                fileInfo.style.color = 'red';
                alert('Conversion failed: ' + error.message);
            } finally {
                // 7. Reset the UI
                convertBtn.textContent = 'Convert Now';
                convertBtn.disabled = false;
            }
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

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
                    'doc': 'doc',
                    'xlsx': 'xlsx',
                    'xls': 'xls',
                    'pptx': 'pptx',
                    'ppt': 'ppt',
                    'jpg': 'jpg',
                    'jpeg': 'jpeg',
                    'png': 'png',
                    'txt': 'txt'
                };     
                if (formatMap[extension]) {
                    document.getElementById('formatFrom').value = formatMap[extension];
                }else{
                    document.getElementById('formatFrom').value = 'auto';
                }
                fileInfo.style.color = 'black';
            } else {
                fileInfo.textContent = 'No file selected';
                fileInfo.style.color = 'black';
            }
        }
        
        // Convert button click
        convertBtn.addEventListener('click', async () => {
            if (!fileInput.files.length || fileInfo.textContent.includes('Error: ')) {
                alert('Please select a file to convert first.');
                return;
            }
           const format4m = document.getElementById('formatFrom').value;
            if(format4m == 'auto'){
                alert('This is not a supported file format. Please select a valid file format to convert.');
                return;
            }
            const file = fileInput.files[0];
            const formatTo = document.getElementById('formatTo').value;
            
            // 1. UI Update: Show loading state
            convertBtn.textContent = 'Converting...';
            convertBtn.disabled = true;
            fileInfo.textContent = 'Uploading & Converting, please wait...';
            fileInfo.style.color = 'var(--primary)';

            // 2. Read the file as a Base64 string
            const reader = new FileReader();
            reader.readAsDataURL(file); // This encodes the file as a data URL
            reader.onload = async function() {
                // The result is a string like "data:application/pdf;base64,JVBERi0xLjQK..."
                // We split it to get just the Base64 part
                const base64String = reader.result.split(',')[1];

                // 3. Prepare the data to send to our Vercel Function
                const payload = {
                    fileName: file.name,
                    fileData: base64String, // We now send the actual file data!
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
                    alert('Conversion Failed: ' + error.message);
                } finally {
                    // 7. Reset the UI
                    convertBtn.textContent = 'Convert Now';
                    convertBtn.disabled = false;
                }
            };
            reader.onerror = function(error) {
                console.error('Error reading file:', error);
                fileInfo.textContent = 'Error reading file.';
                fileInfo.style.color = 'red';
                convertBtn.textContent = 'Convert Now';
                convertBtn.disabled = false;
            };
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







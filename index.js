const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

app.post('/upload-images', upload.array('images'), async (req, res) => {
    try {
        const apiToken = req.body.apiToken;
        const files = req.files;
        let responses = [];

        for (const file of files) {

            const fileContent = fs.readFileSync(path.join(__dirname, file.path));
            const encodedContent = fileContent.toString('base64');
            const response = await axios.post('https://api.printify.com/v1/uploads/images.json', {
                file_name: file.originalname,
                contents: encodedContent
            }, {
                headers: {
                    Authorization: `Bearer ${apiToken}`
                }
            });

            responses.push(response.data);
            fs.unlinkSync(path.join(__dirname, file.path)); // Delete the file after upload
            // const formData = new FormData();
            // formData.append('file', fs.createReadStream(path.join(__dirname, file.path)), file.originalname);

            // const response = await axios.post('https://api.printify.com/v1/uploads/images.json', formData, {
            //     headers: {
            //         ...formData.getHeaders(),
            //         Authorization: `Bearer ${apiToken}`
            //     }
            // });

            // responses.push(response.data);
            // fs.unlinkSync(path.join(__dirname, file.path)); // Delete the file after upload
        }

        res.json(responses);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading images');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

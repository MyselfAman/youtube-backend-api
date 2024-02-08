import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"  
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadCloudinary = async (localFilePath) => {

    try {
        if(!localFilePath) return null;
        console.log(localFilePath);
        // resource type = auto means it will detect the type of file by itself
        const response = await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"}); 
        console.log("File uploaded successfully on cloudinary", response.url);
        fs.unlink(localFilePath,(err) => {
            if (err) {
              console.error(`Error while unlinking file: ${err.message}`);
            } else {
              console.log('File unlinked successfully');
            }
          }); //  to remove locally saved file as operation got failed 
        return response
    } catch (error) {
        fs.unlink(localFilePath,(err) => {
            if (err) {
              console.error(`Error while unlinking file: ${err.message}`);
            } else {
              console.log('File unlinked successfully');
            }
          }); //  to remove locally saved file as operation got failed 
        return null;
    }
    
}

export {uploadCloudinary}
import mongoose from "mongoose";
import { Post } from "./models/post.model.js"; // Adjust if your Post model has a different name
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function migrateImageField() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "your-mongodb-connection-string"
    );

    // Find posts where image is still a string
    const postsToUpdate = await Post.find({
      image: { $type: "string" },
    });

    let updatedCount = 0;
    for (let post of postsToUpdate) {
      try {
        await Post.findByIdAndUpdate(post._id, {
          image: {
            url: post.image, // old string value becomes the url
            publicId: "legacy-post", // placeholder for old posts
          },
        });
        updatedCount++;
      } catch (error) {
        console.error(`Failed to update post ${post._id}:`, error);
      }
    }

    // Verify the migration
    const remainingStringPosts = await Post.find({
      image: { $type: "string" },
    });
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
}

// Run the migration
migrateImageField();

//this is to convert previously saved posts to convert into new file type

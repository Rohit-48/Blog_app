// Major configuration of Appwrite
import conf from "../conf/conf";
import { Client, Account, ID, Query } from "appwrite";
o
export class Service {
  client = new Client();
  databases;
  bucket;
  constructor() {
    this.clientw
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }
  // Create post
  async createPost({ title, slug, content, featureImage, status, userId }) {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          featureImage,
          status,
          userId,
        },
      );
    } catch (error) {
      console.log("Appwrite service:: createPost error: ", error);
    }
  }

  // Update post
  async updatePost(slug, { title, content, featureImage, status }) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          featureImage,
          status,
        },
      );
    } catch (error) {
      console.log("Appwrite service:: updatePost error: ", error);
    }
  }
  // Delete post
  async deletePost(slug) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
      );
    } catch (error) {
      console.log("Appwrite service:: deletePost error: ", error);
    }
  }

  // getPost checking if the post exists
  async getPost(slug) {
    try {
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
      );
    } catch (error) {
      console.log("Appwrite service:: getPost error: ", error);
    }
  }

  // queries which are used to get the posts
  // only active posts
  async getPosts(queries = [Query.equal("status", "active")]) {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        queries,
      );
    } catch (error) {
      console.log("Appwrite service:: getPosts error: ", error);
    }
  }

  // file upload services db 
  async uploadFile(file) {
    try {
      return await this.bucket.createFile(
        conf.appwriteBucketId,
        ID.unique(),
        file,
      );
    } catch (error) {
      console.log("Appwrite service:: uploadFile error: ", error);
      return false;
    }
  }

  // delete file
  async deleteFile(fileId) {
    try {
      await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
      return true;
    } catch (error) {
      console.log("Appwrite service:: deleteFile error: ", error);
    }
  }

  // get file It provides a direct link to preview the uploaded file.
  getFilePreview(fileId) {
    return this.bucket.getFilePreview(conf.appwriteBucketId, fileId);
  }

}

const service = new Service(); // create instance of service (object)
export default service;  // export the service instance

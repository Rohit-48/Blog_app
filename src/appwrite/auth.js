import esm from "html-react-parser";
import { Logo } from "../components";
import conf from "../conf/conf.js"; // all things are define here tho
import { Client, Account, ID } from "appwrite";

export class AuthService {
  client = new Client();
  account;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl) // the Endpoints
      .setProject(conf.appwriteProjectId); // project id that we have made
    this.account = new Account(this.client); // created account
  }

  // Create Account
  async createAccount({ email, password, name }) {
    try {
      const userAccount = await this.account.create(
        ID.unique(),
        email,
        password,
        name,
      );
      if (userAccount) {
        return this.login({ email, password });
      } else {
        console.Error("Fail to create account");
        throw Error;
      }
    } catch (error) {
      console.error("Account creation failed", error);
      throw error; // extra error handling
    }
  }

  // Login user
  async login({ email, password }) {
    const session = await this.account.createEmailSession(email, password);
    return session;
  }
  // check user is logined in
  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      console.log("Appwrite service:: GetCurrentUser", error);
    }
    return null;
  }

  async logout() {
    try {
      await this.account.deleteSessions();
    } catch (error) {
      console.log("Appwrite service :: Logout::", error);
    }
  }
}

const authService = new AuthService();
export default authService;

import { User } from "./model.user.js";
import { createApi } from "unsplash-js";

const signin = async (req, res, next) => {
   try {
      const { username, fullname, password } = req.params;

      let user = await User.findOne({ username });

      if (user) {
         throw new Error("User already exist");
      }

      user = await User.create({ username, fullname, password });

      res.status(200).json({ message: "User created", data: user });
   } catch (error) {
      next(error);
   }
};

const verifyLogin = async (req, res, next) => {
   try {
      const { username, password } = req.params;

      const user = await User.findOne({ username });

      if (!user) {
         throw new Error("User does not exist");
      }

      if (user.password != password) {
         throw new Error("Password not matched");
      }

      req.user = user;
      next();
   } catch (error) {
      next(error);
   }
};

const searchImage = async (req, res) => {
   try {
      const searchKey = req.params.q;
      const unsplash = createApi({
         accessKey: process.env.UNSPLASH_ACCESS_KEY,
      });

      const result = await unsplash.search.getPhotos({
         query: searchKey,
         page: 1,
         perPage: 2,
      });


      console.log(result.response);

      res.status(200).json({
         message: "Searched Photos",
         data: result.response.results[0],
      });

   } catch (error) {
      next(error);
   }
};

export { signin, verifyLogin, searchImage };
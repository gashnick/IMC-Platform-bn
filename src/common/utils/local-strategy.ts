import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import { comparePassword } from "./bcrypt";
import prisma from "./prisma";
import { attachToken } from "./token";

export default passport.use(new LocalStrategy(
    { usernameField: "email" },
    async function(email, password, done) {
        //get user data
        try {
            const user = await prisma.user.findUnique({
                where: { email: email}
            });
    
            if(!user)
                throw new Error("Invalid email or Password!");
    
            // check if password match also
            const isMatch = await comparePassword(password, user.password!);
            
            if(!isMatch)
                throw new Error("Invalid email or Password!");
    
            done(null, attachToken(user))

        } catch (error) {
            console.log(error)
            done(error, undefined)
        }
    }
));
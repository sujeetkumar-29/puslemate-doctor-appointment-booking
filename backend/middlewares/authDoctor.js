import jwt from "jsonwebtoken";

// Doctor authentication middleware
const authDoctor = (req, res, next) => {
    try {
        const { dtoken } = req.headers
        if (!dtoken) {
            return res.json({ success: false, message: " No AuthorisedLogin again" });
        }
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
        req.body ??= {}; // Ensure req.body is an object
        req.body.docId = token_decode.id
        req.doctor = token_decode.id;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Error in authDoctor middleware:", error);
        return res.json({ success: false, message: "Internal server error" });
    }

}
export default authDoctor
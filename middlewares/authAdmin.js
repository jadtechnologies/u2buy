import { currentUser } from "@clerk/nextjs/server";

const authAdmin = async () => {
    try {
        const user = await currentUser();
        if (!user) return false;

        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().trim();
        const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase().trim();

        return userEmail === adminEmail;
    } catch (error) {
        console.error("AUTH_ADMIN ERROR:", error);
        return false;
    }
}

export default authAdmin;
